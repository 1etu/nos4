import { createSignal } from 'solid-js'
import { CatalogAlbums } from './StoreCatalog'

const NewMusic = 'https://itunes.apple.com/us/rss/topalbums/limit=10/json'
const TopMovies = 'https://itunes.apple.com/us/rss/topmovies/limit=10/json'
const TopTelevision = 'https://itunes.apple.com/us/rss/toptvepisodes/limit=10/json'
const SearchEndpoint = 'https://itunes.apple.com/search'
const SearchEntities = 'song,album'
const SearchLimit = 25

export interface StoreTrack {
  readonly number: number
  readonly title: string
  readonly seconds: number
  readonly price: number
  readonly explicit: boolean
}

export interface StoreItem {
  readonly id: string
  readonly title: string
  readonly artist: string
  readonly artwork: string
  readonly kind: string
  readonly collection?: string
  readonly genre?: string
  readonly released?: string
  readonly price?: number
  readonly copyright?: string
  readonly tracks?: readonly StoreTrack[]
}

export interface StoreCategory {
  readonly name: string
  readonly genreId: string
}

export const StoreCategories: readonly StoreCategory[] = [
  { name: 'iTunes', genreId: '' },
  { name: 'Alternative', genreId: '20' },
  { name: 'Blues', genreId: '2' },
  { name: "Children's Music", genreId: '4' },
  { name: 'Christian', genreId: '22' },
  { name: 'Classical', genreId: '5' },
  { name: 'Comedy', genreId: '3' },
  { name: 'Country', genreId: '6' },
  { name: 'Dance', genreId: '17' },
  { name: 'Electronic', genreId: '7' },
  { name: 'Hip-Hop/Rap', genreId: '18' },
  { name: 'Holiday', genreId: '8' },
  { name: 'Jazz', genreId: '11' },
  { name: 'K-Pop', genreId: '51' },
  { name: 'Latin', genreId: '12' },
  { name: 'Metal', genreId: '1153' },
  { name: 'Pop', genreId: '14' },
  { name: 'R&B/Soul', genreId: '15' },
  { name: 'Reggae', genreId: '24' },
  { name: 'Rock', genreId: '21' },
  { name: 'Singer/Songwriter', genreId: '1160' },
  { name: 'Soundtrack', genreId: '16' },
  { name: 'Worldwide', genreId: '19' }
]

interface FeedLabel {
  readonly label?: string
}

interface FeedEntry {
  readonly 'im:name'?: FeedLabel
  readonly 'im:artist'?: FeedLabel
  readonly 'im:image'?: readonly FeedLabel[]
  readonly 'im:releaseDate'?: FeedLabel
  readonly 'im:price'?: { readonly attributes?: { readonly amount?: string } }
  readonly id?: { readonly attributes?: { readonly 'im:id'?: string } }
  readonly category?: { readonly attributes?: { readonly label?: string } }
  readonly rights?: FeedLabel
}

interface FeedResponse {
  readonly feed?: { readonly entry?: readonly FeedEntry[] }
}

interface SearchEntry {
  readonly wrapperType?: string
  readonly kind?: string
  readonly trackId?: number
  readonly collectionId?: number
  readonly trackName?: string
  readonly collectionName?: string
  readonly artistName?: string
  readonly artworkUrl100?: string
  readonly trackPrice?: number
}

interface SearchResponse {
  readonly results?: readonly SearchEntry[]
}

export type StoreSearchRow = 'link' | 'song'

export interface StoreSearchSection {
  readonly title: string
  readonly row: StoreSearchRow
  readonly items: readonly StoreItem[]
}

export type StoreEditingState = 'None' | 'ActiveEmpty' | 'Active'

const [newMusic, setNewMusic] = createSignal<readonly StoreItem[]>(CatalogAlbums)
const [movies, setMovies] = createSignal<readonly StoreItem[]>([])
const [television, setTelevision] = createSignal<readonly StoreItem[]>([])
const [sections, setSections] = createSignal<readonly StoreSearchSection[]>([])

export const storeNewMusic = newMusic
export const storeMovies = movies
export const storeTelevision = television
export const storeSearchSections = sections

const artworkAt = (url: string | undefined, size: number): string =>
  (url ?? '').replace(/\/\d+x\d+bb\./, `/${size}x${size}bb.`)

const fromFeed = (entry: FeedEntry): StoreItem => {
  const images = entry['im:image'] ?? []
  const amount = entry['im:price']?.attributes?.amount
  return {
    id: entry.id?.attributes?.['im:id'] ?? entry['im:name']?.label ?? '',
    title: entry['im:name']?.label ?? '---',
    artist: entry['im:artist']?.label ?? '---',
    artwork: artworkAt(images[images.length - 1]?.label, 300),
    kind: 'album',
    genre: entry.category?.attributes?.label,
    released: entry['im:releaseDate']?.label,
    price: amount === undefined ? undefined : Number.parseFloat(amount),
    copyright: entry.rights?.label
  }
}

const loadFeed = async (
  url: string,
  apply: (items: readonly StoreItem[]) => void
): Promise<void> => {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!response.ok) return
    const body: FeedResponse = await response.json()
    const items = (body.feed?.entry ?? []).map(fromFeed)
    if (items.length > 0) apply(items)
  } catch {
    return
  }
}

export const loadStoreFeeds = (): void => {
  void loadFeed(NewMusic, (items) => setNewMusic([...CatalogAlbums, ...items]))
  void loadFeed(TopMovies, setMovies)
  void loadFeed(TopTelevision, setTelevision)
}

export const mediaURL = (path: string): string => `${import.meta.env.BASE_URL}${path}`

export const releaseDateLabel = (value: string | undefined): string => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

export const priceLabel = (value: number | undefined): string =>
  value === undefined ? '' : `$${value.toFixed(2)}`

const SectionOrder: readonly { readonly title: string; readonly row: StoreSearchRow }[] = [
  { title: 'Songs', row: 'song' },
  { title: 'Albums', row: 'link' }
]

const sectionFor = (entry: SearchEntry): string | undefined => {
  if (entry.wrapperType === 'collection') return 'Albums'
  if (entry.kind === 'song') return 'Songs'
  return undefined
}

const fromSearch = (entry: SearchEntry): StoreItem => ({
  id: `${entry.trackId ?? entry.collectionId ?? ''}`,
  title: entry.trackName ?? entry.collectionName ?? '---',
  artist: entry.artistName ?? '---',
  artwork: artworkAt(entry.artworkUrl100, 200),
  kind: entry.kind ?? entry.wrapperType ?? '',
  collection: entry.collectionName,
  price: entry.kind === 'song' ? (entry.trackPrice ?? 0) : undefined
})

const matchesCatalog = (album: StoreItem, query: string): boolean =>
  album.title.toLowerCase().includes(query) || album.artist.toLowerCase().includes(query)

const sectioned = (items: readonly StoreItem[], entries: readonly SearchEntry[]): void => {
  const grouped = new Map<string, StoreItem[]>()
  grouped.set('Albums', [...items])
  for (const entry of entries) {
    const title = sectionFor(entry)
    if (!title) continue
    const bucket = grouped.get(title)
    if (bucket) {
      bucket.push(fromSearch(entry))
      continue
    }
    grouped.set(title, [fromSearch(entry)])
  }
  setSections(
    SectionOrder.flatMap(({ title, row }) => {
      const bucket = grouped.get(title) ?? []
      if (bucket.length === 0) return []
      return [{ title, row, items: bucket }]
    })
  )
}

export const searchStore = async (term: string): Promise<void> => {
  const query = term.trim().toLowerCase()
  if (query.length === 0) {
    setSections([])
    return
  }
  const catalog = CatalogAlbums.filter((album) => matchesCatalog(album, query))
  try {
    const url = `${SearchEndpoint}?term=${encodeURIComponent(term.trim())}&media=music&entity=${SearchEntities}&limit=${SearchLimit}`
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!response.ok) throw new Error(response.statusText)
    const body: SearchResponse = await response.json()
    sectioned(catalog, body.results ?? [])
  } catch {
    sectioned(catalog, [])
  }
}
