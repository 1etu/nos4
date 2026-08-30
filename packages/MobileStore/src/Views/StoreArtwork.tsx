import { createSignal, type JSX } from 'solid-js'
import { assetURL, type AssetName } from 'CoreGraphics'
import { StorePalette } from '../Support/StoreMetrics'
import { mediaURL, type StoreItem } from '../Support/StoreService'

export const StoreArtwork = (props: {
  item: StoreItem | undefined
  size: number
  bordered?: boolean
  placeholder?: AssetName
  style?: JSX.CSSProperties
}) => {
  const [failed, setFailed] = createSignal(false)

  const source = () => {
    const item = props.item
    if (!item || failed() || item.artwork.length === 0) {
      return assetURL(props.placeholder ?? 'noartplaceholder')
    }
    return item.artwork.startsWith('http') ? item.artwork : mediaURL(item.artwork)
  }

  return (
    <img
      src={source()}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
      class="shrink-0"
      style={{
        width: `${props.size}px`,
        height: `${props.size}px`,
        'object-fit': 'cover',
        'border-right': props.bordered ? `1px solid ${StorePalette.artBorder}` : 'none',
        ...props.style
      }}
    />
  )
}
