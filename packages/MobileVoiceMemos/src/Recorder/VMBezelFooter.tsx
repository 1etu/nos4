import { assetURL } from 'CoreGraphics'
import { CELRecorderState, type CELRecorderStateValue } from 'Celestial'
import { VMVUMeter } from './VMVUMeter'
import { VMMetrics } from '../Support/VMMetrics'

export const VMBezelFooter = (props: {
  width: number
  height: number
  level: number
  state: CELRecorderStateValue
  onTransport: () => void
  onSecondary: () => void
}) => {
  const buttonWidth = () => props.height * VMMetrics.transportSizeRatio
  const buttonHeight = () => props.height * VMMetrics.transportHeightRatio
  const inset = () => props.width * VMMetrics.transportInsetRatio + 1
  const recording = () => props.state === CELRecorderState.recording

  return (
    <div class="relative" style={{ width: `${props.width}px`, height: `${props.height}px` }}>
      <img
        src={assetURL('bezel')}
        alt=""
        draggable={false}
        class="absolute inset-0 h-full w-full"
        style={{ 'object-fit': 'cover' }}
      />
      <div class="absolute inset-0" style={{ transform: 'translateY(-1px)' }}>
        <VMVUMeter width={props.width} height={props.height} level={props.level} />
      </div>

      <button
        type="button"
        class="absolute"
        style={{
          left: `${inset()}px`,
          top: `${(props.height - buttonHeight()) / 2 + 0.5}px`,
          width: `${buttonWidth()}px`,
          height: `${buttonHeight()}px`
        }}
        onClick={props.onTransport}
      >
        <img
          src={assetURL(recording() ? 'voicememos_pause' : 'record')}
          alt=""
          draggable={false}
          class="h-full w-full"
        />
      </button>

      <button
        type="button"
        class="absolute"
        style={{
          right: `${inset()}px`,
          top: `${(props.height - buttonHeight()) / 2 + 0.5}px`,
          width: `${buttonWidth()}px`,
          height: `${buttonHeight()}px`
        }}
        onClick={props.onSecondary}
      >
        <img
          src={assetURL(recording() ? 'stop' : 'list')}
          alt=""
          draggable={false}
          class="h-full w-full"
        />
      </button>
    </div>
  )
}
