import type { JSX } from 'solid-js'
import { AssetCapInsets, AssetSize, type AssetName } from '../Generated/Assets.gen'
import { assetURL } from './AssetURL'

const AssetScale = 2

export const assetPointSize = (name: AssetName): { width: number; height: number } =>
  AssetSize[name]

export const CGImage = (props: {
  name: AssetName
  scale?: number
  class?: string
  style?: JSX.CSSProperties
}) => {
  const size = () => assetPointSize(props.name)
  const factor = () => props.scale ?? 1
  return (
    <img
      src={assetURL(props.name)}
      alt=""
      draggable={false}
      class={props.class}
      style={{
        width: `${size().width * factor()}px`,
        height: `${size().height * factor()}px`,
        ...props.style
      }}
    />
  )
}

export const CGResizableImage = (props: {
  name: AssetName
  width: number
  height?: number
  class?: string
  style?: JSX.CSSProperties
}) => {
  const insets = () => AssetCapInsets[props.name] ?? {}
  const top = () => insets().top ?? 0
  const right = () => insets().right ?? 0
  const bottom = () => insets().bottom ?? 0
  const left = () => insets().left ?? 0

  return (
    <div
      class={props.class}
      style={{
        width: `${props.width}px`,
        height: `${props.height ?? assetPointSize(props.name).height}px`,
        'border-image-source': `url(${assetURL(props.name)})`,
        'border-image-slice': `${top()} ${right()} ${bottom()} ${left()} fill`,
        'border-image-width': `${top() / AssetScale}px ${right() / AssetScale}px ${bottom() / AssetScale}px ${left() / AssetScale}px`,
        'border-style': 'solid',
        'border-color': 'transparent',
        'border-width': `${top() / AssetScale}px ${right() / AssetScale}px ${bottom() / AssetScale}px ${left() / AssetScale}px`,
        ...props.style
      }}
    />
  )
}
