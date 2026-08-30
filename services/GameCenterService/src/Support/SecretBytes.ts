const HmacKeyBytes = 32
const Uint32Bits = 32

export type ByteArray = Uint8Array<ArrayBuffer>

export const randomBytes = (length: number): ByteArray => {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return bytes
}

export const randomInteger = (bits: number): number => {
  const view = new DataView(randomBytes(Uint32Array.BYTES_PER_ELEMENT).buffer)
  return view.getUint32(0) >>> (Uint32Bits - bits)
}

export const toBase64Url = (bytes: ByteArray): string => {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

export const fromBase64Url = (value: string): ByteArray => {
  const binary = atob(value.replaceAll('-', '+').replaceAll('_', '/'))
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes
}

export const fromUtf8 = (value: string): ByteArray => new TextEncoder().encode(value)

export const sha256 = async (bytes: ByteArray): Promise<ByteArray> =>
  new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))

export const secretsMatch = async (left: ByteArray, right: ByteArray): Promise<boolean> => {
  const key = await crypto.subtle.importKey(
    'raw',
    randomBytes(HmacKeyBytes),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const leftMac = new Uint8Array(await crypto.subtle.sign('HMAC', key, left))
  const rightMac = new Uint8Array(await crypto.subtle.sign('HMAC', key, right))
  return toBase64Url(leftMac) === toBase64Url(rightMac)
}
