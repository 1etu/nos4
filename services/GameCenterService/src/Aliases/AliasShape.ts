import { GameCenterErrors, type GameCenterErrorCode } from '../Support/GameCenterTypes.ts'
import { GameCenterMetrics } from '../Support/GameCenterMetrics.ts'
import { BlockedAliases } from './AliasBlocklist.gen.ts'
import { aliasMatchForm, aliasUniquenessForm } from './AliasNormalisation.ts'

const AllowedCharacters = /^[A-Za-z0-9_-]+$/
const EdgeSeparator = /^[_-]|[_-]$/
const AdjacentSeparators = /[_-]{2}/

const ReservedAliases: ReadonlySet<string> = new Set([
  'admin',
  'administrator',
  'anonymous',
  'gamecenter',
  'guest',
  'moderator',
  'mod',
  'nos4',
  'null',
  'player',
  'root',
  'staff',
  'support',
  'system',
  'undefined'
])

export const aliasRejection = (alias: string): GameCenterErrorCode | undefined => {
  const length = [...alias].length
  if (length < GameCenterMetrics.aliasMinimumLength) return GameCenterErrors.aliasShape
  if (length > GameCenterMetrics.aliasMaximumLength) return GameCenterErrors.aliasShape
  if (!AllowedCharacters.test(alias)) return GameCenterErrors.aliasShape
  if (EdgeSeparator.test(alias)) return GameCenterErrors.aliasShape
  if (AdjacentSeparators.test(alias)) return GameCenterErrors.aliasShape

  if (ReservedAliases.has(aliasUniquenessForm(alias))) return GameCenterErrors.aliasReserved
  if (BlockedAliases.has(aliasMatchForm(alias))) return GameCenterErrors.aliasRejected
  return undefined
}

export const statusIsAcceptable = (status: string): boolean =>
  status.length <= GameCenterMetrics.statusMaximumLength
