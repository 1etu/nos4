import { queryRow, type SqlClient } from '../Database/Connection.ts'

interface TakenRow {
  readonly taken: boolean
}

export const aliasExists = async (client: SqlClient, normalised: string): Promise<boolean> => {
  const row = await queryRow<TakenRow>(
    client,
    'select true as taken from players where alias_normalised = $1',
    [normalised]
  )
  return row !== undefined
}
