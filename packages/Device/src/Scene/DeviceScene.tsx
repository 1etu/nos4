import { lazy, Show, type JSX } from 'solid-js'
import { uiScreenIsCompact } from 'UIKit'
import { DeviceFullscreen } from '../Hardware/DeviceFullscreen'

const DeviceDesktopScene = lazy(async () => ({
  default: (await import('./DeviceDesktopScene')).DeviceDesktopScene
}))

export const DeviceScene = (props: { children: JSX.Element }) => (
  <Show when={uiScreenIsCompact()} fallback={<DeviceDesktopScene>{props.children}</DeviceDesktopScene>}>
    <DeviceFullscreen>{props.children}</DeviceFullscreen>
  </Show>
)
