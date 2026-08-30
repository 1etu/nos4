import { connect } from './Database/Connection.ts'
import { sweepExpired } from './Database/RateLimitStore.ts'
import { gameCenterHandler } from './Http/GameCenterHandler.ts'
import type { GameCenterConfiguration } from './Support/GameCenterTypes.ts'

interface WorkerEnvironment {
  readonly DATABASE_URL: string
  readonly NOS4_GAME_CENTER_ORIGINS: string
}

const configurationFrom = (environment: WorkerEnvironment): GameCenterConfiguration => ({
  databaseUrl: environment.DATABASE_URL,
  allowedOrigins: environment.NOS4_GAME_CENTER_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
})

export default {
  fetch: (request: Request, environment: WorkerEnvironment): Promise<Response> =>
    gameCenterHandler(configurationFrom(environment))(request),
  scheduled: (_event: unknown, environment: WorkerEnvironment): Promise<void> =>
    sweepExpired(connect(configurationFrom(environment)))
}
