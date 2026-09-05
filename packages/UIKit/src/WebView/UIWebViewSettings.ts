import { createSignal, type Accessor } from 'solid-js'
import { NSUserDefaults } from 'NSUserDefaults'

export const UIWebViewMetrics = {
  timeTravelDefault: true
} as const

export const UIWebViewDefaultsKey = {
  timeTravel: 'webViewTimeTravel'
} as const

const [timeTravel, setTimeTravel] = createSignal(
  NSUserDefaults.object<boolean>(UIWebViewDefaultsKey.timeTravel) ??
    UIWebViewMetrics.timeTravelDefault
)

export const uiWebViewTimeTravel: Accessor<boolean> = timeTravel

export const uiWebViewSetTimeTravel = (enabled: boolean): void => {
  if (timeTravel() === enabled) return
  setTimeTravel(enabled)
  NSUserDefaults.setObject(UIWebViewDefaultsKey.timeTravel, enabled)
}
