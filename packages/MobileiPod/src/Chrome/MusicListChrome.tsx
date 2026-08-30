import { For, Show, type JSX } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { MobileiPodMetrics, MobileiPodPalette } from '../Support/MobileiPodMetrics'
import { UIScrollView } from 'UIKit'

export const HelveticaNeue =
  "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const Alphabet = [
  'Search',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '#'
] as const

export const indexLetter = (value: string): string => {
  const first = value.slice(0, 1).toUpperCase()
  return Alphabet.includes(first as (typeof Alphabet)[number]) && first !== 'Search' ? first : '#'
}

export const Separator = () => (
  <div
    style={{
      height: `${MobileiPodMetrics.hairline}px`,
      background: MobileiPodPalette.separator
    }}
  />
)

export const ListHeader = (props: { label: string }) => (
  <div
    class="relative flex items-center"
    style={{
      height: `${MobileiPodMetrics.headerHeight}px`,
      background: MobileiPodPalette.listHeader,
      'box-shadow': `inset 0 ${MobileiPodMetrics.headerTopBorderOuter}px 0 -${MobileiPodMetrics.headerTopBorderInner}px rgb(176,186,194), inset 0 ${MobileiPodMetrics.headerTopBorderInner}px 0 rgb(122,134,142)`
    }}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${MobileiPodMetrics.headerFontSize}px`,
        'font-weight': '700',
        color: 'white',
        'text-shadow': '0 1.2px 0 rgba(94,90,90,0.75)',
        'padding-left': `${MobileiPodMetrics.headerLeading}px`
      }}
    >
      {props.label}
    </span>
  </div>
)

export const RowTitle = (props: { text: string; trailing?: number }) => (
  <span
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${MobileiPodMetrics.rowFontSize}px`,
      'font-weight': '700',
      color: 'black',
      'padding-right': `${props.trailing ?? 0}px`,
      'white-space': 'nowrap',
      overflow: 'hidden',
      'text-overflow': 'ellipsis'
    }}
  >
    {props.text}
  </span>
)

export const RowSubtitle = (props: { text: string }) => (
  <span
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${MobileiPodMetrics.rowSubtitleFontSize}px`,
      'font-weight': '400',
      color: MobileiPodPalette.subtitle,
      'white-space': 'nowrap',
      overflow: 'hidden',
      'text-overflow': 'ellipsis'
    }}
  >
    {props.text}
  </span>
)

export const Chevron = () => (
  <div style={{ 'padding-right': `${MobileiPodMetrics.chevronTrailing}px` }}>
    <CGImage name="UITableNext" />
  </div>
)

export const ListFooterCount = (props: { label: string }) => (
  <div class="flex items-center justify-center" style={{ height: `${MobileiPodMetrics.rowHeight}px` }}>
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${MobileiPodMetrics.footerCountFontSize}px`,
        'font-weight': '400',
        color: MobileiPodPalette.subtitle
      }}
    >
      {props.label}
    </span>
  </div>
)

export const AlphabetIndex = (props: {
  present: readonly string[]
  onSelect: (letter: string) => void
}) => (
  <div
    class="absolute inset-y-0 right-0 z-10 flex flex-col items-end justify-center"
    style={{
      gap: `${MobileiPodMetrics.indexSpacing}px`,
      'padding-right': `${MobileiPodMetrics.indexTrailing}px`
    }}
  >
    <For each={Alphabet}>
      {(letter) => (
        <button
          type="button"
          class="flex items-center justify-center"
          style={{
            width: `${MobileiPodMetrics.indexWidth}px`,
            height: `${MobileiPodMetrics.indexEntryHeight}px`,
            'font-family': HelveticaNeue,
            'font-size': `${MobileiPodMetrics.indexFontSize}px`,
            'font-weight': '700',
            color: MobileiPodPalette.indexTint
          }}
          onClick={() => {
            if (letter !== 'Search' && !props.present.includes(letter)) return
            props.onSelect(letter)
          }}
        >
          <Show when={letter === 'Search'} fallback={letter}>
            <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
              <circle
                cx="4.4"
                cy="4.4"
                r="3.5"
                fill="none"
                stroke={MobileiPodPalette.indexTint}
                stroke-width="1.4"
              />
              <path
                d="M7.1 7.1 L10.2 10.2"
                stroke={MobileiPodPalette.indexTint}
                stroke-width="1.4"
                stroke-linecap="round"
              />
            </svg>
          </Show>
        </button>
      )}
    </For>
  </div>
)

export const SkeuomorphicList = (props: { children: JSX.Element }) => (
  <UIScrollView
    class="relative h-full w-full"
    style={{ background: MobileiPodPalette.listBackground }}
  >
    {props.children}
  </UIScrollView>
)
