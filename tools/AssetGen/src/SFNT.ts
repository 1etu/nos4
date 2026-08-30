const KeepTables = new Set([
  'cmap',
  'cvt ',
  'fpgm',
  'gasp',
  'glyf',
  'head',
  'hhea',
  'hmtx',
  'loca',
  'maxp',
  'name',
  'OS/2',
  'post',
  'prep',
  'CFF ',
  'GSUB',
  'GPOS'
])

const pad4 = (value: number): number => (value + 3) & ~3

const checksum = (data: Buffer): number => {
  let sum = 0
  const padded = pad4(data.length)
  for (let i = 0; i < padded; i += 4) {
    const b0 = data[i] ?? 0
    const b1 = data[i + 1] ?? 0
    const b2 = data[i + 2] ?? 0
    const b3 = data[i + 3] ?? 0
    sum = (sum + ((b0 << 24) | (b1 << 16) | (b2 << 8) | b3)) >>> 0
  }
  return sum >>> 0
}

export const sanitizeSFNT = (font: Buffer): Buffer => {
  if (font.length < 12) return font
  const numTables = font.readUInt16BE(4)

  const kept: { tag: string; data: Buffer }[] = []
  for (let i = 0; i < numTables; i += 1) {
    const record = 12 + i * 16
    if (record + 16 > font.length) break
    const tag = font.toString('latin1', record, record + 4)
    if (!KeepTables.has(tag)) continue
    const offset = font.readUInt32BE(record + 8)
    const length = font.readUInt32BE(record + 12)
    if (offset + length > font.length) continue
    kept.push({ tag, data: Buffer.from(font.subarray(offset, offset + length)) })
  }

  if (kept.length === 0 || kept.length === numTables) return font

  kept.sort((a, b) => (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0))

  const count = kept.length
  const header = Buffer.alloc(12 + count * 16)
  header.writeUInt32BE(font.readUInt32BE(0), 0)
  header.writeUInt16BE(count, 4)
  const power = Math.floor(Math.log2(count))
  const searchRange = 16 * 2 ** power
  header.writeUInt16BE(searchRange, 6)
  header.writeUInt16BE(power, 8)
  header.writeUInt16BE(count * 16 - searchRange, 10)

  let offset = header.length
  const body: Buffer[] = []
  kept.forEach((table, index) => {
    const record = 12 + index * 16
    header.write(table.tag, record, 4, 'latin1')
    header.writeUInt32BE(checksum(table.data), record + 4)
    header.writeUInt32BE(offset, record + 8)
    header.writeUInt32BE(table.data.length, record + 12)
    const padding = pad4(table.data.length) - table.data.length
    body.push(table.data)
    if (padding > 0) body.push(Buffer.alloc(padding))
    offset += pad4(table.data.length)
  })

  const rebuilt = Buffer.concat([header, ...body])

  const headIndex = kept.findIndex((table) => table.tag === 'head')
  if (headIndex >= 0) {
    const headOffset = rebuilt.readUInt32BE(12 + headIndex * 16 + 8)
    rebuilt.writeUInt32BE(0, headOffset + 8)
    const adjustment = (0xb1b0afba - checksum(rebuilt)) >>> 0
    rebuilt.writeUInt32BE(adjustment, headOffset + 8)
  }

  return rebuilt
}
