export const CKCameraIdentity = {
  make: 'Apple',
  model: 'iPhone 5s',
  software: '7.0',
  lensModel: 'iPhone 5s back camera 4.15mm f/2.2',
  focalLength: [415, 100],
  focalLength35mm: 30,
  aperture: [11, 5]
} as const

export interface CKExposure {
  readonly iso: number
  readonly shutter: readonly [number, number]
}

const IsoSteps = [32, 40, 50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800] as const
const ShutterSteps = [15, 20, 24, 30, 40, 60, 120, 250, 500, 1000, 2000, 4000] as const
const MidLuminance = 100
const BrightLevelsPerStop = 22
const DarkLevelsPerStop = 16
const BaseShutter = 120
const HandheldShutterStops = 2
const DarkShutter = 15
const IsoStops = Math.log2(IsoSteps[IsoSteps.length - 1]! / IsoSteps[0])

const nearest = (steps: readonly number[], value: number): number =>
  steps.reduce((best, step) => (Math.abs(step - value) < Math.abs(best - value) ? step : best))

export const ckEstimateExposure = (meanLuminance: number): CKExposure => {
  if (meanLuminance >= MidLuminance) {
    const stops = (meanLuminance - MidLuminance) / BrightLevelsPerStop
    return { iso: IsoSteps[0], shutter: [1, nearest(ShutterSteps, BaseShutter * 2 ** stops)] }
  }
  const needed = (MidLuminance - meanLuminance) / DarkLevelsPerStop
  const shutterStops = Math.min(needed / 2, HandheldShutterStops)
  const isoStops = Math.min(needed - shutterStops, IsoStops)
  const starved = needed - shutterStops - isoStops > 0
  const shutter = starved ? DarkShutter : nearest(ShutterSteps, BaseShutter / 2 ** shutterStops)
  return { iso: nearest(IsoSteps, IsoSteps[0] * 2 ** isoStops), shutter: [1, shutter] }
}

const Type = { byte: 1, ascii: 2, short: 3, long: 4, rational: 5, undefined: 7 } as const

interface Entry {
  readonly tag: number
  readonly type: number
  readonly count: number
  readonly bytes: Uint8Array
}

const ascii = (tag: number, text: string): Entry => {
  const bytes = new TextEncoder().encode(`${text}\0`)
  return { tag, type: Type.ascii, count: bytes.length, bytes }
}

const undefinedBytes = (tag: number, values: readonly number[]): Entry => ({
  tag,
  type: Type.undefined,
  count: values.length,
  bytes: Uint8Array.from(values)
})

const short = (tag: number, value: number): Entry => {
  const bytes = new Uint8Array(2)
  new DataView(bytes.buffer).setUint16(0, value)
  return { tag, type: Type.short, count: 1, bytes }
}

const long = (tag: number, value: number): Entry => {
  const bytes = new Uint8Array(4)
  new DataView(bytes.buffer).setUint32(0, value)
  return { tag, type: Type.long, count: 1, bytes }
}

const rationals = (tag: number, values: readonly (readonly [number, number])[]): Entry => {
  const bytes = new Uint8Array(values.length * 8)
  const view = new DataView(bytes.buffer)
  values.forEach(([numerator, denominator], index) => {
    view.setUint32(index * 8, numerator)
    view.setUint32(index * 8 + 4, denominator)
  })
  return { tag, type: Type.rational, count: values.length, bytes }
}

const rational = (tag: number, value: readonly [number, number]): Entry => rationals(tag, [value])

const ifdSize = (entries: readonly Entry[]): number => {
  let size = 2 + entries.length * 12 + 4
  for (const entry of entries) if (entry.bytes.length > 4) size += entry.bytes.length + (entry.bytes.length % 2)
  return size
}

const writeIFD = (view: DataView, bytes: Uint8Array, start: number, entries: readonly Entry[]): number => {
  const sorted = [...entries].sort((a, b) => a.tag - b.tag)
  view.setUint16(start, sorted.length)
  let cursor = start + 2
  let data = start + 2 + sorted.length * 12 + 4
  for (const entry of sorted) {
    view.setUint16(cursor, entry.tag)
    view.setUint16(cursor + 2, entry.type)
    view.setUint32(cursor + 4, entry.count)
    if (entry.bytes.length > 4) {
      view.setUint32(cursor + 8, data)
      bytes.set(entry.bytes, data)
      data += entry.bytes.length + (entry.bytes.length % 2)
    } else {
      bytes.set(entry.bytes, cursor + 8)
    }
    cursor += 12
  }
  view.setUint32(cursor, 0)
  return data
}

const exifDate = (date: Date): string => {
  const pad = (value: number) => `${value}`.padStart(2, '0')
  return `${date.getFullYear()}:${pad(date.getMonth() + 1)}:${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export interface CKPhotoDetails {
  readonly width: number
  readonly height: number
  readonly date: Date
  readonly exposure: CKExposure
}

export const ckBuildExif = (details: CKPhotoDetails): Uint8Array => {
  const identity = CKCameraIdentity
  const stamp = exifDate(details.date)
  const [focalNumerator, focalDenominator] = identity.focalLength
  const [apertureNumerator, apertureDenominator] = identity.aperture
  const exifEntries: Entry[] = [
    rational(0x829a, details.exposure.shutter),
    rational(0x829d, [apertureNumerator, apertureDenominator]),
    short(0x8822, 2),
    short(0x8827, details.exposure.iso),
    undefinedBytes(0x9000, [0x30, 0x32, 0x32, 0x31]),
    ascii(0x9003, stamp),
    ascii(0x9004, stamp),
    undefinedBytes(0x9101, [1, 2, 3, 0]),
    short(0x9207, 5),
    short(0x9209, 16),
    rational(0x920a, [focalNumerator, focalDenominator]),
    undefinedBytes(0xa000, [0x30, 0x31, 0x30, 0x30]),
    short(0xa001, 1),
    long(0xa002, details.width),
    long(0xa003, details.height),
    short(0xa217, 2),
    undefinedBytes(0xa301, [1]),
    short(0xa402, 0),
    short(0xa403, 0),
    short(0xa405, identity.focalLength35mm),
    short(0xa406, 0),
    rationals(0xa432, [
      [focalNumerator, focalDenominator],
      [focalNumerator, focalDenominator],
      [apertureNumerator, apertureDenominator],
      [apertureNumerator, apertureDenominator]
    ]),
    ascii(0xa433, identity.make),
    ascii(0xa434, identity.lensModel)
  ]
  const zeroEntries: Entry[] = [
    ascii(0x010f, identity.make),
    ascii(0x0110, identity.model),
    short(0x0112, 1),
    rational(0x011a, [72, 1]),
    rational(0x011b, [72, 1]),
    short(0x0128, 2),
    ascii(0x0131, identity.software),
    ascii(0x0132, stamp),
    short(0x0213, 1),
    long(0x8769, 0)
  ]
  const zeroStart = 8
  const exifStart = zeroStart + ifdSize(zeroEntries)
  const total = exifStart + ifdSize(exifEntries)
  const pointer = zeroEntries.findIndex((entry) => entry.tag === 0x8769)
  zeroEntries[pointer] = long(0x8769, exifStart)

  const bytes = new Uint8Array(total)
  const view = new DataView(bytes.buffer)
  bytes.set([0x4d, 0x4d, 0x00, 0x2a], 0)
  view.setUint32(4, zeroStart)
  writeIFD(view, bytes, zeroStart, zeroEntries)
  writeIFD(view, bytes, exifStart, exifEntries)
  return bytes
}

export const ckEmbedExif = (jpeg: Uint8Array, exif: Uint8Array): Uint8Array<ArrayBuffer> => {
  if (jpeg.length < 4 || jpeg[0] !== 0xff || jpeg[1] !== 0xd8) throw new Error('Not a JPEG.')
  const header = new TextEncoder().encode('Exif\0\0')
  const length = 2 + header.length + exif.length
  if (length > 0xffff) throw new RangeError('EXIF segment too large.')
  const segment = new Uint8Array(4 + header.length + exif.length)
  segment.set([0xff, 0xe1, length >> 8, length & 0xff], 0)
  segment.set(header, 4)
  segment.set(exif, 4 + header.length)
  const output = new Uint8Array(new ArrayBuffer(jpeg.length + segment.length))
  output.set(jpeg.subarray(0, 2), 0)
  output.set(segment, 2)
  output.set(jpeg.subarray(2), 2 + segment.length)
  return output
}

export const ckMeanLuminance = (pixels: Uint8ClampedArray): number => {
  const step = 16
  let sum = 0
  let samples = 0
  for (let offset = 0; offset + 2 < pixels.length; offset += 4 * step) {
    sum += 0.299 * pixels[offset]! + 0.587 * pixels[offset + 1]! + 0.114 * pixels[offset + 2]!
    samples += 1
  }
  return samples === 0 ? 0 : sum / samples
}
