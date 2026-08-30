import { createSignal, For, onMount, Show } from 'solid-js'
import { assetURL } from 'CoreGraphics'
import { applicationForBundle } from '../Support/Bundles'
import { SpringBoardMetrics } from '../Support/SpringBoardMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const FolderIcon = (props: {
  name: string
  bundleIds: readonly string[]
  onOpen: () => void
}) => {
  const [pressed, setPressed] = createSignal(false)

  onMount(() => {
    const warm = [assetURL('FolderSwitcherBG')]
    for (const bundleId of props.bundleIds) {
      const record = applicationForBundle(bundleId)
      if (record) warm.push(assetURL(record.icon))
    }
    for (const source of warm) {
      const image = new Image()
      image.src = source
    }
  })

  return (
    <button
      type="button"
      class="relative flex flex-col items-center"
      style={{
        width: `${SpringBoardMetrics.cellWidth}px`,
        gap: `${SpringBoardMetrics.iconLabelSpacing}px`
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={props.onOpen}
    >
      <img
        src={assetURL('WallpaperIconShadow')}
        alt=""
        draggable={false}
        class="pointer-events-none absolute left-1/2 top-1/2"
        style={{
          width: `${SpringBoardMetrics.iconShadowWidth}px`,
          transform: `translate(-50%, calc(-50% + ${SpringBoardMetrics.iconShadowOffsetY}px))`,
          'z-index': '0'
        }}
      />

      <div class="relative" style={{ width: `${SpringBoardMetrics.iconSize}px`, 'z-index': '1' }}>
        <Show when={pressed()}>
          <div
            class="absolute inset-0"
            style={{
              background: 'gray',
              'border-radius': `${SpringBoardMetrics.iconPressedRadius}px`
            }}
          />
        </Show>
        <img src={assetURL('Folder')} alt="" draggable={false} class="relative block w-full" />
        <div
          class="absolute inset-x-0 top-0 flex flex-wrap"
          style={{
            'padding-top': `${
              SpringBoardMetrics.folderPreviewSpacing *
              SpringBoardMetrics.folderPreviewPaddingTopFactor
            }px`,
            'justify-content': 'flex-start',
            'padding-left': `${
              (SpringBoardMetrics.iconSize -
                SpringBoardMetrics.folderPreviewColumns * SpringBoardMetrics.folderPreviewSize -
                (SpringBoardMetrics.folderPreviewColumns - 1) *
                  SpringBoardMetrics.folderPreviewSpacing) /
              2
            }px`,
            gap: `${SpringBoardMetrics.folderPreviewSpacing}px`
          }}
        >
          <For each={props.bundleIds}>
            {(bundleId) => {
              const record = applicationForBundle(bundleId)
              if (!record) return undefined
              return (
                <img
                  src={assetURL(record.smallIcon ?? record.icon)}
                  alt=""
                  draggable={false}
                  style={{
                    width: `${SpringBoardMetrics.folderPreviewSize}px`,
                    height: `${SpringBoardMetrics.folderPreviewSize}px`
                  }}
                />
              )
            }}
          </For>
        </div>
      </div>

      <span
        class="relative"
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${SpringBoardMetrics.labelFontSize}px`,
          'font-weight': '500',
          color: 'white',
          'text-shadow': `0 ${SpringBoardMetrics.labelShadowOffsetY}px ${SpringBoardMetrics.labelShadowBlur}px rgba(0,0,0,0.9)`,
          transform: `translateY(${SpringBoardMetrics.labelOffsetY}px)`,
          'white-space': 'nowrap',
          'z-index': '1'
        }}
      >
        {props.name}
      </span>
    </button>
  )
}
