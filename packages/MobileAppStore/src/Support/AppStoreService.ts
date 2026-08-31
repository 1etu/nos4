import { createSignal } from 'solid-js'
import { AppStoreMetrics } from './AppStoreMetrics'
import type { AppStoreApplication } from './AppStoreTypes'

const FeedRoot = 'https://itunes.apple.com/us/rss'
const LookupEndpoint = 'https://itunes.apple.com/lookup'
const SearchEndpoint = 'https://itunes.apple.com/search'

export const AppStoreChart = {
  new: 'newapplications',
  paid: 'toppaidapplications',
  free: 'topfreeapplications',
  grossing: 'topgrossingapplications'
} as const

export type AppStoreChartValue = (typeof AppStoreChart)[keyof typeof AppStoreChart]

interface FeedEntry {
  readonly id?: { readonly attributes?: { readonly 'im:id'?: string } }
  readonly 'im:image'?: readonly { readonly label?: string }[]
}

interface FeedResponse {
  readonly feed?: { readonly entry?: FeedEntry | FeedEntry[] }
}

interface LookupResult {
  readonly trackId?: number
  readonly trackName?: string
  readonly artistName?: string
  readonly sellerName?: string
  readonly sellerUrl?: string
  readonly formattedPrice?: string
  readonly averageUserRating?: number
  readonly userRatingCount?: number
  readonly artworkUrl512?: string
  readonly artworkUrl100?: string
  readonly screenshotUrls?: readonly string[]
  readonly description?: string
  readonly version?: string
  readonly fileSizeBytes?: string
  readonly contentAdvisoryRating?: string
  readonly advisories?: readonly string[]
  readonly features?: readonly string[]
  readonly currentVersionReleaseDate?: string
}

interface LookupResponse {
  readonly results?: readonly LookupResult[]
}

const Missing = '---'

const fetchJSON = async <T>(url: string): Promise<T | undefined> => {
  const controller = new AbortController()
  const bell = setTimeout(() => controller.abort(), AppStoreMetrics.requestTimeoutMilliseconds)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) return undefined
    return (await response.json()) as T
  } catch {
    return undefined
  } finally {
    clearTimeout(bell)
  }
}

const feedURL = (chart: AppStoreChartValue, limit: number, genreId?: string): string => {
  const genre = genreId ? `/genre=${genreId}` : ''
  return `${FeedRoot}/${chart}/limit=${limit}${genre}/json`
}

const entriesOf = (body: FeedResponse | undefined): readonly FeedEntry[] => {
  const entry = body?.feed?.entry
  if (!entry) return []
  return Array.isArray(entry) ? entry : [entry]
}

const toApplication = (result: LookupResult): AppStoreApplication | undefined => {
  if (typeof result.trackId !== 'number') return undefined
  return {
    trackId: result.trackId,
    trackName: result.trackName ?? Missing,
    artistName: result.artistName ?? Missing,
    sellerName: result.sellerName ?? Missing,
    sellerUrl: result.sellerUrl ?? '',
    formattedPrice: result.formattedPrice ?? Missing,
    averageUserRating: typeof result.averageUserRating === 'number' ? result.averageUserRating : 0,
    userRatingCount: typeof result.userRatingCount === 'number' ? result.userRatingCount : 0,
    artworkUrl: result.artworkUrl512 ?? result.artworkUrl100 ?? '',
    screenshotUrls: result.screenshotUrls ?? [],
    description: result.description ?? '',
    version: result.version ?? Missing,
    fileSizeBytes: result.fileSizeBytes ?? '0',
    contentAdvisoryRating: result.contentAdvisoryRating ?? Missing,
    advisories: result.advisories ?? [],
    features: result.features ?? [],
    currentVersionReleaseDate: result.currentVersionReleaseDate ?? ''
  }
}

const lookup = async (ids: readonly string[]): Promise<readonly AppStoreApplication[]> => {
  if (ids.length === 0) return []
  const body = await fetchJSON<LookupResponse>(
    `${LookupEndpoint}?id=${ids.join(',')}&entity=software`
  )
  const found = new Map<number, AppStoreApplication>()
  for (const result of body?.results ?? []) {
    const application = toApplication(result)
    if (application) found.set(application.trackId, application)
  }
  const ordered: AppStoreApplication[] = []
  for (const id of ids) {
    const application = found.get(Number(id))
    if (application) ordered.push(application)
  }
  return ordered
}

const loadChart = async (
  chart: AppStoreChartValue,
  genreId?: string
): Promise<readonly AppStoreApplication[]> => {
  const body = await fetchJSON<FeedResponse>(
    feedURL(chart, AppStoreMetrics.chartLimit, genreId)
  )
  const ids: string[] = []
  for (const entry of entriesOf(body)) {
    const id = entry.id?.attributes?.['im:id']
    if (id) ids.push(id)
  }
  return lookup(ids)
}

const [featured, setFeatured] = createSignal<readonly AppStoreApplication[]>([])
const [charts, setCharts] = createSignal<Readonly<Record<string, readonly AppStoreApplication[]>>>(
  {}
)
const [artwork, setArtwork] = createSignal<Readonly<Record<string, string>>>({})
const [results, setResults] = createSignal<readonly AppStoreApplication[]>([])

export const appStoreFeatured = featured
export const appStoreSearchResults = results

export const appStoreChart = (
  chart: AppStoreChartValue,
  genreId?: string
): readonly AppStoreApplication[] => charts()[chartKey(chart, genreId)] ?? []

export const appStoreCategoryArtwork = (genreId: string): string | undefined =>
  artwork()[genreId]

const chartKey = (chart: AppStoreChartValue, genreId?: string): string =>
  genreId ? `${chart}:${genreId}` : chart

const pending = new Set<string>()

export const appStoreLoadFeatured = async (): Promise<void> => {
  if (featured().length > 0) return
  const applications = await loadChart(AppStoreChart.new)
  if (applications.length > 0) setFeatured(applications)
}

export const appStoreLoadChart = async (
  chart: AppStoreChartValue,
  genreId?: string
): Promise<void> => {
  const key = chartKey(chart, genreId)
  if (charts()[key] || pending.has(key)) return
  pending.add(key)
  const applications = await loadChart(chart, genreId)
  pending.delete(key)
  if (applications.length === 0) return
  setCharts({ ...charts(), [key]: applications })
}

export const appStoreLoadCategoryArtwork = async (genreId: string): Promise<void> => {
  const key = `artwork:${genreId}`
  if (artwork()[genreId] || pending.has(key)) return
  pending.add(key)
  const body = await fetchJSON<FeedResponse>(feedURL(AppStoreChart.paid, 1, genreId))
  pending.delete(key)
  const image = entriesOf(body)[0]?.['im:image']
  const url = image?.[image.length - 1]?.label
  if (url) setArtwork({ ...artwork(), [genreId]: url })
}

export const appStoreSearch = async (term: string): Promise<void> => {
  const trimmed = term.trim()
  if (trimmed === '') return
  const body = await fetchJSON<LookupResponse>(
    `${SearchEndpoint}?term=${encodeURIComponent(trimmed)}&country=us&entity=software`
  )
  const found: AppStoreApplication[] = []
  for (const result of body?.results ?? []) {
    const application = toApplication(result)
    if (application) found.push(application)
  }
  if (found.length > 0) setResults(found)
}

export const appStoreRatingsLabel = (count: number): string => `${count} Ratings`

export const appStoreSizeLabel = (bytes: string): string =>
  `${(Number(bytes) / 1000000).toFixed(1)} MB`

const ReleaseMonths = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

export const appStoreDateLabel = (value: string): string => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return Missing
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${ReleaseMonths[parsed.getMonth()] ?? Missing} ${day}, ${parsed.getFullYear()}`
}
