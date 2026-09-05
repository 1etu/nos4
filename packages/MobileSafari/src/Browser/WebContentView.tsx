import { createEffect, onCleanup, onMount } from 'solid-js'
import { MobileSafariMetrics, MobileSafariPalette } from '../Support/MobileSafariMetrics'
import { frameURL, reportedURL } from '../Support/MobileSafariService'

interface BridgeMessage {
  readonly source?: string
  readonly kind?: string
  readonly title?: string
  readonly url?: string
  readonly value?: number
  readonly y?: number
}

export const WebContentView = (props: {
  url: string
  active: boolean
  height: number
  onTitle: (title: string) => void
  onLocation: (url: string) => void
  onProgress: (value: number) => void
  onNavigate: (url: string) => void
  onScroll: (y: number) => void
  onFocusField: () => void
}) => {
  let frame: HTMLIFrameElement | undefined

  const receive = (event: MessageEvent<BridgeMessage>) => {
    const data = event.data
    if (!data || data.source !== 'nos4-web-bridge') return
    if (!props.active) return
    if (frame && event.source !== frame.contentWindow) return

    if (data.kind === 'title' && typeof data.title === 'string') props.onTitle(data.title)
    if (data.kind === 'location' && typeof data.url === 'string') {
      const url = reportedURL(data.url)
      frame?.setAttribute('data-src', frameURL(url))
      props.onLocation(url)
    }
    if (data.kind === 'progress' && typeof data.value === 'number') props.onProgress(data.value)
    if (data.kind === 'navigate' && typeof data.url === 'string') {
      props.onNavigate(reportedURL(data.url))
    }
    if (data.kind === 'scroll' && typeof data.y === 'number') props.onScroll(data.y)
    if (data.kind === 'focus') props.onFocusField()
  }

  onMount(() => {
    window.addEventListener('message', receive)
    onCleanup(() => window.removeEventListener('message', receive))
  })

  createEffect(() => {
    const next = frameURL(props.url)
    if (!frame || frame.getAttribute('data-src') === next) return
    frame.setAttribute('data-src', next)
    frame.src = next
  })

  return (
    <div
      class="relative w-full overflow-hidden"
      style={{
        height: `${props.height}px`,
        background: MobileSafariPalette.chrome,
        'box-shadow': `0 ${MobileSafariMetrics.webShadowOffsetY}px ${MobileSafariMetrics.webShadowBlur}px rgba(0,0,0,0.4)`
      }}
    >
      <iframe
        ref={frame}
        title="page"
        class="h-full w-full"
        onLoad={() => {
          if (props.active) props.onProgress(1)
        }}
        style={{
          border: 'none',
          background: MobileSafariPalette.chrome,
          'pointer-events': props.active ? 'auto' : 'none'
        }}
        sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
      />
    </div>
  )
}
