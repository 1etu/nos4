import { Show } from 'solid-js'
import { MobileiPodMetrics } from '../Support/MobileiPodMetrics'
import { MusicSearchResults } from './MusicSearchResults'
import { searchEditing } from './MusicSearch'
import { type MPMediaItem } from '../Support/MPMediaLibrary'

export const MusicSearchOverlay = (props: { onPlay: (song: MPMediaItem) => void }) => (
  <>
    <Show when={searchEditing() === 'Active_Empty'}>
      <div
        class="absolute inset-x-0 bottom-0"
        style={{
          top: `${MobileiPodMetrics.searchRowHeight}px`,
          background: 'rgba(0,0,0,0.9)'
        }}
      />
    </Show>
    <Show when={searchEditing() === 'Active'}>
      <div
        class="absolute inset-x-0 bottom-0"
        style={{ top: `${MobileiPodMetrics.searchRowHeight}px` }}
      >
        <MusicSearchResults onPlay={props.onPlay} />
      </div>
    </Show>
  </>
)
