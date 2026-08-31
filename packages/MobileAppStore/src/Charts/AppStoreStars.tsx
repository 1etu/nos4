import { For } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { AppStoreMetrics } from '../Support/AppStoreMetrics'

const StarCount = 5

export const AppStoreStars = (props: { rating: number }) => {
  const filled = () => Math.min(Math.max(Math.floor(props.rating), 0), StarCount)
  const slots = () => Array.from({ length: StarCount }, (_, index) => index < filled())

  return (
    <div
      class="flex shrink-0 items-center"
      style={{
        gap: `${AppStoreMetrics.rowStarGap}px`,
        transform: `translateY(${AppStoreMetrics.rowStarOffsetY}px)`
      }}
    >
      <For each={slots()}>
        {(on) => (
          <CGImage
            name={on ? 'UserRatingBorderedStarsForeground' : 'UserRatingBorderedStarsBackground'}
          />
        )}
      </For>
    </div>
  )
}
