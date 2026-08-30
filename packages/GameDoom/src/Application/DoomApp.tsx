import { DoomMetrics } from '../Support/DoomMetrics'

const DoomRuntimeURL = `${import.meta.env.BASE_URL}doom/runtime.html`

export const DoomApp = (props: { width: number; height: number }) => (
  <div
    aria-label="Doom"
    class="absolute overflow-hidden bg-black"
    style={{
      width: `${props.width}px`,
      height: `${props.height}px`,
      transform: `translateY(${props.width}px) rotate(${DoomMetrics.landscapeRotationDegrees}deg)`,
      'transform-origin': 'top left',
      'touch-action': 'none'
    }}
  >
    <iframe
      title="Doom"
      src={DoomRuntimeURL}
      allow="autoplay"
      class="block h-full w-full border-0 bg-black"
    />
  </div>
)
