import { assetURL } from 'CoreGraphics'
import { CompassMetrics } from '../Support/CompassMetrics'

const Background = assetURL('Compass_Background')

export const CompassBackground = (props: { width: number; height: number }) => {
  const scale = () => props.width / CompassMetrics.backgroundWidth
  const topHeight = () =>
    CompassMetrics.backgroundHeight * CompassMetrics.backgroundStretchRatio * scale()
  const bottomHeight = () => Math.max(0, props.height - topHeight())
  const stretchedHeight = () => bottomHeight() / (1 - CompassMetrics.backgroundStretchRatio)

  return (
    <div class="absolute inset-0 flex flex-col overflow-hidden">
      <div
        class="shrink-0"
        style={{
          height: `${topHeight()}px`,
          background: `url(${Background}) top left / ${props.width}px ${CompassMetrics.backgroundHeight * scale()}px no-repeat`
        }}
      />
      <div
        class="shrink-0"
        style={{
          height: `${bottomHeight()}px`,
          background: `url(${Background}) bottom left / ${props.width}px ${stretchedHeight()}px no-repeat`
        }}
      />
    </div>
  )
}
