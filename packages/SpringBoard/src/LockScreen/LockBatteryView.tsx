import { CGImage, assetPointSize, type AssetName } from 'CoreGraphics'
import { uiDeviceBatteryLevel } from 'UIKit'
import { SpringBoardMetrics } from '../Support/SpringBoardMetrics'

const StepCount = 17

const batteryAsset = (level: number): AssetName => {
  const step = Math.floor((level * 100) / (100 / StepCount))
  const index = Math.min(Math.max(step, 1), StepCount)
  return `BatteryBG_${index}` as AssetName
}

const reflectionMask = `linear-gradient(to top, rgba(0,0,0,${SpringBoardMetrics.lockBatteryReflectionAlpha}) 0%, transparent ${SpringBoardMetrics.lockBatteryReflectionStart}%)`

export const LockBatteryView = () => {
  const asset = () => batteryAsset(uiDeviceBatteryLevel())
  const height = () => assetPointSize(asset()).height

  return (
    <div class="absolute inset-0 flex items-center justify-center" style={{ background: 'black' }}>
      <div class="relative">
        <CGImage name={asset()} />
        <CGImage
          name={asset()}
          style={{
            position: 'absolute',
            left: '0',
            top: `${height()}px`,
            transform: 'scaleY(-1)',
            '-webkit-mask-image': reflectionMask,
            'mask-image': reflectionMask
          }}
        />
      </div>
    </div>
  )
}
