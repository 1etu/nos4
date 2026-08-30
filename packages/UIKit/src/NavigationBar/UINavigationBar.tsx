import { Show, type JSX } from 'solid-js'
import { UINavigationBarMetrics, UINavigationBarPalette } from './UINavigationBarMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export type UIBarStyle = 'default' | 'black'

export const UINavigationBar = (props: {
  title: string
  style?: UIBarStyle
  titleView?: JSX.Element
  leading?: JSX.Element
  trailing?: JSX.Element
}) => (
  <div
    class="relative flex w-full shrink-0 items-center justify-center"
    style={{
      height: `${UINavigationBarMetrics.height}px`,
      background:
        props.style === 'black'
          ? UINavigationBarPalette.black
          : UINavigationBarPalette.default,
      'border-bottom': `1px solid ${UINavigationBarPalette.edge}`,
      'box-shadow': 'inset 0 -1px 0 rgba(230,230,230,0.2)'
    }}
  >
    <Show when={props.titleView}>{props.titleView}</Show>

    <Show when={!props.titleView}>
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${UINavigationBarMetrics.titleFontSize}px`,
        'font-weight': '700',
        color: 'white',
        'text-shadow': '0 -1px 0 rgba(0,0,0,0.21)',
        'max-width': `${UINavigationBarMetrics.titleMaxWidth}px`,
        'white-space': 'nowrap',
        overflow: 'hidden',
        'text-overflow': 'ellipsis'
      }}
    >
      {props.title}
    </span>
    </Show>

    <Show when={props.leading}>
      <div class="absolute" style={{ left: `${UINavigationBarMetrics.itemInset}px` }}>
        {props.leading}
      </div>
    </Show>

    <Show when={props.trailing}>
      <div class="absolute" style={{ right: `${UINavigationBarMetrics.itemInset}px` }}>
        {props.trailing}
      </div>
    </Show>
  </div>
)
