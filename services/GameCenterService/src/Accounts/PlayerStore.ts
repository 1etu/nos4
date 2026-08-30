import { queryRow, type SqlClient } from '../Database/Connection.ts'
import type { GameCenterPlayer } from '../Support/GameCenterTypes.ts'

interface PlayerRow {
  readonly id: string
  readonly alias: string
  readonly status: string
  readonly created_at: string
}

interface CredentialRow {
  readonly player_id: string
  readonly password_record: string
}

const PlayerColumns = 'id, alias, status, created_at'

export const toPlayer = (row: PlayerRow): GameCenterPlayer => ({
  id: row.id,
  alias: row.alias,
  status: row.status,
  createdAt: new Date(row.created_at).toISOString()
})

export const createPlayer = async (
  client: SqlClient,
  alias: string,
  aliasNormalised: string,
  passwordRecord: string
): Promise<GameCenterPlayer | undefined> => {
  const row = await queryRow<PlayerRow>(
    client,
    `with created as (
       insert into players (alias, alias_normalised) values ($1, $2)
       on conflict (alias_normalised) do nothing
       returning ${PlayerColumns}
     ), saved as (
       insert into credentials (player_id, password_record)
       select id, $3 from created
     )
     select ${PlayerColumns} from created`,
    [alias, aliasNormalised, passwordRecord]
  )
  return row ? toPlayer(row) : undefined
}

export const findCredential = async (
  client: SqlClient,
  aliasNormalised: string
): Promise<CredentialRow | undefined> =>
  queryRow<CredentialRow>(
    client,
    `select credentials.player_id, credentials.password_record
     from credentials
     join players on players.id = credentials.player_id
     where players.alias_normalised = $1`,
    [aliasNormalised]
  )

export const findPlayer = async (
  client: SqlClient,
  playerId: string
): Promise<GameCenterPlayer | undefined> => {
  const row = await queryRow<PlayerRow>(
    client,
    `select ${PlayerColumns} from players where id = $1`,
    [playerId]
  )
  return row ? toPlayer(row) : undefined
}

export const updateStatus = async (
  client: SqlClient,
  playerId: string,
  status: string
): Promise<GameCenterPlayer | undefined> => {
  const row = await queryRow<PlayerRow>(
    client,
    `update players set status = $2, updated_at = now() where id = $1
     returning ${PlayerColumns}`,
    [playerId, status]
  )
  return row ? toPlayer(row) : undefined
}

export const upgradePasswordRecord = async (
  client: SqlClient,
  playerId: string,
  passwordRecord: string
): Promise<void> => {
  await client.query(
    'update credentials set password_record = $2, password_updated_at = now() where player_id = $1',
    [playerId, passwordRecord]
  )
}
