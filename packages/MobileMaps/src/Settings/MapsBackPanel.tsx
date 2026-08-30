import { assetPointSize, assetURL } from 'CoreGraphics'
import { MapsMetrics, MapsPalette } from '../Support/MapsMetrics'
import type { MapsTypeValue } from '../Support/MapsTypes'
import { MapsTexturedButton } from './MapsTexturedButton'
import { MapsTypeControl } from './MapsTypeControl'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const MapsBackPanel = (props: {
  width: number
  height: number
  type: MapsTypeValue
  traffic: boolean
  onType: (value: MapsTypeValue) => void
  onDropPin: () => void
  onTraffic: () => void
}) => {
  const controlWidth = () => props.width - MapsMetrics.panelButtonInsetX
  const linen = assetPointSize('SettingsTexture')
  return (
    <div
      class="flex flex-col items-center justify-end"
      style={{
        width: `${props.width}px`,
        height: `${props.height}px`,
        'background-image': `url(${assetURL('SettingsTexture')})`,
        'background-repeat': 'repeat',
        'background-size': `${linen.width}px ${linen.height}px`,
        gap: `${MapsMetrics.panelButtonGap}px`,
        'padding-bottom': `${MapsMetrics.panelBottomInset}px`
      }}
    >
      <MapsTexturedButton title="Drop Pin" width={controlWidth()} onClick={props.onDropPin} />
      <MapsTexturedButton
        title={props.traffic ? 'Hide Traffic' : 'Show Traffic'}
        width={controlWidth()}
        onClick={props.onTraffic}
      />
      <MapsTypeControl selected={props.type} width={controlWidth()} onSelect={props.onType} />
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': '14px',
          'font-weight': '700',
          color: MapsPalette.legalInk,
          'text-decoration': 'underline',
          'text-shadow': '0 0.9px 0 rgba(255,255,255,0.9)'
        }}
      >
        Legal Notices...
      </span>
    </div>
  )
}
