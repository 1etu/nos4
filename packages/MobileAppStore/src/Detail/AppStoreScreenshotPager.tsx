import { For, onCleanup, onMount, createSignal } from 'solid-js'
import { gsAttachEventTap } from 'GraphicsServices'
import { AppStoreMetrics, AppStorePalette } from '../Support/AppStoreMetrics'

export const AppStoreScreenshotPager = (props: {
  width: number
  height: number
  screenshots: readonly string[]
}) => {
  const [page, setPage] = createSignal(0)
  const [drag, setDrag] = createSignal(0)

  let host!: HTMLDivElement
  let origin = 0
  let stride = 1

  const itemWidth = () => props.width - AppStoreMetrics.pagerItemInsetX
  const lastPage = () => Math.max(props.screenshots.length - 1, 0)

  onMount(() => {
    const detach = gsAttachEventTap(host, {
      onHandDown: (event) => {
        const bounds = host.getBoundingClientRect()
        stride = bounds.width > 0 ? bounds.width / props.width : 1
        origin = event.x
        setDrag(0)
      },
      onHandDragged: (event) => setDrag((event.x - origin) / stride),
      onHandUp: () => {
        const moved = drag()
        setDrag(0)
        if (Math.abs(moved) < itemWidth() / 2) return
        const next = moved < 0 ? page() + 1 : page() - 1
        setPage(Math.min(Math.max(next, 0), lastPage()))
      }
    })
    onCleanup(detach)
  })

  const shift = () =>
    drag() -
    page() * (itemWidth() + AppStoreMetrics.pagerItemSpacing) +
    (props.width - itemWidth()) / 2

  return (
    <div
      ref={host}
      class="relative shrink-0 overflow-hidden"
      style={{
        width: `${props.width}px`,
        height: `${props.height}px`,
        background: AppStorePalette.pagerBackground,
        'touch-action': 'none'
      }}
    >
      <div
        class="absolute inset-y-0 flex items-center"
        style={{
          gap: `${AppStoreMetrics.pagerItemSpacing}px`,
          transform: `translateX(${shift()}px)`
        }}
      >
        <For each={props.screenshots}>
          {(url) => (
            <img
              src={url}
              alt=""
              draggable={false}
              class="shrink-0"
              style={{
                width: `${itemWidth()}px`,
                height: 'auto',
                'max-height': `${props.height - AppStoreMetrics.pagerItemInsetY}px`,
                'object-fit': 'contain',
                border: `${AppStoreMetrics.pagerShotBorder}px solid ${AppStorePalette.pagerShotBorder}`,
                'box-shadow': AppStorePalette.pagerShotShadow,
                'margin-bottom': `${AppStoreMetrics.pagerShotBottomInset}px`
              }}
            />
          )}
        </For>
      </div>

      <div
        class="pointer-events-none absolute inset-0"
        style={{ background: AppStorePalette.pagerVignette }}
      />

      <div
        class="pointer-events-none absolute inset-x-0 flex items-center justify-center"
        style={{
          bottom: `${AppStoreMetrics.pagerDotBottomInset}px`,
          gap: `${AppStoreMetrics.pagerDotGap}px`
        }}
      >
        <For each={props.screenshots}>
          {(_, at) => (
            <div
              style={{
                width: `${AppStoreMetrics.pagerDotSize}px`,
                height: `${AppStoreMetrics.pagerDotSize}px`,
                'border-radius': '9999px',
                background: 'white',
                opacity: `${at() === page() ? 1 : AppStoreMetrics.pagerDotIdleOpacity}`
              }}
            />
          )}
        </For>
      </div>
    </div>
  )
}
