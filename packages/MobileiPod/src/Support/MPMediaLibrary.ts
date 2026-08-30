import { createSignal } from 'solid-js'

export interface MPMediaItem {
  readonly id: string
  readonly title: string
  readonly artist: string
  readonly albumTitle: string
  readonly albumTrackNumber: number
  readonly playbackDuration: number
  readonly year: string
  readonly artwork: string
  readonly asset: string
  readonly rating: number
}

export interface MPMediaItemCollection {
  readonly id: string
  readonly name: string
  readonly items: readonly MPMediaItem[]
}

export interface MPMediaLibraryProvider {
  readonly songs: () => readonly MPMediaItem[]
  readonly playlists: () => readonly MPMediaItemCollection[]
}

const MediaRoot = 'media/ipod'

export const developerModeEnabled = import.meta.env.DEV_ONLY_MODE === '1'

const slug = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const track = (
  artist: string,
  albumTitle: string,
  year: string,
  title: string,
  albumTrackNumber: number,
  playbackDuration: number,
  rating: number
): MPMediaItem => ({
  id: slug(`${artist}-${title}`),
  title,
  artist,
  albumTitle,
  albumTrackNumber,
  playbackDuration,
  year,
  artwork: `${MediaRoot}/${slug(albumTitle)}.jpg`,
  asset: `${MediaRoot}/${slug(title)}.mp3`,
  rating
})

const hot = [
  track('Inna', 'Hot', '2009', 'Deja Vu', 1, 202, 4),
  track('Inna', 'Hot', '2009', 'Hot', 2, 206, 5),
  track('Inna', 'Hot', '2009', 'Amazing', 3, 214, 4)
]

const stereoLove = [
  track('Edward Maya & Vika Jigulina', 'Stereo Love', '2009', 'Stereo Love', 1, 183, 5)
]

const losBandoleros = [
  track('Don Omar', 'Los Bandoleros', '2005', 'Bandoleros', 1, 251, 4)
]

const godfather = [
  track('Nino Rota', 'The Godfather', '1972', 'The Godfather Theme', 1, 158, 5)
]

const seedSongs: readonly MPMediaItem[] = [
  ...hot,
  ...stereoLove,
  ...losBandoleros,
  ...godfather
]

const seedPlaylists: readonly MPMediaItemCollection[] = [
  {
    id: 'playlist-night-drive',
    name: 'Night Drive',
    items: [...stereoLove, ...hot, ...losBandoleros]
  },
  { id: 'playlist-recently-added', name: 'Recently Added', items: [...hot] },
  {
    id: 'playlist-top-rated',
    name: 'Top Rated',
    items: seedSongs.filter((item) => item.rating >= 5)
  }
]

const [songs, setSongs] = createSignal<readonly MPMediaItem[]>(
  developerModeEnabled ? seedSongs : []
)
const [playlists, setPlaylists] = createSignal<readonly MPMediaItemCollection[]>(
  developerModeEnabled ? seedPlaylists : []
)

export const librarySongs = songs
export const libraryPlaylists = playlists

export const setMediaLibraryProvider = (provider: MPMediaLibraryProvider): void => {
  setSongs(provider.songs())
  setPlaylists(provider.playlists())
}

export const mediaURL = (path: string): string => `${import.meta.env.BASE_URL}${path}`

const byName = (a: string, b: string): number => (a.toLowerCase() < b.toLowerCase() ? -1 : 1)

export const libraryAlbums = (): readonly MPMediaItemCollection[] => {
  const grouped = new Map<string, MPMediaItem[]>()
  for (const item of songs()) {
    const key = `${item.artist} ${item.albumTitle}`
    const bucket = grouped.get(key)
    if (bucket) {
      bucket.push(item)
      continue
    }
    grouped.set(key, [item])
  }
  return [...grouped.entries()]
    .map(([key, items]) => ({
      id: slug(key),
      name: items[0]?.albumTitle ?? key,
      items: [...items].sort((a, b) => a.albumTrackNumber - b.albumTrackNumber)
    }))
    .sort((a, b) => byName(a.name, b.name))
}

export const libraryArtists = (): readonly MPMediaItemCollection[] => {
  const grouped = new Map<string, MPMediaItem[]>()
  for (const item of songs()) {
    const bucket = grouped.get(item.artist)
    if (bucket) {
      bucket.push(item)
      continue
    }
    grouped.set(item.artist, [item])
  }
  return [...grouped.entries()]
    .map(([artist, items]) => ({ id: slug(`artist-${artist}`), name: artist, items }))
    .sort((a, b) => byName(a.name, b.name))
}

export const albumsForArtist = (artist: string): readonly MPMediaItemCollection[] =>
  libraryAlbums().filter((album) => album.items[0]?.artist === artist)

export const albumForItem = (item: MPMediaItem): readonly MPMediaItem[] =>
  songs()
    .filter((song) => song.albumTitle === item.albumTitle && song.artist === item.artist)
    .sort((a, b) => a.albumTrackNumber - b.albumTrackNumber)

export const sortedSongs = (): readonly MPMediaItem[] =>
  [...songs()].sort((a, b) => byName(a.title, b.title))

export const formatTimeFor = (seconds: number): string => {
  const whole = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(whole / 60)
  const remainder = whole % 60
  return `${minutes}:${remainder < 10 ? '0' : ''}${remainder}`
}

export const formatTimeForMinutes = (seconds: number): string => `${Math.round(seconds / 60)}`

export const wrapAround = (
  items: readonly MPMediaItem[],
  selected: MPMediaItem
): readonly MPMediaItem[] => {
  const at = items.findIndex((item) => item.id === selected.id)
  if (at < 0) return items
  return [...items.slice(at), ...items.slice(0, at)]
}

export const shuffled = (items: readonly MPMediaItem[]): readonly MPMediaItem[] => {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    const held = copy[index]
    const other = copy[swap]
    if (!held || !other) continue
    copy[index] = other
    copy[swap] = held
  }
  return copy
}
