import { createSignal } from 'solid-js'
import { GKGameIdentifier, GKMetrics } from '../Support/GKMetrics'
import { gkRequest } from '../Support/GKService'
import { gkSessionToken } from '../Player/GKLocalPlayer'
import type { GKLeaderboard, GKScore } from '../Support/GKTypes'

interface EntryReply {
  readonly rank: number
  readonly alias: string
  readonly score: number
}

interface ScoresReply {
  readonly leaderboard: { id: string; title: string }
  readonly total: number
  readonly entries: readonly EntryReply[]
  readonly rank?: number | null
}

const [boards, setBoards] = createSignal<readonly GKLeaderboard[]>([])

export const gkLeaderboards = boards

export const gkLeaderboardFor = (leaderboardId: string): GKLeaderboard | undefined =>
  boards().find((board) => board.leaderboardId === leaderboardId)

const toScores = (entries: readonly EntryReply[]): GKScore[] =>
  entries.map((entry) => ({ rank: entry.rank, alias: entry.alias, value: entry.score }))

const merge = (board: GKLeaderboard): void => {
  const existing = boards().filter((entry) => entry.leaderboardId !== board.leaderboardId)
  setBoards([...existing, board])
}

interface LocalPlacement {
  readonly rank: number | null
  readonly score: number | null
}

const NoPlacement: LocalPlacement = { rank: null, score: null }

const placementIn = (reply: ScoresReply): LocalPlacement => {
  const rank = reply.rank ?? null
  const own = reply.entries.find((entry) => entry.rank === rank)
  return { rank, score: own ? own.score : null }
}

export const gkLoadLeaderboard = async (leaderboardId: string): Promise<void> => {
  const page = await gkRequest<ScoresReply>(
    'GET',
    `/games/${GKGameIdentifier}/leaderboards/${leaderboardId}/scores?limit=${GKMetrics.leaderboardPageSize}`,
    undefined,
    undefined
  )
  if (!page.ok) return

  const token = gkSessionToken()
  const mine = token
    ? await gkRequest<ScoresReply>(
        'GET',
        `/games/${GKGameIdentifier}/leaderboards/${leaderboardId}/scores/me`,
        undefined,
        token
      )
    : undefined
  const placement = mine?.ok ? placementIn(mine.value) : NoPlacement

  merge({
    leaderboardId,
    title: page.value.leaderboard.title,
    playerCount: page.value.total,
    scores: toScores(page.value.entries),
    localPlayerRank: placement.rank,
    localPlayerScore: placement.score
  })
}
