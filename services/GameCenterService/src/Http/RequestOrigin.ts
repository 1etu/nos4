import type { GameCenterConfiguration } from '../Support/GameCenterTypes.ts'

const UnknownAddress = 'unknown'

export const requestOrigin = (request: Request): string | undefined =>
  request.headers.get('origin') ?? undefined

export const originIsAllowed = (
  configuration: GameCenterConfiguration,
  origin: string | undefined
): boolean => origin === undefined || configuration.allowedOrigins.includes(origin)

export const clientAddress = (request: Request): string =>
  request.headers.get('cf-connecting-ip') ?? UnknownAddress
