import { createSignal, onCleanup, onMount, type JSX } from 'solid-js'
import './DeviceFullscreen.css'
import { NSNotificationCenter } from 'Foundation'
import { avObserveUserGesture, avPreloadSystemSounds } from 'AVFoundation'
import { uiDeviceSetBatteryMonitoringEnabled, uiScreenDimLevel } from 'UIKit'
import { DeviceMetrics } from '../Support/DeviceMetrics'
import { DeviceScreenHeight } from '../Support/DeviceScreen'
import { DeviceHomeButtonPressed, DeviceHomeButtonDoublePressed, DeviceIdentifier } from '../Support/DeviceNotifications'

export const DeviceFullscreen = (props: { children: JSX.Element }) => {
  const [size, setSize] = createSignal({ width: window.innerWidth, height: window.innerHeight })
  let screen!: HTMLDivElement
  let pending: ReturnType<typeof setTimeout> | undefined
  const scale = () => size().width / DeviceMetrics.stageWidth
  const home = () => {
    if (pending !== undefined) {
      clearTimeout(pending)
      pending = undefined
      NSNotificationCenter.post(DeviceHomeButtonDoublePressed, DeviceIdentifier, { count: 2 })
      return
    }
    pending = setTimeout(() => {
      pending = undefined
      NSNotificationCenter.post(DeviceHomeButtonPressed, DeviceIdentifier, { count: 1 })
    }, DeviceMetrics.doublePressWindow)
  }

  onMount(() => {
    avObserveUserGesture()
    avPreloadSystemSounds()
    uiDeviceSetBatteryMonitoringEnabled(true)
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(screen)
    onCleanup(() => {
      observer.disconnect()
      clearTimeout(pending)
      uiDeviceSetBatteryMonitoringEnabled(false)
    })
  })

  return (
    <div class='device-fullscreen'>
      <div ref={screen} class='device-fullscreen-content'>
        <div class='relative select-none' style={{
          width: `${DeviceMetrics.stageWidth}px`,
          height: `${size().height / scale()}px`,
          transform: `scale(${scale()})`,
          'transform-origin': 'top left'
        }}>
          <DeviceScreenHeight.Provider value={() => size().height / scale()}>
            {props.children}
          </DeviceScreenHeight.Provider>
          <div class='pointer-events-none absolute inset-0' style={{ background: 'black', opacity: uiScreenDimLevel() }} />
        </div>
      </div>
      <button type='button' aria-label='Home. Double tap for recent apps.' class='device-fullscreen-home' onClick={home}>
        <span aria-hidden='true' />
      </button>
    </div>
  )
}
