import { VMWellButton } from './VMWellButton'
import { VMMetrics, VMPalette } from '../Support/VMMetrics'

const DeleteFill =
  'linear-gradient(to bottom, rgb(239,135,142) 0%, rgb(199,52,63) 48%, rgb(189,20,33) 49%, rgb(189,20,33) 100%)'

export const VMDeleteSheet = (props: { onDelete: () => void; onCancel: () => void }) => (
  <div class="relative w-full" style={{ height: `${VMMetrics.deleteSheetHeight}px` }}>
    <div
      class="absolute inset-x-0 top-0"
      style={{
        height: `${VMMetrics.footerLipHeight}px`,
        background: VMPalette.deleteLip,
        'border-top': '1px solid black',
        'box-shadow': 'inset 0 3px 3px -3px rgba(255,255,255,0.98)'
      }}
    />
    <div
      class="absolute inset-x-0 bottom-0"
      style={{ top: `${VMMetrics.footerLipHeight}px`, background: VMPalette.deleteBody }}
    />

    <div class="absolute inset-0 flex flex-col items-stretch justify-evenly" style={{ padding: '0 25px' }}>
      <VMWellButton
        title="Delete"
        fill={DeleteFill}
        border="rgba(255,255,255,0.9)"
        onClick={props.onDelete}
      />
      <VMWellButton
        title="Cancel"
        fill={VMPalette.cancelFill}
        border="rgba(128,128,128,0.9)"
        onClick={props.onCancel}
      />
    </div>
  </div>
)
