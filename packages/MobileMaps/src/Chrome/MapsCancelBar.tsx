import { Show, createEffect, createSignal, on, onCleanup } from 'solid-js'
import { MapsMetrics, MapsPalette } from '../Support/MapsMetrics'
import { MapsBarButton } from './MapsBarButton'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const MapsCancelBar = (props: {
  open: boolean
  title: string
  onClear: () => void
  onCancel: () => void
}) => {
  const [mounted, setMounted] = createSignal(props.open)
  const [shown, setShown] = createSignal(props.open)
  let settle: ReturnType<typeof setTimeout> | undefined

  createEffect(
    on(
      () => props.open,
      (open) => {
        clearTimeout(settle)
        if (open) {
          setMounted(true)
          settle = setTimeout(() => setShown(true), MapsMetrics.editingHandoff)
          return
        }
        setShown(false)
        settle = setTimeout(() => setMounted(false), MapsMetrics.editingMilliseconds)
      }
    )
  )

  onCleanup(() => clearTimeout(settle))

  return (
    <Show when={mounted()}>
      <div
        class="shrink-0 overflow-hidden"
        style={{
          height: `${shown() ? MapsMetrics.titleBarHeight : 0}px`,
          transition: `height ${MapsMetrics.editingMilliseconds}ms ease-in-out`
        }}
      >
        <div
          class="relative flex items-center justify-between"
          style={{
            height: `${MapsMetrics.titleBarHeight}px`,
            background: MapsPalette.barGradient,
            'border-bottom': `1px solid ${MapsPalette.barEdge}`,
            'box-shadow': `inset 0 -1px 0 ${MapsPalette.barHighlight}`,
            padding: `0 ${MapsMetrics.barButtonInset}px`,
            transform: `translateY(${shown() ? 0 : -MapsMetrics.titleBarHeight}px)`,
            transition: `transform ${MapsMetrics.editingMilliseconds}ms ease-in-out`
          }}
        >
          <MapsBarButton title=" Clear " onClick={props.onClear} />
          <span
            class="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${MapsMetrics.cancelTitleFontSize}px`,
              'font-weight': '700',
              color: 'white',
              'text-shadow': '0 -1px 0 rgba(0,0,0,0.21)'
            }}
          >
            {props.title}
          </span>
          <MapsBarButton title="Cancel" onClick={props.onCancel} />
        </div>
      </div>
    </Show>
  )
}
