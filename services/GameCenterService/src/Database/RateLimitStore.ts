import { queryRow, type SqlClient } from './Connection.ts'

interface RateLimitRow {
  readonly hits: number
  readonly seconds_remaining: number
}

const Statement = `
  insert into rate_limits (bucket, window_started_at, hits)
  values ($1, now(), 1)
  on conflict (bucket) do update set
    hits = case
      when rate_limits.window_started_at < now() - make_interval(secs => $2)
      then 1 else rate_limits.hits + 1 end,
    window_started_at = case
      when rate_limits.window_started_at < now() - make_interval(secs => $2)
      then now() else rate_limits.window_started_at end
  returning
    hits,
    extract(epoch from (window_started_at + make_interval(secs => $2) - now())) as seconds_remaining
`

export interface RateLimitVerdict {
  readonly allowed: boolean
  readonly retryAfterSeconds: number
}

export const consumeRateLimit = async (
  client: SqlClient,
  bucket: string,
  budget: number,
  windowSeconds: number
): Promise<RateLimitVerdict> => {
  const row = await queryRow<RateLimitRow>(client, Statement, [bucket, windowSeconds])
  if (!row) return { allowed: true, retryAfterSeconds: 0 }
  return {
    allowed: Number(row.hits) <= budget,
    retryAfterSeconds: Math.max(0, Number(row.seconds_remaining))
  }
}

export const sweepExpired = async (client: SqlClient): Promise<void> => {
  await client.query('delete from sessions where expires_at < now()', [])
  await client.query(
    'delete from runs where submitted_at is null and expires_at < now()',
    []
  )
  await client.query(
    "delete from runs where submitted_at < now() - interval '30 days'",
    []
  )
  await client.query(
    "delete from rate_limits where window_started_at < now() - interval '1 day'",
    []
  )
}
