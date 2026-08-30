import { For, Show } from 'solid-js'
import { UITabBarMetrics, UITabBarPalette } from './UITabBarMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export interface UITabBarItem {
  readonly id: string
  readonly title: string
  readonly icon: string
  readonly iconWidth: number
}

const maskStyle = (icon: string) => ({
  '-webkit-mask-image': icon,
  'mask-image': icon,
  '-webkit-mask-repeat': 'no-repeat',
  'mask-repeat': 'no-repeat',
  '-webkit-mask-position': 'center',
  'mask-position': 'center',
  '-webkit-mask-size': 'contain',
  'mask-size': 'contain'
})

const TabIcon = (props: { icon: string; width: number; selected: boolean }) => (
  <div
    class="relative"
    style={{ width: `${props.width}px`, height: `${UITabBarMetrics.iconSize}px` }}
  >
    <Show when={props.selected}>
      <div
        class="absolute inset-0"
        style={{ ...maskStyle(props.icon), background: UITabBarPalette.iconRim }}
      />
    </Show>
    <div
      class="absolute inset-0"
      style={{
        ...maskStyle(props.icon),
        background: props.selected ? UITabBarPalette.iconSelected : UITabBarPalette.iconIdle,
        filter: props.selected
          ? 'brightness(1.095) drop-shadow(0 2.5px 5px rgba(0,0,0,0.6))'
          : 'drop-shadow(0 -1px 0 rgba(0,0,0,0.75))',
        transform: props.selected ? 'scale(0.983)' : 'none'
      }}
    />
  </div>
)

export const UITabBar = (props: {
  width: number
  items: readonly UITabBarItem[]
  selected: string
  onSelect: (id: string) => void
}) => (
  <div
    class="relative flex shrink-0 items-center"
    style={{ height: `${UITabBarMetrics.height}px`, background: UITabBarPalette.chrome }}
  >
    <div class="flex w-full items-end" style={{ height: `${UITabBarMetrics.rowHeight}px` }}>
      <For each={props.items}>
        {(item) => (
          <button
            type="button"
            class="relative flex flex-1 flex-col items-center justify-end"
            style={{
              height: `${UITabBarMetrics.rowHeight}px`,
              gap: `${UITabBarMetrics.iconGap}px`
            }}
            onClick={() => props.onSelect(item.id)}
          >
            <Show when={props.selected === item.id}>
              <div
                class="absolute bottom-0"
                style={{
                  width: `${props.width / props.items.length - UITabBarMetrics.selectionInset}px`,
                  height: `${UITabBarMetrics.selectionHeight}px`,
                  'border-radius': `${UITabBarMetrics.selectionRadius}px`,
                  background: UITabBarPalette.selection,
                  'mix-blend-mode': 'screen'
                }}
              />
            </Show>
            <div class="relative flex flex-1 items-end pb-0.5">
              <TabIcon
                icon={item.icon}
                width={item.iconWidth}
                selected={props.selected === item.id}
              />
            </div>
            <span
              class="relative"
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${UITabBarMetrics.labelFontSize}px`,
                'font-weight': '700',
                color:
                  props.selected === item.id
                    ? UITabBarPalette.labelSelected
                    : UITabBarPalette.labelIdle,
                'padding-bottom': `${UITabBarMetrics.labelPaddingBottom}px`
              }}
            >
              {item.title}
            </span>
          </button>
        )}
      </For>
    </div>
  </div>
)
