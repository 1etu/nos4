import { Show, type JSX } from 'solid-js'
import { uiScreenIsCompact } from 'UIKit'
import { DeviceFullscreen } from '../Hardware/DeviceFullscreen'
import { DeviceDesktopScene } from './DeviceDesktopScene'

export const DeviceScene = (props: { children: JSX.Element }) => (
  <Show when={uiScreenIsCompact()} fallback={<DeviceDesktopScene>{props.children}</DeviceDesktopScene>}>
    <DeviceFullscreen>{props.children}</DeviceFullscreen>
  </Show>
)
