import { createSignal, type Accessor } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import { NSUserDefaults } from 'NSUserDefaults'
import { UIScreenDefaultsKey, UIScreenMetrics } from './UIScreenMetrics'
import { UIScreenBrightnessDidChange, UIScreenIdentifier } from './UIScreenNotifications'

const CompactQuery = `(max-width: ${UIScreenMetrics.compactWidth}px)`

const compactQuery = window.matchMedia(CompactQuery)
const [compact, setCompact] = createSignal(compactQuery.matches)
compactQuery.addEventListener('change', (event) => setCompact(event.matches))

export const uiScreenIsCompact: Accessor<boolean> = compact

const clamp = (value: number): number =>
  Math.min(Math.max(value, UIScreenMetrics.minimumBrightness), 1)

const [brightness, setBrightness] = createSignal(
  clamp(
    NSUserDefaults.object<number>(UIScreenDefaultsKey.brightness) ??
      UIScreenMetrics.defaultBrightness
  )
)

const [autoBrightness, setAutoBrightness] = createSignal(
  NSUserDefaults.object<boolean>(UIScreenDefaultsKey.autoBrightness) ??
    UIScreenMetrics.autoBrightnessDefault
)

const [sceneHidden, setSceneHidden] = createSignal(
  NSUserDefaults.object<boolean>(UIScreenDefaultsKey.sceneHidden) ??
    UIScreenMetrics.sceneHiddenDefault
)

export const uiScreenSceneHidden: Accessor<boolean> = sceneHidden

export const uiScreenSceneStaged = (): boolean => sceneHidden() || compact()

export const uiScreenSetSceneHidden = (hidden: boolean): void => {
  if (sceneHidden() === hidden) return
  setSceneHidden(hidden)
  NSUserDefaults.setObject(UIScreenDefaultsKey.sceneHidden, hidden)
}

export const uiScreenBrightness: Accessor<number> = brightness
export const uiScreenAutoBrightness: Accessor<boolean> = autoBrightness

export const uiScreenDimLevel = (): number => (1 - brightness()) * UIScreenMetrics.dimCeiling

export const uiScreenSetBrightness = (value: number): void => {
  const next = clamp(value)
  if (brightness() === next) return
  setBrightness(next)
  NSUserDefaults.setObject(UIScreenDefaultsKey.brightness, next)
  NSNotificationCenter.post(UIScreenBrightnessDidChange, UIScreenIdentifier, { brightness: next })
}

export const uiScreenSetAutoBrightness = (enabled: boolean): void => {
  if (autoBrightness() === enabled) return
  setAutoBrightness(enabled)
  NSUserDefaults.setObject(UIScreenDefaultsKey.autoBrightness, enabled)
}
