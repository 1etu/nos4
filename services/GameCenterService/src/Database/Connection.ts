import { neon } from '@neondatabase/serverless'
import type { GameCenterConfiguration } from '../Support/GameCenterTypes.ts'

export type SqlClient = ReturnType<typeof neon>

export const connect = (configuration: GameCenterConfiguration): SqlClient =>
  neon(configuration.databaseUrl)

export const queryRows = async <T>(
  client: SqlClient,
  text: string,
  params: readonly unknown[]
): Promise<T[]> => {
  const rows = await client.query(text, [...params])
  return rows as T[]
}

export const queryRow = async <T>(
  client: SqlClient,
  text: string,
  params: readonly unknown[]
): Promise<T | undefined> => {
  const rows = await queryRows<T>(client, text, params)
  return rows[0]
}
