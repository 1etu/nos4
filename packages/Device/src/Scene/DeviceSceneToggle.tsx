import { UISwitch } from 'UIKit'
import { DeviceSceneMetrics } from './DeviceSceneMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const DeviceSceneToggle = (props: { hidden: boolean; onChange: (hidden: boolean) => void }) => (
  <div
    class="flex items-center"
    style={{
      position: 'fixed',
      left: `${DeviceSceneMetrics.toggleInset}px`,
      top: `${DeviceSceneMetrics.toggleInset}px`,
      gap: `${DeviceSceneMetrics.toggleGap}px`,
      'z-index': '10'
    }}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${DeviceSceneMetrics.toggleFontSize}px`,
        'font-weight': '700',
        color: 'rgb(72,78,88)',
        'white-space': 'nowrap',
        'user-select': 'none'
      }}
    >
      Hide 3D Scene
    </span>
    <UISwitch on={props.hidden} onChange={props.onChange} />
  </div>
)
