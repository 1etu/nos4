import { CGImage, type AssetName } from 'CoreGraphics'
import { GameCenterMetrics } from '../Support/GameCenterMetrics'
import { GKRow } from '../Common/GKRow'

export const GKGameRow = (props: {
  title: string
  icon: AssetName
  best: string
  rank: string
  separator: boolean
  onOpen: () => void
}) => (
  <GKRow
    above={props.best}
    title={props.title}
    below={props.rank}
    separator={props.separator}
    leading={
      <CGImage
        name={props.icon}
        style={{
          width: `${GameCenterMetrics.gameIconSize}px`,
          height: `${GameCenterMetrics.gameIconSize}px`,
          'margin-left': `${GameCenterMetrics.gameIconInset}px`,
          'margin-right': `${GameCenterMetrics.gameIconInset}px`,
          'border-radius': `${GameCenterMetrics.gameIconRadius}px`
        }}
      />
    }
    onOpen={props.onOpen}
  />
)
