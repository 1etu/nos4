export interface AVPCMDescription {
  readonly sampleRate: number
  readonly channels: number
  readonly bitsPerChannel: number
  readonly bigEndian: boolean
  readonly float: boolean
  readonly data: DataView
}

const fourCC = (view: DataView, at: number): string =>
  String.fromCharCode(
    view.getUint8(at),
    view.getUint8(at + 1),
    view.getUint8(at + 2),
    view.getUint8(at + 3)
  )

const extendedFloat = (view: DataView, at: number): number => {
  const exponent = ((view.getUint8(at) & 0x7f) << 8) | view.getUint8(at + 1)
  const high = view.getUint32(at + 2)
  const low = view.getUint32(at + 6)
  const mantissa = high * 4294967296 + low
  const value = mantissa * Math.pow(2, exponent - 16383 - 63)
  return view.getUint8(at) & 0x80 ? -value : value
}

const readAIFF = (view: DataView): AVPCMDescription | undefined => {
  if (fourCC(view, 0) !== 'FORM') return undefined
  const form = fourCC(view, 8)
  if (form !== 'AIFF' && form !== 'AIFC') return undefined

  let sampleRate = 0
  let channels = 0
  let bitsPerChannel = 0
  let data: DataView | undefined
  let at = 12

  while (at + 8 <= view.byteLength) {
    const id = fourCC(view, at)
    const size = view.getUint32(at + 4)
    const body = at + 8

    if (id === 'COMM') {
      channels = view.getInt16(body)
      bitsPerChannel = view.getInt16(body + 6)
      sampleRate = extendedFloat(view, body + 8)
    }

    if (id === 'SSND') {
      const offset = view.getUint32(body)
      const start = body + 8 + offset
      const length = Math.max(0, Math.min(size - 8 - offset, view.byteLength - start))
      data = new DataView(view.buffer, view.byteOffset + start, length)
    }

    at = body + size + (size % 2)
  }

  if (!data || channels === 0 || sampleRate === 0) return undefined
  return { sampleRate, channels, bitsPerChannel, bigEndian: true, float: false, data }
}

const readCAF = (view: DataView): AVPCMDescription | undefined => {
  if (fourCC(view, 0) !== 'caff') return undefined

  let sampleRate = 0
  let channels = 0
  let bitsPerChannel = 0
  let bigEndian = false
  let float = false
  let packed = true
  let data: DataView | undefined
  let at = 8

  while (at + 12 <= view.byteLength) {
    const id = fourCC(view, at)
    const declared = Number(view.getBigInt64(at + 4))
    const body = at + 12
    const size = declared < 0 ? view.byteLength - body : declared

    if (id === 'desc') {
      sampleRate = view.getFloat64(body)
      if (fourCC(view, body + 8) !== 'lpcm') return undefined
      const flags = view.getUint32(body + 12)
      float = (flags & 1) !== 0
      bigEndian = (flags & 2) !== 0
      packed = (flags & 8) !== 0
      channels = view.getUint32(body + 24)
      bitsPerChannel = view.getUint32(body + 28)
    }

    if (id === 'data') {
      const start = body + 4
      const length = Math.max(0, Math.min(size - 4, view.byteLength - start))
      data = new DataView(view.buffer, view.byteOffset + start, length)
    }

    at = body + size
  }

  if (!data || channels === 0 || sampleRate === 0) return undefined
  if (!packed && bitsPerChannel !== 16 && bitsPerChannel !== 32) return undefined
  return { sampleRate, channels, bitsPerChannel, bigEndian, float, data }
}

export const avReadPCM = (bytes: ArrayBuffer): AVPCMDescription | undefined => {
  if (bytes.byteLength < 16) return undefined
  const view = new DataView(bytes)
  return readAIFF(view) ?? readCAF(view)
}

const sampleAt = (
  description: AVPCMDescription,
  index: number
): number => {
  const { data, bitsPerChannel, bigEndian, float } = description
  if (float) return data.getFloat32(index * 4, !bigEndian)
  if (bitsPerChannel === 8) return (data.getInt8(index) ?? 0) / 128
  if (bitsPerChannel === 16) return data.getInt16(index * 2, !bigEndian) / 32768
  if (bitsPerChannel === 32) return data.getInt32(index * 4, !bigEndian) / 2147483648
  if (bitsPerChannel === 24) {
    const at = index * 3
    const high = bigEndian ? data.getUint8(at) : data.getUint8(at + 2)
    const mid = data.getUint8(at + 1)
    const low = bigEndian ? data.getUint8(at + 2) : data.getUint8(at)
    const raw = (high << 16) | (mid << 8) | low
    return (raw >= 0x800000 ? raw - 0x1000000 : raw) / 8388608
  }
  return 0
}

export const avMakeAudioBuffer = (
  engine: BaseAudioContext,
  description: AVPCMDescription
): AudioBuffer | undefined => {
  const bytesPerSample = description.float ? 4 : description.bitsPerChannel / 8
  if (bytesPerSample <= 0) return undefined

  const total = Math.floor(description.data.byteLength / bytesPerSample)
  const frames = Math.floor(total / description.channels)
  if (frames <= 0) return undefined

  const buffer = engine.createBuffer(description.channels, frames, description.sampleRate)
  for (let channel = 0; channel < description.channels; channel += 1) {
    const target = buffer.getChannelData(channel)
    for (let frame = 0; frame < frames; frame += 1) {
      target[frame] = sampleAt(description, frame * description.channels + channel)
    }
  }
  return buffer
}
