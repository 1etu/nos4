import { createEffect, createSignal, on, onCleanup, onMount, Show, type JSX } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import { CAMediaTimingFunction, caAfter, caAnimation, caTransition, type CATransaction } from 'CoreAnimation'
import { SCNView } from 'SceneKit'
import {
  uiDeviceIsPluggedIn,
  uiDeviceSetPluggedIn,
  uiScreenIsCompact,
  uiScreenSceneHidden,
  uiScreenSceneStaged,
  uiScreenSetSceneHidden
} from 'UIKit'
import { Device } from '../Hardware/Device'
import {
  DeviceOrientation,
  DeviceOrientationDidChange,
  type DeviceOrientationValue
} from '../Support/DeviceNotifications'
import { DeviceShell, DeviceShellBody } from '../Support/DeviceMetrics'
import { DeviceSceneMetrics } from './DeviceSceneMetrics'
import { DeviceSceneToggle } from './DeviceSceneToggle'

const ArmImage = 'scene/arm-rich.png'
const RichPropsImage = 'scene/rich-props.png'

const GripWidth = DeviceSceneMetrics.gripRight - DeviceSceneMetrics.gripLeft
const GripCentreX = (DeviceSceneMetrics.gripLeft + DeviceSceneMetrics.gripRight) / 2
const GripCentreY = (DeviceSceneMetrics.gripTop + DeviceSceneMetrics.gripBottom) / 2

const BodyLeft = DeviceShellBody.left * DeviceShell.width
const BodyTop = DeviceShellBody.top * DeviceShell.height
const BodyWidth = (DeviceShellBody.right - DeviceShellBody.left) * DeviceShell.width
const BodyHeight = (DeviceShellBody.bottom - DeviceShellBody.top) * DeviceShell.height

const DeviceScale = (GripWidth * DeviceSceneMetrics.gripOverscan) / BodyWidth
const DeviceLeft = GripCentreX - (BodyWidth / 2 + BodyLeft) * DeviceScale
const DeviceTop = GripCentreY - (BodyHeight / 2 + BodyTop) * DeviceScale
const PhoneHeight = BodyHeight * DeviceScale
const PhoneBodyWidth = BodyWidth * DeviceScale
const PhoneWidthMillimetres = 58.6
const PhoneCornerRadiusMillimetres = 3.8

const PortCentreX =
  DeviceLeft + (DeviceShell.portLeft + DeviceShell.portWidth / 2) * DeviceScale
const PortPlaneY =
  DeviceTop + (DeviceShell.portTop + DeviceShell.portHeight) * DeviceScale
const PhoneBodyLeft = DeviceLeft + BodyLeft * DeviceScale
const PhoneBodyTop = DeviceTop + BodyTop * DeviceScale
const PhoneBodyRight = PhoneBodyLeft + BodyWidth * DeviceScale
const PhoneBodyBottom = PhoneBodyTop + BodyHeight * DeviceScale

const fade = caAnimation(DeviceSceneMetrics.sceneFadeDuration, CAMediaTimingFunction.easeInOut)
const orientationAnimation = caAnimation(
  DeviceSceneMetrics.orientationDuration,
  CAMediaTimingFunction.easeInOut
)

export const DeviceScene = (props: { children: JSX.Element }) => {
  const [scale, setScale] = createSignal(1)
  const [left, setLeft] = createSignal(0)
  const [top, setTop] = createSignal(0)
  const [plugged, setPlugged] = createSignal(uiDeviceIsPluggedIn())
  const [mounted, setMounted] = createSignal(!uiScreenSceneStaged())
  const [opaque, setOpaque] = createSignal(!uiScreenSceneStaged())
  const [orientation, setOrientation] = createSignal<DeviceOrientationValue>(
    DeviceOrientation.portrait
  )

  let settle: CATransaction | undefined

  const landscape = () => orientation() === DeviceOrientation.landscape

  const sceneX = (value: number) =>
    left() + GripCentreX + (value - GripCentreX) * scale()

  const sceneY = (value: number) =>
    top() + GripCentreY + (value - GripCentreY) * scale()

  const fit = () => {
    const next = landscape()
      ? Math.min(
          (window.innerWidth * DeviceSceneMetrics.landscapeViewportWidthFraction) / PhoneHeight,
          (window.innerHeight * DeviceSceneMetrics.landscapeViewportHeightFraction) /
            PhoneBodyWidth
        )
      : uiScreenIsCompact()
        ? Math.min(window.innerHeight / PhoneHeight, window.innerWidth / PhoneBodyWidth)
        : (window.innerHeight * DeviceSceneMetrics.phoneViewportFraction) / PhoneHeight
    setScale(next)
    setLeft(window.innerWidth / 2 - GripCentreX)
    if (uiScreenSceneStaged() || landscape()) {
      setTop(window.innerHeight / 2 - GripCentreY)
      return
    }
    setTop(
      window.innerHeight * DeviceSceneMetrics.phoneTopFraction +
        PhoneHeight * next / 2 - GripCentreY
    )
  }

  onMount(() => {
    fit()
    window.addEventListener('resize', fit)
    onCleanup(() => window.removeEventListener('resize', fit))
    onCleanup(
      NSNotificationCenter.addObserver(DeviceOrientationDidChange, (notification) => {
        setOrientation(notification.userInfo.orientation)
        fit()
      })
    )
  })

  onCleanup(() => settle?.cancel())

  createEffect(on(uiScreenIsCompact, fit, { defer: true }))

  createEffect(
    on(
      uiScreenSceneStaged,
      (away) => {
        settle?.cancel()
        fit()
        if (away) {
          setOpaque(false)
          settle = caAfter(DeviceSceneMetrics.sceneFadeDuration, () => setMounted(false))
          return
        }
        setMounted(true)
        requestAnimationFrame(() => requestAnimationFrame(() => setOpaque(true)))
      },
      { defer: true }
    )
  )

  return (
    <div
      style={{ position: 'fixed', inset: '0', overflow: 'hidden', isolation: 'isolate' }}
    >
      <Show when={!uiScreenIsCompact()}>
        <DeviceSceneToggle
          enabled={!uiScreenSceneHidden()}
          onChange={(enabled) => uiScreenSetSceneHidden(!enabled)}
        />
      </Show>

      <Show when={mounted() && !landscape()}>
        <SCNView
          port={{
            x: sceneX(PortCentreX),
            y: sceneY(PortPlaneY),
            outwardX: 0,
            outwardY: 1,
            body: {
              left: sceneX(PhoneBodyLeft),
              top: sceneY(PhoneBodyTop),
              right: sceneX(PhoneBodyRight),
              bottom: sceneY(PhoneBodyBottom),
              cornerRadius:
                PhoneCornerRadiusMillimetres *
                ((PhoneBodyWidth * scale()) / PhoneWidthMillimetres),
              portWidth: DeviceShell.portWidth * DeviceScale * scale()
            }
          }}
          pixelsPerMillimetre={(PhoneBodyWidth * scale()) / PhoneWidthMillimetres}
          opacity={opaque() ? 1 : 0}
          transition={caTransition(['opacity'], fade)}
          plugged={plugged()}
          onPlug={() => {
            uiDeviceSetPluggedIn(true)
            setPlugged(true)
          }}
          onUnplug={() => {
            uiDeviceSetPluggedIn(false)
            setPlugged(false)
          }}
        />
      </Show>

      <Show when={mounted() && !landscape()}>
        <img
          src={`${import.meta.env.BASE_URL}${RichPropsImage}`}
          alt=""
          draggable={false}
          style={{
            position: 'fixed',
            right: '1.5vw',
            top: '50%',
            'z-index': '0',
            width: 'min(38vw, 80vh, 780px)',
            height: 'auto',
            transform: 'translateY(-50%) rotate(-1deg)',
            'transform-origin': 'center',
            'pointer-events': 'none',
            opacity: `${opaque() ? 1 : 0}`,
            transition: caTransition(['opacity'], fade)
          }}
        />
      </Show>

      <div
        style={{
          position: 'absolute',
          'z-index': '2',
          left: `${left()}px`,
          top: `${top()}px`,
          width: `${DeviceSceneMetrics.armWidth}px`,
          height: `${DeviceSceneMetrics.armHeight}px`,
          'transform-origin': `${GripCentreX}px ${GripCentreY}px`,
          transform: `scale(${scale()}) rotate(${
            landscape() ? DeviceSceneMetrics.landscapeRotationDegrees : 0
          }deg)`,
          transition: caTransition(['left', 'top', 'transform'], orientationAnimation)
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: `${DeviceLeft}px`,
            top: `${DeviceTop}px`,
            transform: `scale(${DeviceScale})`,
            'transform-origin': 'top left'
          }}
        >
          <Device>{props.children}</Device>
        </div>
        <Show when={mounted()}>
          <img
            src={`${import.meta.env.BASE_URL}${ArmImage}`}
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              left: '0',
              top: '0',
              width: `${DeviceSceneMetrics.armWidth}px`,
              height: `${DeviceSceneMetrics.armHeight}px`,
              'pointer-events': 'none',
              opacity: `${opaque() ? 1 : 0}`,
              transition: caTransition(['opacity'], fade)
            }}
          />
        </Show>
      </div>
    </div>
  )
}
