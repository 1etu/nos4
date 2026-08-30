import { GameCenterMetrics } from '../Support/GameCenterMetrics.ts'

export const BodyOversize = 'oversize'
export const BodyMalformed = 'malformed'

export type BodyFailure = typeof BodyOversize | typeof BodyMalformed

export type BodyResult =
  | { readonly ok: true; readonly value: Record<string, unknown> }
  | { readonly ok: false; readonly failure: BodyFailure }

const declaredLengthExceedsCap = (request: Request): boolean => {
  const declared = request.headers.get('content-length')
  if (declared === null) return false
  return Number(declared) > GameCenterMetrics.maximumRequestBodyBytes
}

const readCapped = async (request: Request): Promise<string | undefined> => {
  const stream = request.body
  if (!stream) return ''

  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let total = 0
  let text = ''

  for (;;) {
    const chunk = await reader.read()
    if (chunk.done) break
    total += chunk.value.byteLength
    if (total > GameCenterMetrics.maximumRequestBodyBytes) {
      await reader.cancel()
      return undefined
    }
    text += decoder.decode(chunk.value, { stream: true })
  }
  return text + decoder.decode()
}

export const isJsonRequest = (request: Request): boolean =>
  (request.headers.get('content-type') ?? '').includes('application/json')

export const readJsonBody = async (request: Request): Promise<BodyResult> => {
  if (declaredLengthExceedsCap(request)) return { ok: false, failure: BodyOversize }

  const text = await readCapped(request)
  if (text === undefined) return { ok: false, failure: BodyOversize }

  try {
    const parsed: unknown = JSON.parse(text)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { ok: false, failure: BodyMalformed }
    }
    return { ok: true, value: parsed as Record<string, unknown> }
  } catch {
    return { ok: false, failure: BodyMalformed }
  }
}

export const readString = (body: Record<string, unknown>, key: string): string | undefined => {
  const value = body[key]
  return typeof value === 'string' ? value : undefined
}

export const readInteger = (body: Record<string, unknown>, key: string): number | undefined => {
  const value = body[key]
  if (typeof value !== 'number' || !Number.isInteger(value)) return undefined
  return value
}
