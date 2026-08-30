interface TableRecord {
  readonly off: number
  readonly len: number
}

const OnCurve = 0x01
const XShort = 0x02
const YShort = 0x04
const Repeat = 0x08
const XSame = 0x10
const YSame = 0x20

export interface GlyphPath {
  readonly path: string
  readonly width: number
  readonly height: number
  readonly unitsPerEm: number
}

const tables = (font: Buffer): Record<string, TableRecord> => {
  const found: Record<string, TableRecord> = {}
  const count = font.readUInt16BE(4)
  for (let i = 0; i < count; i += 1) {
    const record = 12 + i * 16
    const tag = font.toString('latin1', record, record + 4).trim()
    found[tag] = { off: font.readUInt32BE(record + 8), len: font.readUInt32BE(record + 12) }
  }
  return found
}

const glyphIdFor = (font: Buffer, cmapOffset: number, codepoint: number): number => {
  const count = font.readUInt16BE(cmapOffset + 2)
  let sub = 0
  for (let i = 0; i < count; i += 1) {
    const record = cmapOffset + 4 + i * 8
    const candidate = cmapOffset + font.readUInt32BE(record + 4)
    if (font.readUInt16BE(candidate) === 4) sub = candidate
  }
  if (sub === 0) return 0

  const segX2 = font.readUInt16BE(sub + 6)
  const endO = sub + 14
  const startO = endO + segX2 + 2
  const deltaO = startO + segX2
  const rangeO = deltaO + segX2

  for (let s = 0; s < segX2 / 2; s += 1) {
    const end = font.readUInt16BE(endO + s * 2)
    if (codepoint > end) continue
    const start = font.readUInt16BE(startO + s * 2)
    if (codepoint < start) return 0
    const delta = font.readInt16BE(deltaO + s * 2)
    const rangeOffset = font.readUInt16BE(rangeO + s * 2)
    if (rangeOffset === 0) return (codepoint + delta) & 0xffff
    const at = rangeO + s * 2 + rangeOffset + (codepoint - start) * 2
    const glyph = font.readUInt16BE(at)
    return glyph === 0 ? 0 : (glyph + delta) & 0xffff
  }
  return 0
}

export const glyphOutline = (font: Buffer, codepoint: number): GlyphPath | undefined => {
  const table = tables(font)
  const head = table.head
  const maxp = table.maxp
  const loca = table.loca
  const glyf = table.glyf
  const cmap = table.cmap
  if (!head || !maxp || !loca || !glyf || !cmap) return undefined

  const unitsPerEm = font.readUInt16BE(head.off + 18)
  const longLoca = font.readInt16BE(head.off + 50) === 1
  const numGlyphs = font.readUInt16BE(maxp.off + 4)
  const gid = glyphIdFor(font, cmap.off, codepoint)
  if (gid === 0 || gid >= numGlyphs) return undefined

  const locate = (index: number): number =>
    longLoca ? font.readUInt32BE(loca.off + index * 4) : font.readUInt16BE(loca.off + index * 2) * 2

  const start = locate(gid)
  const end = locate(gid + 1)
  if (end <= start) return undefined

  let cursor = glyf.off + start
  const contourCount = font.readInt16BE(cursor)
  if (contourCount < 0) return undefined

  const xMin = font.readInt16BE(cursor + 2)
  const yMin = font.readInt16BE(cursor + 4)
  const xMax = font.readInt16BE(cursor + 6)
  const yMax = font.readInt16BE(cursor + 8)
  cursor += 10

  const endPts: number[] = []
  for (let i = 0; i < contourCount; i += 1) {
    endPts.push(font.readUInt16BE(cursor))
    cursor += 2
  }
  const pointCount = (endPts[contourCount - 1] ?? -1) + 1
  cursor += 2 + font.readUInt16BE(cursor)

  const flags: number[] = []
  while (flags.length < pointCount) {
    const flag = font.readUInt8(cursor)
    cursor += 1
    flags.push(flag)
    if ((flag & Repeat) !== 0) {
      let repeats = font.readUInt8(cursor)
      cursor += 1
      while (repeats > 0 && flags.length < pointCount) {
        flags.push(flag)
        repeats -= 1
      }
    }
  }

  const xs: number[] = []
  let x = 0
  for (const flag of flags) {
    if ((flag & XShort) !== 0) {
      const delta = font.readUInt8(cursor)
      cursor += 1
      x += (flag & XSame) !== 0 ? delta : -delta
    } else if ((flag & XSame) === 0) {
      x += font.readInt16BE(cursor)
      cursor += 2
    }
    xs.push(x)
  }

  const ys: number[] = []
  let y = 0
  for (const flag of flags) {
    if ((flag & YShort) !== 0) {
      const delta = font.readUInt8(cursor)
      cursor += 1
      y += (flag & YSame) !== 0 ? delta : -delta
    } else if ((flag & YSame) === 0) {
      y += font.readInt16BE(cursor)
      cursor += 2
    }
    ys.push(y)
  }

  const round = (value: number): number => Math.round(value * 100) / 100
  const px = (index: number): number => round((xs[index] ?? 0) - xMin)
  const py = (index: number): number => round(yMax - (ys[index] ?? 0))
  const onCurve = (index: number): boolean => ((flags[index] ?? 0) & OnCurve) !== 0

  const segments: string[] = []
  let first = 0
  for (const last of endPts) {
    const count = last - first + 1
    if (count <= 0) {
      first = last + 1
      continue
    }
    const at = (i: number): number => first + ((i % count) + count) % count

    let startIndex = 0
    while (startIndex < count && !onCurve(at(startIndex))) startIndex += 1

    if (startIndex === count) {
      const midX = round((px(at(0)) + px(at(1))) / 2)
      const midY = round((py(at(0)) + py(at(1))) / 2)
      segments.push(`M${midX} ${midY}`)
    } else {
      segments.push(`M${px(at(startIndex))} ${py(at(startIndex))}`)
    }

    let i = startIndex + 1
    while (i <= startIndex + count) {
      const index = at(i)
      if (onCurve(index)) {
        segments.push(`L${px(index)} ${py(index)}`)
        i += 1
        continue
      }
      const nextIndex = at(i + 1)
      const endX = onCurve(nextIndex) ? px(nextIndex) : round((px(index) + px(nextIndex)) / 2)
      const endY = onCurve(nextIndex) ? py(nextIndex) : round((py(index) + py(nextIndex)) / 2)
      segments.push(`Q${px(index)} ${py(index)} ${endX} ${endY}`)
      i += onCurve(nextIndex) ? 2 : 1
    }
    segments.push('Z')
    first = last + 1
  }

  return {
    path: segments.join(' '),
    width: xMax - xMin,
    height: yMax - yMin,
    unitsPerEm
  }
}
