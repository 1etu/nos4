import { deflateSync, inflateRawSync } from 'node:zlib'

const Signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const BytesPerPixel = 4

const crcTable = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = (c & 1) === 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

const crc32 = (buffer: Buffer): number => {
  let c = -1
  for (let i = 0; i < buffer.length; i += 1) {
    c = (crcTable[(c ^ buffer[i]!) & 0xff] ?? 0) ^ (c >>> 8)
  }
  return (c ^ -1) >>> 0
}

interface Chunk {
  readonly type: string
  readonly data: Buffer
}

const readChunks = (png: Buffer): Chunk[] => {
  const chunks: Chunk[] = []
  let offset = 8
  while (offset + 8 <= png.length) {
    const length = png.readUInt32BE(offset)
    const type = png.toString('latin1', offset + 4, offset + 8) //latin1 cp1
    chunks.push({ type, data: png.subarray(offset + 8, offset + 8 + length) })
    offset += 12 + length
    if (type === 'IEND') break
  }
  return chunks
}

const chunk = (type: string, data: Buffer): Buffer => {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]) //latin1 cp2
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

const paeth = (a: number, b: number, c: number): number => {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  if (pa <= pb && pa <= pc) return a
  return pb <= pc ? b : c
}

export const isCgBI = (png: Buffer): boolean =>
  png.length > 16 && png.toString('latin1', 12, 16) === 'CgBI'

export const decodeCgBI = (png: Buffer): Buffer => {
  const chunks = readChunks(png)
  const ihdr = chunks.find((entry) => entry.type === 'IHDR')
  if (!ihdr) throw new Error('missing IHDR')

  const width = ihdr.data.readUInt32BE(0)
  const height = ihdr.data.readUInt32BE(4)
  const bitDepth = ihdr.data.readUInt8(8)
  const colorType = ihdr.data.readUInt8(9)
  const interlace = ihdr.data.readUInt8(12)
  if (bitDepth !== 8 || colorType !== 6 || interlace !== 0) {
    throw new Error(`unsupported depth ${bitDepth} colorType ${colorType} interlace ${interlace}`)
  }

  const raw = inflateRawSync(
    Buffer.concat(chunks.filter((entry) => entry.type === 'IDAT').map((entry) => entry.data))
  )

  const stride = width * BytesPerPixel
  const pixels = Buffer.alloc(height * stride)
  let position = 0

  for (let y = 0; y < height; y += 1) {
    const filter = raw[position] ?? 0
    position += 1
    const line = raw.subarray(position, position + stride)
    position += stride
    const rowStart = y * stride
    for (let x = 0; x < stride; x += 1) {
      const source = line[x] ?? 0
      const left = x >= BytesPerPixel ? (pixels[rowStart + x - BytesPerPixel] ?? 0) : 0
      const up = y > 0 ? (pixels[rowStart - stride + x] ?? 0) : 0
      const upLeft =
        y > 0 && x >= BytesPerPixel ? (pixels[rowStart - stride + x - BytesPerPixel] ?? 0) : 0
      let value = source
      if (filter === 1) value = source + left
      else if (filter === 2) value = source + up
      else if (filter === 3) value = source + ((left + up) >> 1)
      else if (filter === 4) value = source + paeth(left, up, upLeft)
      pixels[rowStart + x] = value & 0xff
    }
  }

  for (let i = 0; i < pixels.length; i += BytesPerPixel) {
    const blue = pixels[i] ?? 0
    const green = pixels[i + 1] ?? 0
    const red = pixels[i + 2] ?? 0
    const alpha = pixels[i + 3] ?? 0
    if (alpha > 0 && alpha < 255) {
      pixels[i] = Math.min(255, Math.round((red * 255) / alpha))
      pixels[i + 1] = Math.min(255, Math.round((green * 255) / alpha))
      pixels[i + 2] = Math.min(255, Math.round((blue * 255) / alpha))
      continue
    }
    pixels[i] = red
    pixels[i + 2] = blue
  }

  const filtered = Buffer.alloc(height * (stride + 1))
  for (let y = 0; y < height; y += 1) {
    filtered[y * (stride + 1)] = 0
    pixels.copy(filtered, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  return Buffer.concat([
    Signature,
    chunk('IHDR', Buffer.from(ihdr.data)),
    chunk('IDAT', deflateSync(filtered, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ])
}
