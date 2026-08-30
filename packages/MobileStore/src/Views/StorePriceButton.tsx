import { StoreMetrics, StorePalette } from '../Support/StoreMetrics'
import { priceLabel } from '../Support/StoreService'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const StorePriceButton = (props: { price: number }) => (
  <button
    type="button"
    class="flex shrink-0 items-center justify-center"
    style={{
      height: `${StoreMetrics.priceHeight}px`,
      padding: `0 ${StoreMetrics.pricePaddingX}px`,
      'border-radius': `${StoreMetrics.priceRadius}px`,
      background: StorePalette.priceButton,
      'box-shadow': 'inset 0 0.6px 1.6px rgba(0,0,0,0.8), 0 0.8px 0 rgba(255,255,255,0.28)',
      'line-height': '1'
    }}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${StoreMetrics.priceFontSize}px`,
        'font-weight': '700',
        color: 'white',
        'text-transform': 'uppercase',
        'text-shadow': '0 -1px 0 rgba(0,0,0,0.75)',
        'white-space': 'nowrap'
      }}
    >
      {priceLabel(props.price)}
    </span>
  </button>
)
