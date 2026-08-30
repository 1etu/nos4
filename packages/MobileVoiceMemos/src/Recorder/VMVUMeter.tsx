import { assetURL } from 'CoreGraphics'
import { CELRecorderMetrics } from 'Celestial'
import { VMMetrics } from '../Support/VMMetrics'

const needleAngle = (level: number): number => {
  const clamped = Math.min(
    Math.max(level, CELRecorderMetrics.minimumVU),
    CELRecorderMetrics.maximumVU
  )
  const travel =
    (clamped - CELRecorderMetrics.minimumVU) /
    (CELRecorderMetrics.maximumVU - CELRecorderMetrics.minimumVU)
  return (
    VMMetrics.needleStartAngle +
    travel * (VMMetrics.needleEndAngle - VMMetrics.needleStartAngle)
  )
}

export const VMVUMeter = (props: { width: number; height: number; level: number }) => {
  const needleHeight = () => props.height * VMMetrics.needleHeightRatio
  const needleWidth = () => needleHeight() * VMMetrics.needleAspect
  const pivotY = () => props.height - props.height * VMMetrics.pivotRatio
  const peaked = () => props.level >= CELRecorderMetrics.maximumVU

  return (
    <div class="absolute inset-0">
      <img
        src={assetURL('vu')}
        alt=""
        draggable={false}
        class="absolute inset-0 h-full w-full"
        style={{ 'object-fit': 'cover' }}
      />
      <img
        src={assetURL(peaked() ? 'redlevelON' : 'redlevelOFF')}
        alt=""
        draggable={false}
        class="absolute"
        style={{
          width: `${VMMetrics.redLevelSize}px`,
          height: `${VMMetrics.redLevelSize}px`,
          left: `${props.width / 2 + props.width * VMMetrics.redLevelOffsetX - VMMetrics.redLevelSize / 2}px`,
          top: `${props.height / 2 - props.width * VMMetrics.redLevelOffsetY - VMMetrics.redLevelSize / 2}px`
        }}
      />
      <div
        class="pointer-events-none absolute inset-0"
        style={{
          '-webkit-mask-image': `url(${assetURL('vumask')})`,
          'mask-image': `url(${assetURL('vumask')})`,
          '-webkit-mask-repeat': 'no-repeat',
          'mask-repeat': 'no-repeat',
          '-webkit-mask-position': 'center',
          'mask-position': 'center',
          '-webkit-mask-size': `${props.width * VMMetrics.maskWidthRatio}px ${props.width * VMMetrics.maskHeightRatio}px`,
          'mask-size': `${props.width * VMMetrics.maskWidthRatio}px ${props.width * VMMetrics.maskHeightRatio}px`
        }}
      >
        <img
          src={assetURL('needle')}
          alt=""
          draggable={false}
          class="absolute"
          style={{
            width: `${needleWidth()}px`,
            height: `${needleHeight()}px`,
            left: `${props.width / 2 - needleWidth() / 2}px`,
            top: `${pivotY() - needleHeight()}px`,
            'transform-origin': 'bottom center',
            transform: `rotate(${needleAngle(props.level)}deg)`
          }}
        />
      </div>
    </div>
  )
}
