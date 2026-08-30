import { authenticate, createAccount, createSession, deleteSession } from '../Accounts/AccountRoutes.ts'
import { patchPlayer, readPlayer } from '../Accounts/PlayerRoutes.ts'
import { checkAlias } from '../Aliases/AliasRoutes.ts'
import { getLeaderboards, getScores, getScoresAroundMe } from '../Leaderboards/LeaderboardRoutes.ts'
import { postRun, postScore } from '../Runs/RunRoutes.ts'
import type { SqlClient } from '../Database/Connection.ts'
import { GameCenterErrors, type GameCenterRequestContext } from '../Support/GameCenterTypes.ts'
import { errorReply, methodNotAllowedReply } from './HttpReply.ts'

const segmentsOf = (pathname: string): string[] =>
  pathname.split('/').filter((segment) => segment.length > 0)

const requireSession = async (
  client: SqlClient,
  request: Request
): Promise<{ playerId: string; token: string; expiresAt: string } | Response> =>
  (await authenticate(client, request)) ?? errorReply(401, GameCenterErrors.invalidSession)

export const routeRequest = async (
  client: SqlClient,
  request: Request,
  url: URL,
  context: GameCenterRequestContext
): Promise<Response> => {
  const path = segmentsOf(url.pathname)
  const method = request.method

  if (path.length === 1 && path[0] === 'accounts') {
    if (method !== 'POST') return methodNotAllowedReply(['POST'])
    return createAccount(client, request, context)
  }

  if (path.length === 1 && path[0] === 'sessions') {
    if (method !== 'POST') return methodNotAllowedReply(['POST'])
    return createSession(client, request, context)
  }

  if (path.length === 2 && path[0] === 'sessions' && path[1] === 'current') {
    if (method !== 'DELETE') return methodNotAllowedReply(['DELETE'])
    const session = await requireSession(client, request)
    if (session instanceof Response) return session
    return deleteSession(client, session.token)
  }

  if (path.length === 1 && path[0] === 'alias') {
    if (method !== 'GET') return methodNotAllowedReply(['GET'])
    return checkAlias(client, url, context)
  }

  if (path.length === 1 && path[0] === 'player') {
    const session = await requireSession(client, request)
    if (session instanceof Response) return session
    if (method === 'GET') {
      return readPlayer(client, session.playerId, session.token, session.expiresAt)
    }
    if (method === 'PATCH') return patchPlayer(client, request, session.playerId)
    return methodNotAllowedReply(['GET', 'PATCH'])
  }

  if (path.length === 3 && path[0] === 'games' && path[2] === 'leaderboards') {
    if (method !== 'GET') return methodNotAllowedReply(['GET'])
    return getLeaderboards(client, path[1] ?? '')
  }

  if (path.length === 5 && path[0] === 'games' && path[2] === 'leaderboards' && path[4] === 'scores') {
    if (method !== 'GET') return methodNotAllowedReply(['GET'])
    return getScores(client, url, path[1] ?? '', path[3] ?? '')
  }

  if (
    path.length === 6 &&
    path[0] === 'games' &&
    path[2] === 'leaderboards' &&
    path[4] === 'scores' &&
    path[5] === 'me'
  ) {
    if (method !== 'GET') return methodNotAllowedReply(['GET'])
    const session = await requireSession(client, request)
    if (session instanceof Response) return session
    return getScoresAroundMe(client, url, path[1] ?? '', path[3] ?? '', session.playerId)
  }

  if (path.length === 5 && path[0] === 'games' && path[2] === 'leaderboards' && path[4] === 'runs') {
    if (method !== 'POST') return methodNotAllowedReply(['POST'])
    const session = await requireSession(client, request)
    if (session instanceof Response) return session
    return postRun(client, path[1] ?? '', path[3] ?? '', session.playerId)
  }

  if (path.length === 3 && path[0] === 'runs' && path[2] === 'scores') {
    if (method !== 'POST') return methodNotAllowedReply(['POST'])
    const session = await requireSession(client, request)
    if (session instanceof Response) return session
    return postScore(client, request, path[1] ?? '', session.playerId, context)
  }

  return errorReply(404, GameCenterErrors.notFound)
}
