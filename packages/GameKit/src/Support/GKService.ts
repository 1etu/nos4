import { GKError, type GKErrorValue, type GKResult } from './GKTypes'
import { GKMetrics, GKServiceOrigin } from './GKMetrics'

const ErrorCodes: Readonly<Record<string, GKErrorValue>> = {
  invalid_credentials: GKError.invalidCredential,
  invalid_session: GKError.notAuthenticated,
  weak_password: GKError.weakPassword,
  alias_taken: GKError.aliasTaken,
  alias_shape: GKError.aliasInvalid,
  alias_reserved: GKError.aliasInvalid,
  alias_rejected: GKError.aliasInvalid,
  rate_limited: GKError.rateLimited
}

const failureFor = (status: number, body: unknown): GKErrorValue => {
  const code =
    typeof body === 'object' && body !== null && 'error' in body
      ? (body as { error?: { code?: unknown } }).error?.code
      : undefined
  if (typeof code === 'string' && ErrorCodes[code]) return ErrorCodes[code]
  if (status === 401) return GKError.notAuthenticated
  if (status === 429) return GKError.rateLimited
  return GKError.server
}

export const gkRequest = async <T>(
  method: string,
  path: string,
  body: object | undefined,
  token: string | undefined
): Promise<GKResult<T>> => {
  const controller = new AbortController()
  const bell = setTimeout(() => controller.abort(), GKMetrics.requestTimeoutMilliseconds)

  try {
    const headers: Record<string, string> = {}
    if (body) headers['content-type'] = 'application/json'
    if (token) headers.authorization = `Bearer ${token}`

    const response = await fetch(`${GKServiceOrigin}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    })

    const text = await response.text()
    const parsed: unknown = text === '' ? undefined : JSON.parse(text)

    if (!response.ok) return { ok: false, error: failureFor(response.status, parsed) }
    return { ok: true, value: parsed as T }
  } catch (failure) {
    const aborted = failure instanceof DOMException && failure.name === 'AbortError'
    return { ok: false, error: aborted ? GKError.timeout : GKError.network }
  } finally {
    clearTimeout(bell)
  }
}
