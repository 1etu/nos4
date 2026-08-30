import { For } from 'solid-js'
import { UIScrollView } from 'UIKit'
import { MessagesMetrics, MessagesPalette } from '../Support/MessagesMetrics'
import { smsConversations, type SMSConversation } from '../Support/MessageStore'
import { ConversationRow } from './ConversationRow'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const SearchGlyph = () => (
  <svg
    width={MessagesMetrics.searchGlyphSize}
    height={MessagesMetrics.searchGlyphSize}
    viewBox="0 0 16 16"
    aria-hidden="true"
  >
    <circle
      cx="6.6"
      cy="6.6"
      r="4.8"
      fill="none"
      stroke={MessagesPalette.searchPlaceholder}
      stroke-width="1.8"
    />
    <path
      d="M10.2 10.2 14.4 14.4"
      stroke={MessagesPalette.searchPlaceholder}
      stroke-width="1.8"
      stroke-linecap="round"
    />
  </svg>
)

export const ConversationList = (props: {
  now: Date
  onOpen: (conversation: SMSConversation) => void
}) => (
  <div class="flex min-h-0 flex-1 flex-col" style={{ background: MessagesPalette.list }}>
    <div
      class="flex shrink-0 items-center"
      style={{
        height: `${MessagesMetrics.searchBarHeight}px`,
        padding: `0 ${MessagesMetrics.searchFieldInsetX}px`,
        background: MessagesPalette.searchBar
      }}
    >
      <div
        class="flex w-full items-center"
        style={{
          height: `${MessagesMetrics.searchFieldHeight}px`,
          padding: `0 ${MessagesMetrics.searchGlyphGap}px`,
          gap: `${MessagesMetrics.searchGlyphGap}px`,
          'border-radius': `${MessagesMetrics.searchFieldRadius}px`,
          background: MessagesPalette.searchField,
          border: `1px solid ${MessagesPalette.searchFieldStroke}`
        }}
      >
        <SearchGlyph />
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${MessagesMetrics.searchFontSize}px`,
            color: MessagesPalette.searchPlaceholder
          }}
        >
          Search
        </span>
      </div>
    </div>

    <UIScrollView class="min-h-0 flex-1">
      <For each={smsConversations()}>
        {(conversation) => (
          <ConversationRow
            conversation={conversation}
            now={props.now}
            onOpen={() => props.onOpen(conversation)}
          />
        )}
      </For>
    </UIScrollView>
  </div>
)
