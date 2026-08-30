import { For } from 'solid-js'
import { CGImage, assetURL } from 'CoreGraphics'
import { NotesMetrics, NotesPalette } from '../Support/NotesMetrics'
import { dateLabel, noteTitle, sortedNotes, type Note } from '../Support/NoteStore'
import { UIScrollView } from 'UIKit'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const NotesListView = (props: { onOpen: (note: Note) => void }) => (
  <div
    class="relative h-full w-full overflow-hidden"
    style={{
      'background-image': `url(${assetURL('NotesBody')})`,
      'background-size': 'cover',
      'background-position': 'top center'
    }}
  >
    <UIScrollView class="h-full w-full">
      <div style={{ height: `${NotesMetrics.listTopSpacing}px` }} />
      <For each={sortedNotes()}>
        {(note) => (
          <button
            type="button"
            class="flex w-full flex-col justify-center"
            style={{ height: `${NotesMetrics.rowHeight}px` }}
            onClick={() => props.onOpen(note)}
          >
            <div class="flex flex-1 items-center">
              <span
                style={{
                  'font-family': "'Noteworthy Local', 'Noteworthy', 'Bradley Hand', cursive",
                  'font-size': `${NotesMetrics.rowTitleFontSize}px`,
                  'font-weight': '700',
                  color: NotesPalette.rowTitle,
                  'padding-left': `${NotesMetrics.rowInsetX}px`,
                  'white-space': 'nowrap',
                  overflow: 'hidden',
                  'text-overflow': 'ellipsis'
                }}
              >
                {noteTitle(note)}
              </span>
              <div class="flex-1" />
              <span
                style={{
                  'font-family': HelveticaNeue,
                  'font-size': `${NotesMetrics.rowDateFontSize}px`,
                  color: NotesPalette.rowDate,
                  'padding-right': `${NotesMetrics.rowInsetX}px`,
                  'white-space': 'nowrap'
                }}
              >
                {dateLabel(note.editedAt)}
              </span>
              <div style={{ 'padding-right': `${NotesMetrics.rowInsetX}px` }}>
                <CGImage name="UITableNext" />
              </div>
            </div>
            <div
              style={{ height: '1px', width: '100%', background: NotesPalette.rowSeparator }}
            />
          </button>
        )}
      </For>
    </UIScrollView>

    <img
      src={assetURL('NotesEdgeTop')}
      alt=""
      draggable={false}
      class="pointer-events-none absolute inset-x-0 top-0 w-full"
    />
    <img
      src={assetURL('NotesEdgeBottom')}
      alt=""
      draggable={false}
      class="pointer-events-none absolute inset-x-0 bottom-0 w-full"
    />
  </div>
)
