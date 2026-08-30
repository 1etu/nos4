import { connect } from '../Database/Connection.ts'
import { GameCenterErrors, type GameCenterConfiguration } from '../Support/GameCenterTypes.ts'
import { errorReply, preflightReply, withCors } from './HttpReply.ts'
import { clientAddress, originIsAllowed, requestOrigin } from './RequestOrigin.ts'
import { routeRequest } from './RouteTable.ts'

export const gameCenterHandler = (
  configuration: GameCenterConfiguration
): ((request: Request) => Promise<Response>) => {
  const client = connect(configuration)

  return async (request: Request): Promise<Response> => {
    const origin = requestOrigin(request)
    if (!originIsAllowed(configuration, origin)) {
      return errorReply(403, GameCenterErrors.originNotAllowed)
    }
    if (request.method === 'OPTIONS') return withCors(preflightReply(), origin)

    try {
      const url = new URL(request.url)
      const reply = await routeRequest(client, request, url, {
        address: clientAddress(request),
        origin
      })
      return withCors(reply, origin)
    } catch {
      return withCors(errorReply(500, GameCenterErrors.internalError), origin)
    }
  }
}
