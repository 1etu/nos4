import { createEffect, createSignal, on, onCleanup, onMount, type JSX } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import {
  avAdjustOutputVolume,
  avObserveUserGesture,
  avPreloadSystemSounds,
  avSetEffectsVolume
} from 'AVFoundation'
import {
  uiDeviceBatteryLevel,
  uiDeviceCanPowerOn,
  uiDeviceSetBatteryMonitoringEnabled,
  uiDeviceSetScreenOn
, uiScreenDimLevel } from 'UIKit'
import { DeviceMetrics, DeviceShell } from '../Support/DeviceMetrics'
import { CAMediaTimingFunction, caAnimation, caTransition } from 'CoreAnimation'
import {
  DeviceHomeButtonDoublePressed,
  DeviceHomeButtonPressed,
  DeviceIdentifier,
  DeviceLockButtonPressed
} from '../Support/DeviceNotifications'

const ShellImage = 'device/iphone5.png'

const screenAnimation = caAnimation(
  DeviceMetrics.screenFadeDuration,
  CAMediaTimingFunction.easeInOut
)

const SideButton = (props: {
  label: string
  top: number
  height: number
  onPress: () => void
}) => {
  const [pressed, setPressed] = createSignal(false)

  return (
    <button
      type="button"
      aria-label={props.label}
      class="absolute"
      style={{
        left: `${DeviceShell.sideButtonLeft}px`,
        top: `${props.top}px`,
        width: `${DeviceShell.sideButtonWidth}px`,
        height: `${props.height}px`,
        'border-radius': `${DeviceShell.sideButtonWidth / 2}px`,
        background: pressed() ? 'rgba(255,255,255,0.12)' : 'transparent',
        'touch-action': 'none'
      }}
      onPointerDown={() => {
        setPressed(true)
        props.onPress()
      }}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
    />
  )
}

const RingerSwitch = () => {
  const [silent, setSilent] = createSignal(false)

  return (
    <SideButton
      label="Ringer"
      top={DeviceShell.ringerTop}
      height={DeviceShell.ringerHeight}
      onPress={() => {
        const next = !silent()
        setSilent(next)
        avSetEffectsVolume(next ? 0 : 1)
      }}
    />
  )
}

const HomeButton = () => {
  const [pressed, setPressed] = createSignal(false)
  let pressCount = 0
  let pending: ReturnType<typeof setTimeout> | undefined

  const onDown = () => {
    setPressed(true)
    clearTimeout(pending)
    pressCount += 1
    if (pressCount === 2) {
      NSNotificationCenter.post(DeviceHomeButtonDoublePressed, DeviceIdentifier, { count: 2 })
    }
  }

  const onUp = () => {
    setPressed(false)
    if (pressCount !== 1) {
      pressCount = 0
      return
    }
    pending = setTimeout(() => {
      NSNotificationCenter.post(DeviceHomeButtonPressed, DeviceIdentifier, { count: 1 })
      pressCount = 0
    }, DeviceMetrics.doublePressWindow)
  }

  onCleanup(() => clearTimeout(pending))

  return (
    <button
      type="button"
      aria-label="Home"
      class="absolute rounded-full"
      style={{
        left: `${DeviceShell.buttonLeft}px`,
        top: `${DeviceShell.buttonTop}px`,
        width: `${DeviceShell.buttonSize}px`,
        height: `${DeviceShell.buttonSize}px`,
        transform: `scale(${pressed() ? DeviceMetrics.homeButtonPressedScale : 1})`,
        background: pressed() ? 'rgba(255,255,255,0.06)' : 'transparent',
        'touch-action': 'none'
      }}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerLeave={() => setPressed(false)}
    />
  )
}

export const Device = (props: { children: JSX.Element }) => {
  const [screenOn, setScreenOn] = createSignal(true)

  const setScreen = (next: boolean) => {
    if (screenOn() === next) return
    setScreenOn(next)
    uiDeviceSetScreenOn(next)
    NSNotificationCenter.post(DeviceLockButtonPressed, DeviceIdentifier, { locked: !next })
  }

  const toggleScreen = () => {
    if (!screenOn()) {
      if (!uiDeviceCanPowerOn()) return
      setScreen(true)
      return
    }
    setScreen(false)
  }

  onMount(() => {
    avObserveUserGesture()
    avPreloadSystemSounds()
    uiDeviceSetBatteryMonitoringEnabled(true)
    onCleanup(() => uiDeviceSetBatteryMonitoringEnabled(false))
  })

  createEffect(
    on(uiDeviceBatteryLevel, (value) => {
      if (value > 0) return
      setScreen(false)
    })
  )

  return (
  <div
    class="relative select-none"
    style={{ width: `${DeviceShell.width}px`, height: `${DeviceShell.height}px` }}
  >
    <div
      class="absolute overflow-hidden"
      style={{
        left: `${DeviceShell.cutoutLeft}px`,
        top: `${DeviceShell.cutoutTop}px`,
        width: `${DeviceMetrics.stageWidth}px`,
        height: `${DeviceMetrics.stageHeight}px`,
        background: 'black'
      }}
    >
      {props.children}
      <div
        class="absolute inset-0"
        style={{
          background: 'black',
          opacity: `${screenOn() ? uiScreenDimLevel() : 1}`,
          'pointer-events': screenOn() ? 'none' : 'auto',
          transition: caTransition(['opacity'], screenAnimation)
        }}
      />
    </div>
    <img
      src={`${import.meta.env.BASE_URL}${ShellImage}`}
      alt=""
      draggable={false}
      class="pointer-events-none absolute inset-0 h-full w-full"
    />
    <HomeButton />
    <button
      type="button"
      aria-label="Lock"
      class="absolute"
      style={{
        left: `${DeviceShell.powerLeft}px`,
        top: `${DeviceShell.powerTop}px`,
        width: `${DeviceShell.powerWidth}px`,
        height: `${DeviceShell.powerHeight}px`,
        'border-radius': `${DeviceShell.powerHeight / 2}px`,
        background: 'transparent',
        'touch-action': 'none'
      }}
      onClick={toggleScreen}
    />
    <RingerSwitch />
    <SideButton
      label="Volume Up"
      top={DeviceShell.volumeUpTop}
      height={DeviceShell.volumeHeight}
      onPress={() => avAdjustOutputVolume(1)}
    />
    <SideButton
      label="Volume Down"
      top={DeviceShell.volumeDownTop}
      height={DeviceShell.volumeHeight}
      onPress={() => avAdjustOutputVolume(-1)}
    />
  </div>
  )
}
