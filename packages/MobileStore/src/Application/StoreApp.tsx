import { createSignal, Match, onMount, Show, Switch } from 'solid-js'
import {
  UIBarButton,
  UINavigationBar,
  UIPinstripeBackground,
  UIScrollView,
  UISegmentedControl,
  UISegmentedControlMetrics,
  UIStatusBar
} from 'UIKit'
import { UIKeyboardSearch, UIKeyboardView } from 'TextInput'
import { StoreAccountFooter, StoreListSection } from '../Views/StoreListSection'
import { StoreAlbumDestination } from '../Views/StoreAlbumDestination'
import { StoreGeniusView } from '../Views/StoreGeniusView'
import { StoreMoreView } from '../Views/StoreMoreView'
import { StoreMusicView } from '../Views/StoreMusicView'
import { StoreSearchField } from '../Views/StoreSearchField'
import { StoreSearchView } from '../Views/StoreSearchView'
import { StoreTabBar, type StoreTab } from '../Views/StoreTabBar'
import { StoreMetrics, StorePalette } from '../Support/StoreMetrics'
import {
  loadStoreFeeds,
  searchStore,
  storeMovies,
  storeTelevision,
  type StoreEditingState,
  type StoreItem
} from '../Support/StoreService'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const Empty = (props: { title: string }) => (
  <div class="flex h-full w-full items-center justify-center">
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': '20px',
        'font-weight': '700',
        color: StorePalette.sectionHeader,
        'text-shadow': '0 0.9px 0 rgba(255,255,255,0.9)'
      }}
    >
      {props.title}
    </span>
  </div>
)

export const StoreApp = (props: { width: number }) => {
  const [tab, setTab] = createSignal<StoreTab>('Music')
  const [musicSegment, setMusicSegment] = createSignal(0)
  const [videoSegment, setVideoSegment] = createSignal(0)
  const [geniusSegment, setGeniusSegment] = createSignal(0)
  const [query, setQuery] = createSignal('')
  const [editing, setEditing] = createSignal<StoreEditingState>('None')
  const [album, setAlbum] = createSignal<StoreItem | undefined>()

  onMount(loadStoreFeeds)

  const videoItems = () => (videoSegment() === 0 ? storeMovies() : storeTelevision())

  const typeQuery = (next: string) => {
    setQuery(next)
    if (next.length > 0) {
      setEditing('Active')
      return
    }
    if (editing() !== 'None') setEditing('ActiveEmpty')
  }

  const submitQuery = () => {
    setEditing('None')
    void searchStore(query())
  }

  const isSearching = () => tab() === 'Search' && editing() !== 'None'

  const trailing = () => {
    if (tab() === 'Music' && !album()) {
      return (
        <UISegmentedControl
          segments={['New Releases', 'Top Tens']}
          selected={musicSegment()}
          width={UISegmentedControlMetrics.dualWidth}
          onSelect={setMusicSegment}
        />
      )
    }
    if (tab() === 'Videos') {
      return (
        <UISegmentedControl
          segments={['Movies', 'TV Shows', 'Music Videos']}
          selected={videoSegment()}
          width={props.width - StoreMetrics.segmentedInset}
          onSelect={setVideoSegment}
        />
      )
    }
    if (tab() === 'Genius') {
      return (
        <UISegmentedControl
          segments={['Music', 'Movies', 'TV Shows']}
          selected={geniusSegment()}
          width={props.width - StoreMetrics.segmentedInset}
          onSelect={setGeniusSegment}
        />
      )
    }
    if (tab() === 'Search') {
      return (
        <StoreSearchField
          value={query()}
          onInput={typeQuery}
          onFocus={() => setEditing(query().length > 0 ? 'Active' : 'ActiveEmpty')}
          onSubmit={submitQuery}
        />
      )
    }
    return undefined
  }

  return (
    <div class="relative flex h-full w-full flex-col overflow-hidden">
      <UIStatusBar style="inApp" />

      <UINavigationBar
        title={album()?.title ?? tab()}
        titleView={trailing()}
        leading={
          <Show when={album()}>
            <UIBarButton title="Music" tone="blueGray" onClick={() => setAlbum(undefined)} />
          </Show>
        }
      />

      <div class="relative flex-1 overflow-hidden">
        <UIPinstripeBackground>
          <Switch
            fallback={
              <UIScrollView class="h-full w-full">
                <Switch>
                  <Match when={tab() === 'Music'}>
                    <StoreMusicView segment={musicSegment()} onOpenAlbum={setAlbum} />
                  </Match>

                  <Match when={tab() === 'Videos'}>
                    <div style={{ height: `${StoreMetrics.contentPadding}px` }} />
                    <Show when={videoItems().length > 0} fallback={<Empty title="Loading…" />}>
                      <StoreListSection
                        items={videoItems()}
                        rowHeight={StoreMetrics.albumRowHeight}
                        artSize={StoreMetrics.albumArtSize}
                        detail={() => '0 Ratings'}
                        onSelect={() => undefined}
                      />
                    </Show>
                    <div style={{ height: `${StoreMetrics.sectionSpacing}px` }} />
                    <StoreAccountFooter />
                    <div style={{ height: `${StoreMetrics.termsSpacing}px` }} />
                  </Match>

                  <Match when={tab() === 'Genius'}>
                    <StoreGeniusView segment={geniusSegment()} />
                  </Match>

                  <Match when={tab() === 'More'}>
                    <StoreMoreView />
                  </Match>
                </Switch>
              </UIScrollView>
            }
          >
            <Match when={tab() === 'Search'}>
              <StoreSearchView
                onSelect={(item) => {
                  if (!item.tracks) return
                  setTab('Music')
                  setAlbum(item)
                }}
              />
            </Match>

            <Match when={album()}>
              {(current) => <StoreAlbumDestination album={current()} />}
            </Match>
          </Switch>
        </UIPinstripeBackground>

        <Show when={isSearching()}>
          <div class="absolute inset-0" style={{ background: StorePalette.searchDim }} />
        </Show>
      </div>

      <StoreTabBar
        width={props.width}
        selected={tab()}
        onSelect={(next) => {
          setAlbum(undefined)
          setEditing('None')
          setTab(next)
        }}
      />

      <UIKeyboardView
        visible={isSearching()}
        width={props.width}
        configuration={UIKeyboardSearch(query().length > 0)}
        onInsert={(text) => typeQuery(query() + text)}
        onDelete={() => typeQuery(query().slice(0, -1))}
        onReturn={submitQuery}
      />
    </div>
  )
}
