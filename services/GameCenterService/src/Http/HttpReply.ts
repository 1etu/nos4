import { GameCenterErrors, type GameCenterErrorCode } from '../Support/GameCenterTypes.ts'
import { GameCenterMetrics } from '../Support/GameCenterMetrics.ts'

const ErrorMessages: Readonly<Record<GameCenterErrorCode, string>> = {
  malformed_body: 'The request could not be understood.',
  unsupported_media_type: 'The request must be JSON.',
  body_too_large: 'The request was too large.',
  origin_not_allowed: 'This origin is not permitted.',
  not_found: 'There is nothing here.',
  method_not_allowed: 'That method is not allowed here.',
  internal_error: 'Something went wrong. Try again.',
  rate_limited: 'Too many attempts. Try again shortly.',
  weak_password: 'Passwords must be at least eight characters.',
  invalid_credentials: 'That nickname or password is incorrect.',
  invalid_session: 'Sign in again to continue.',
  status_too_long: 'That status is too long.',
  alias_missing: 'No alias was supplied.',
  alias_shape: 'Use 3 to 15 letters, digits, hyphens or underscores.',
  alias_reserved: 'That nickname is unavailable.',
  alias_rejected: 'That nickname is unavailable.',
  alias_taken: 'That nickname is already in use.',
  game_not_found: 'That game is not registered.',
  leaderboard_not_found: 'That leaderboard is not registered.',
  invalid_page: 'That page is out of range.',
  too_many_open_runs: 'Finish a game before starting another.',
  run_not_found: 'That game session is not available.',
  run_already_submitted: 'That game session was already scored.',
  run_expired: 'That game session expired.',
  score_out_of_range: 'That score is out of range.',
  score_rejected: 'That score could not be verified.'
}

const AllowedMethods = 'GET, POST, PATCH, PUT, DELETE, OPTIONS'
const AllowedHeaders = 'authorization, content-type'

export const jsonReply = (status: number, body: object): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  })

export const noContentReply = (): Response => new Response(null, { status: 204 })

export const errorReply = (status: number, code: GameCenterErrorCode): Response =>
  jsonReply(status, { error: { code, message: ErrorMessages[code] } })

export const rateLimitedReply = (retryAfterSeconds: number): Response => {
  const reply = errorReply(429, GameCenterErrors.rateLimited)
  reply.headers.set('retry-after', String(Math.ceil(retryAfterSeconds)))
  return reply
}

export const methodNotAllowedReply = (allow: readonly string[]): Response => {
  const reply = errorReply(405, GameCenterErrors.methodNotAllowed)
  reply.headers.set('allow', allow.join(', '))
  return reply
}

export const preflightReply = (): Response => new Response(null, { status: 204 })

export const withCors = (reply: Response, origin: string | undefined): Response => {
  if (origin === undefined) return reply
  reply.headers.set('access-control-allow-origin', origin)
  reply.headers.set('vary', 'origin')
  reply.headers.set('access-control-allow-methods', AllowedMethods)
  reply.headers.set('access-control-allow-headers', AllowedHeaders)
  reply.headers.set(
    'access-control-max-age',
    String(GameCenterMetrics.corsMaximumAgeSeconds)
  )
  return reply
}
