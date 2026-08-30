import { For, Show, createSignal, onCleanup } from 'solid-js'
import { assetURL, type AssetName } from 'CoreGraphics'
import { caAfter, type CATransaction } from 'CoreAnimation'
import { UIStatusBar, UIWallpaperTarget, uiWallpaperSet, type UIWallpaperTargetValue } from 'UIKit'
import { PreferencesMetrics, PreferencesPalette } from '../Support/PreferencesMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

interface ChoiceSpec {
  readonly id: string
  readonly title: string
  readonly targets: readonly UIWallpaperTargetValue[]
}

const Choices: readonly ChoiceSpec[] = [
  { id: 'lock', title: 'Set Lock Screen', targets: [UIWallpaperTarget.lock] },
  { id: 'home', title: 'Set Home Screen', targets: [UIWallpaperTarget.home] },
  { id: 'both', title: 'Set Both', targets: [UIWallpaperTarget.lock, UIWallpaperTarget.home] }
]

const SheetButton = (props: { title: string; dark: boolean; onClick: () => void }) => (
  <button
    type="button"
    class="flex w-full items-center justify-center"
    style={{
      height: `${PreferencesMetrics.wallpaperSetButtonHeight}px`,
      'border-radius': `${PreferencesMetrics.wallpaperSetButtonRadius}px`,
      background: PreferencesPalette.setButtonOuter,
      padding: '3px'
    }}
    onClick={props.onClick}
  >
    <span
      class="flex h-full w-full items-center justify-center"
      style={{
        'border-radius': `${PreferencesMetrics.wallpaperSetInnerRadius}px`,
        background: props.dark
          ? PreferencesPalette.setButtonDark
          : PreferencesPalette.setButtonLight,
        'font-family': HelveticaNeue,
        'font-size': `${PreferencesMetrics.valueFontSize}px`,
        'font-weight': '700',
        color: props.dark ? PreferencesPalette.setButtonDarkInk : PreferencesPalette.setButtonLightInk
      }}
    >
      {props.title}
    </span>
  </button>
)

export const PreferencesWallpaperSet = (props: {
  wallpaper: AssetName
  onDone: () => void
}) => {
  const [saving, setSaving] = createSignal(false)
  let hold: CATransaction | undefined
  let dismiss: CATransaction | undefined

  onCleanup(() => {
    hold?.cancel()
    dismiss?.cancel()
  })

  const apply = (targets: readonly UIWallpaperTargetValue[]) => {
    uiWallpaperSet(targets, props.wallpaper)
    setSaving(true)
    hold = caAfter(PreferencesMetrics.savingHoldSeconds, () => {
      dismiss = caAfter(
        PreferencesMetrics.savingDismissSeconds - PreferencesMetrics.savingHoldSeconds,
        props.onDone
      )
    })
  }

  return (
    <div class="absolute inset-0 overflow-hidden" style={{ background: 'black' }}>
      <img
        src={assetURL(props.wallpaper)}
        alt=""
        draggable={false}
        class="absolute inset-0 h-full w-full"
        style={{ 'object-fit': 'cover' }}
      />
      <div class="relative flex h-full w-full flex-col">
        <UIStatusBar />
        <div class="flex-1" />
        <Show when={!saving()}>
          <div
            class="flex flex-col"
            style={{
              gap: `${PreferencesMetrics.wallpaperSheetGap}px`,
              padding: `0 ${PreferencesMetrics.wallpaperSetButtonInsetX}px ${PreferencesMetrics.wallpaperSetButtonInsetX}px`
            }}
          >
            <For each={Choices}>
              {(choice) => (
                <SheetButton
                  title={choice.title}
                  dark={false}
                  onClick={() => apply(choice.targets)}
                />
              )}
            </For>
            <SheetButton title="Cancel" dark onClick={props.onDone} />
          </div>
        </Show>
      </div>

      <Show when={saving()}>
        <div class="absolute inset-0 flex items-center justify-center">
          <div
            class="flex flex-col items-center justify-center"
            style={{
              width: `calc(100% - ${PreferencesMetrics.savingHudInsetX * 2}px)`,
              height: `${PreferencesMetrics.savingHudHeight}px`,
              'border-radius': `${PreferencesMetrics.savingHudRadius}px`,
              background: PreferencesPalette.savingHud,
              gap: '10px'
            }}
          >
            <svg
              width={PreferencesMetrics.savingHudGlyphSize}
              height={PreferencesMetrics.savingHudGlyphSize}
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 12.5 L9.5 18 L20 6"
                stroke="white"
                stroke-width="3.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${PreferencesMetrics.savingHudFontSize}px`,
                'font-weight': '700',
                color: 'white'
              }}
            >
              Set
            </span>
          </div>
        </div>
      </Show>
    </div>
  )
}
