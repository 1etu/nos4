import { createSignal } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import { NSUserDefaults } from 'NSUserDefaults'
import { GKMetrics } from '../Support/GKMetrics'
import { gkRequest } from '../Support/GKService'
import { GameKitIdentifier, GKPlayerAuthenticationDidChange } from '../Support/GKNotifications'
import {
  GKAuthenticationState,
  GKError,
  type GKAuthenticationStateValue,
  type GKPlayer,
  type GKResult
} from '../Support/GKTypes'

const SessionKey = 'gamekit_session'
const PlayerKey = 'gamekit_player'
const AliasShape = /^[A-Za-z0-9][A-Za-z0-9_-]*[A-Za-z0-9]$/

interface AccountReply {
  readonly player: { id: string; alias: string; status: string }
  readonly session: { token: string; expiresAt: string }
}

const readStoredPlayer = (): GKPlayer | undefined => {
  const stored = NSUserDefaults.object<{ playerId: string; alias: string; status: string }>(
    PlayerKey
  )
  if (!stored || typeof stored.playerId !== 'string' || typeof stored.alias !== 'string') {
    return undefined
  }
  return {
    playerId: stored.playerId,
    alias: stored.alias,
    status: typeof stored.status === 'string' ? stored.status : ''
  }
}

const storedToken = NSUserDefaults.string(SessionKey)
const storedPlayer = readStoredPlayer()

const [player, setPlayer] = createSignal<GKPlayer | undefined>(
  storedToken && storedPlayer ? storedPlayer : undefined
)
const [state, setState] = createSignal<GKAuthenticationStateValue>(
  storedToken && storedPlayer
    ? GKAuthenticationState.authenticated
    : GKAuthenticationState.unauthenticated
)

let token = storedToken && storedPlayer ? storedToken : undefined

export const gkLocalPlayer = player
export const gkAuthenticationState = state
export const gkIsAuthenticated = (): boolean => state() === GKAuthenticationState.authenticated
export const gkSessionToken = (): string | undefined => token

const remember = (reply: AccountReply): GKPlayer => {
  const next: GKPlayer = {
    playerId: reply.player.id,
    alias: reply.player.alias,
    status: reply.player.status
  }
  token = reply.session.token
  NSUserDefaults.setString(SessionKey, reply.session.token)
  NSUserDefaults.setObject(PlayerKey, next)
  setPlayer(next)
  setState(GKAuthenticationState.authenticated)
  NSNotificationCenter.post(GKPlayerAuthenticationDidChange, GameKitIdentifier, {
    playerId: next.playerId
  })
  return next
}

export const gkSignOut = (): void => {
  token = undefined
  NSUserDefaults.removeObject(SessionKey)
  NSUserDefaults.removeObject(PlayerKey)
  setPlayer(undefined)
  setState(GKAuthenticationState.unauthenticated)
  NSNotificationCenter.post(GKPlayerAuthenticationDidChange, GameKitIdentifier, {
    playerId: undefined
  })
}

const submitCredentials = async (
  path: string,
  alias: string,
  password: string
): Promise<GKResult<GKPlayer>> => {
  setState(GKAuthenticationState.authenticating)
  const reply = await gkRequest<AccountReply>(
    'POST',
    path,
    { alias: alias.trim(), password },
    undefined
  )

  if (!reply.ok) {
    setState(
      player() ? GKAuthenticationState.authenticated : GKAuthenticationState.unauthenticated
    )
    return reply
  }
  return { ok: true, value: remember(reply.value) }
}

export const gkSignUp = (alias: string, password: string): Promise<GKResult<GKPlayer>> =>
  submitCredentials('/accounts', alias, password)

export const gkSignIn = (alias: string, password: string): Promise<GKResult<GKPlayer>> =>
  submitCredentials('/sessions', alias, password)

export const gkAuthenticate = async (): Promise<void> => {
  if (!token) return
  const reply = await gkRequest<AccountReply>('GET', '/player', undefined, token)
  if (reply.ok) {
    remember(reply.value)
    return
  }
  if (reply.error === GKError.notAuthenticated) gkSignOut()
}

export const gkAliasIsWellFormed = (alias: string): boolean => {
  const trimmed = alias.trim()
  if (trimmed.length < GKMetrics.aliasMinimumLength) return false
  if (trimmed.length > GKMetrics.aliasMaximumLength) return false
  if (!AliasShape.test(trimmed)) return false
  return !/[_-]{2}/.test(trimmed)
}
