import { createSignal, Match, Show, Switch } from 'solid-js'
import { UIStatusBar } from 'UIKit'
import { UIKeyboardSearch, UIKeyboardView } from 'TextInput'
import { MobileiPodMetrics } from '../Support/MobileiPodMetrics'
import { MusicAlbum } from '../Library/MusicAlbum'
import { MusicArtists } from '../Library/MusicArtists'
import { MusicMore } from '../Library/MusicMore'
import { MusicPlaylists } from '../Library/MusicPlaylists'
import { MusicSongs } from '../Library/MusicSongs'
import { MusicTabBar, type MusicTab } from '../Chrome/MusicTabBar'
import { MusicTitleBar } from '../Chrome/MusicTitleBar'
import { MusicVideos } from '../Library/MusicVideos'
import { NowPlaying } from '../NowPlaying/NowPlaying'
import { type MPMediaItemCollection } from '../Support/MPMediaLibrary'
import { nowPlayingItem } from '../Support/MPMusicPlayerController'
import {
  deleteSearchBackward,
  endSearch,
  insertSearchText,
  isSearching,
  searchQuery
} from '../Search/MusicSearch'

export const MobileiPodApp = (props: { width: number; height: number }) => {
  const [tab, setTab] = createSignal<MusicTab>('Playlists')
  const [showNowPlaying, setShowNowPlaying] = createSignal(false)
  const [playlist, setPlaylist] = createSignal<MPMediaItemCollection | undefined>()
  const [artist, setArtist] = createSignal<string | undefined>()
  const [album, setAlbum] = createSignal<MPMediaItemCollection | undefined>()

  const title = () => {
    if (tab() === 'Playlists' && playlist()) return playlist()?.name ?? 'Playlists'
    if (tab() === 'Artists' && album()) return album()?.name ?? 'Artists'
    if (tab() === 'Artists' && artist()) return artist() ?? 'Artists'
    return tab()
  }

  const backLabel = () => {
    if (tab() === 'Playlists' && playlist()) return 'Playlists'
    if (tab() === 'Artists' && album()) return artist() ?? 'Artists'
    if (tab() === 'Artists' && artist()) return 'Artists'
    return undefined
  }

  const goBack = () => {
    if (tab() === 'Playlists') {
      setPlaylist(undefined)
      return
    }
    if (album()) {
      setAlbum(undefined)
      return
    }
    setArtist(undefined)
  }

  const selectTab = (next: MusicTab) => {
    endSearch()
    setPlaylist(undefined)
    setArtist(undefined)
    setAlbum(undefined)
    setTab(next)
  }

  const openNowPlaying = () => setShowNowPlaying(true)

  return (
    <div class="relative h-full w-full overflow-hidden" style={{ background: 'black' }}>
      <div class="flex h-full w-full flex-col">
        <UIStatusBar style={showNowPlaying() ? 'overlay' : 'inApp'} />

        <Show
          when={!showNowPlaying()}
          fallback={
            <div class="flex-1 overflow-hidden">
              <NowPlaying height={props.height} onBack={() => setShowNowPlaying(false)} />
            </div>
          }
        >
          <MusicTitleBar
            title={title()}
            backLabel={backLabel()}
            showNowPlaying={nowPlayingItem() !== undefined}
            onBack={goBack}
            onNowPlaying={openNowPlaying}
          />

          <div
            class="relative flex-1 overflow-hidden"
            style={{ transform: `translateY(${MobileiPodMetrics.contentOffsetY}px)` }}
          >
            <Switch>
              <Match when={tab() === 'Playlists'}>
                <MusicPlaylists
                  playlist={playlist()}
                  onOpen={setPlaylist}
                  onNowPlaying={openNowPlaying}
                />
              </Match>
              <Match when={tab() === 'Artists' && album()}>
                {(current) => (
                  <MusicAlbum album={current()} onNowPlaying={openNowPlaying} />
                )}
              </Match>
              <Match when={tab() === 'Artists'}>
                <MusicArtists
                  artist={artist()}
                  onOpenArtist={setArtist}
                  onOpenAlbum={setAlbum}
                  onNowPlaying={openNowPlaying}
                />
              </Match>
              <Match when={tab() === 'Songs'}>
                <MusicSongs onNowPlaying={openNowPlaying} />
              </Match>
              <Match when={tab() === 'Videos'}>
                <MusicVideos />
              </Match>
              <Match when={tab() === 'More'}>
                <MusicMore />
              </Match>
            </Switch>
          </div>

          <MusicTabBar width={props.width} selected={tab()} onSelect={selectTab} />
        </Show>
      </div>

      <UIKeyboardView
        visible={isSearching()}
        width={props.width}
        configuration={UIKeyboardSearch(searchQuery().length > 0)}
        onInsert={insertSearchText}
        onDelete={deleteSearchBackward}
        onReturn={() => undefined}
      />
    </div>
  )
}
