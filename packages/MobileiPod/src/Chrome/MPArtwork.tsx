import { createSignal, Show, type JSX } from 'solid-js'
import { assetURL } from 'CoreGraphics'
import { mediaURL, type MPMediaItem } from '../Support/MPMediaLibrary'

export const MPArtwork = (props: {
  item: MPMediaItem | undefined
  size?: number
  class?: string
  style?: JSX.CSSProperties
}) => {
  const [failed, setFailed] = createSignal(false)

  const source = () => {
    const item = props.item
    if (!item || failed()) return assetURL('noartplaceholder')
    return mediaURL(item.artwork)
  }

  return (
    <img
      src={source()}
      alt=""
      draggable={false}
      class={props.class}
      onError={() => setFailed(true)}
      style={{
        width: props.size ? `${props.size}px` : undefined,
        height: props.size ? `${props.size}px` : undefined,
        'object-fit': 'cover',
        ...props.style
      }}
    />
  )
}

export const MPArtworkReflection = (props: { item: MPMediaItem | undefined; size: number }) => (
  <Show when={props.item}>
    <MPArtwork
      item={props.item}
      size={props.size}
      style={{ transform: 'scaleY(-1)', opacity: '0.15' }}
    />
  </Show>
)
