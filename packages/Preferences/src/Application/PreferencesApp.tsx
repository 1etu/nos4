import { Match, Show, Switch, createMemo, createSignal, onCleanup } from 'solid-js'
import type { AssetName } from 'CoreGraphics'
import { CAMediaTimingFunction, caAfter, caAnimation, caTransition, type CATransaction } from 'CoreAnimation'
import { UIPinstripeBackground, UIStatusBar } from 'UIKit'
import { PreferencesTitleBar, type PreferencesBackSpec } from '../Chrome/PreferencesTitleBar'
import { PreferencesAboutPage } from '../Pages/PreferencesAboutPage'
import { PreferencesBrightnessPage } from '../Pages/PreferencesBrightnessPage'
import { PreferencesListPage } from '../Pages/PreferencesListPage'
import { PreferencesSoundsPage } from '../Pages/PreferencesSoundsPage'
import { PreferencesWallpaperGrid } from '../Pages/PreferencesWallpaperGrid'
import { PreferencesWallpaperPage } from '../Pages/PreferencesWallpaperPage'
import { PreferencesWallpaperSelect } from '../Pages/PreferencesWallpaperSelect'
import { PreferencesWallpaperSet } from '../Pages/PreferencesWallpaperSet'
import { PreferencesWiFiPage } from '../Pages/PreferencesWiFiPage'
import { PreferencesPage, preferencesPageFor } from '../Support/PreferencesCatalog'
import { PreferencesMetrics } from '../Support/PreferencesMetrics'

const GeneralPrefix = 'General_'
const DeviceName = 'iPhone'

const slide = caAnimation(PreferencesMetrics.slideDuration, CAMediaTimingFunction.linear)

const titleFor = (view: string): string => {
  if (view === PreferencesPage.location) return '  Location Services'
  if (view === PreferencesPage.wallpaperSelect) return ''
  if (view === PreferencesPage.wallpaperGrid) return 'Wallpaper'
  if (view === PreferencesPage.wallpaperCameraRoll) return 'Camera Roll'
  if (view.startsWith(GeneralPrefix)) return view.slice(GeneralPrefix.length)
  return preferencesPageFor(view)?.title ?? view
}

const backFor = (view: string): PreferencesBackSpec | undefined => {
  if (view === PreferencesPage.root) return undefined
  if (view === PreferencesPage.wallpaperSelect) {
    return {
      label: 'Wallpaper',
      destination: PreferencesPage.wallpaper,
      asset: 'Button_wp4',
      width: 84
    }
  }
  if (view === PreferencesPage.wallpaperGrid || view === PreferencesPage.wallpaperCameraRoll) {
    return {
      label: 'Back',
      destination: PreferencesPage.wallpaperSelect,
      asset: 'Button2',
      width: PreferencesMetrics.backButtonWidth
    }
  }
  if (view.startsWith(GeneralPrefix)) {
    return {
      label: 'General',
      destination: PreferencesPage.general,
      asset: 'Button2',
      width: PreferencesMetrics.backButtonWidth
    }
  }
  return {
    label: 'Settings',
    destination: PreferencesPage.root,
    asset: 'Button2',
    width: PreferencesMetrics.backButtonWidth
  }
}

export const PreferencesApp = (props: { width: number; height: number }) => {
  const [view, setView] = createSignal<string>(PreferencesPage.root)
  const [outgoing, setOutgoing] = createSignal<string | undefined>()
  const [backward, setBackward] = createSignal(false)
  const [entering, setEntering] = createSignal(false)
  const [chosen, setChosen] = createSignal<AssetName | undefined>()

  let handoff: CATransaction | undefined
  let settle: CATransaction | undefined

  onCleanup(() => {
    handoff?.cancel()
    settle?.cancel()
  })

  const transition = (next: string, isBack: boolean) => {
    handoff?.cancel()
    settle?.cancel()
    setBackward(isBack)
    const begin = () => {
      setOutgoing(view())
      setView(next)
      setEntering(true)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setEntering(false)
          settle = caAfter(PreferencesMetrics.slideDuration, () => setOutgoing(undefined))
        })
      )
    }
    if (isBack) {
      begin()
      return
    }
    handoff = caAfter(PreferencesMetrics.pushDelay, begin)
  }

  const open = (id: string) => {
    if (id.length === 0) return
    transition(id, false)
  }

  const back = (id: string) => transition(id, true)

  const offscreen = () => (backward() ? -props.width : props.width)

  const pageFor = (id: string) => (
    <Switch fallback={<PreferencesListPage sections={preferencesPageFor(id)?.sections ?? []} onOpen={open} />}>
      <Match when={id === PreferencesPage.brightness}>
        <PreferencesBrightnessPage />
      </Match>
      <Match when={id === PreferencesPage.sounds}>
        <PreferencesSoundsPage onOpen={open} />
      </Match>
      <Match when={id === PreferencesPage.wifi}>
        <PreferencesWiFiPage />
      </Match>
      <Match when={id === PreferencesPage.about}>
        <PreferencesAboutPage deviceName={DeviceName} onOpen={open} />
      </Match>
      <Match when={id === PreferencesPage.wallpaper}>
        <PreferencesWallpaperPage onOpen={open} />
      </Match>
      <Match when={id === PreferencesPage.wallpaperSelect}>
        <PreferencesWallpaperSelect onOpen={open} />
      </Match>
      <Match when={id === PreferencesPage.wallpaperGrid}>
        <PreferencesWallpaperGrid onPick={setChosen} />
      </Match>
      <Match when={id === PreferencesPage.wallpaperCameraRoll}>
        <PreferencesWallpaperGrid empty onPick={setChosen} />
      </Match>
    </Switch>
  )

  const stage = createMemo(() => ({ width: props.width, height: props.height }))

  return (
    <div class="relative flex h-full w-full flex-col overflow-hidden">
      <UIStatusBar style="inApp" />
      <PreferencesTitleBar title={titleFor(view())} back={backFor(view())} onBack={back} />

      <div class="relative flex-1 overflow-hidden">
        <UIPinstripeBackground>
          <div class="relative h-full w-full overflow-hidden">
            <Show when={outgoing()}>
              {(previous) => (
                <div
                  class="absolute inset-0"
                  style={{
                    transform: entering() ? 'translateX(0px)' : `translateX(${-offscreen()}px)`,
                    transition: entering() ? 'none' : caTransition(['transform'], slide)
                  }}
                >
                  {pageFor(previous())}
                </div>
              )}
            </Show>
            <div
              class="absolute inset-0"
              style={{
                transform: entering() ? `translateX(${offscreen()}px)` : 'translateX(0px)',
                transition: entering() ? 'none' : caTransition(['transform'], slide)
              }}
            >
              {pageFor(view())}
            </div>
          </div>
        </UIPinstripeBackground>
      </div>

      <Show when={chosen()}>
        {(wallpaper) => (
          <div class="absolute inset-0" style={{ width: `${stage().width}px`, height: `${stage().height}px` }}>
            <PreferencesWallpaperSet wallpaper={wallpaper()} onDone={() => setChosen(undefined)} />
          </div>
        )}
      </Show>
    </div>
  )
}
