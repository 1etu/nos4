import { CGImage } from 'CoreGraphics'
import { AppStoreMetrics, AppStorePalette } from '../Support/AppStoreMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const Headline = 'You do not currently have any\nrecommendations.'
const Body = 'To start seeing recommendations,\nteach Genius about your tastes by\ndownloading apps.'

export const AppStoreGeniusView = () => (
  <div
    class="flex h-full w-full flex-col items-center justify-center"
    style={{ background: AppStorePalette.geniusBackground }}
  >
    <CGImage
      name="geniusatom"
      style={{ width: `${AppStoreMetrics.geniusIconWidth}px`, height: 'auto' }}
    />

    <div style={{ height: `${AppStoreMetrics.geniusHeadlineGap}px` }} />

    <span
      class="text-center"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${AppStoreMetrics.geniusFontSize}px`,
        'font-weight': '700',
        'line-height': '1.25',
        'white-space': 'pre-line',
        color: 'black',
        'text-shadow': AppStorePalette.rowTextShadow
      }}
    >
      {Headline}
    </span>

    <div style={{ height: `${AppStoreMetrics.geniusBodyGap}px` }} />

    <span
      class="text-center"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${AppStoreMetrics.geniusFontSize}px`,
        'line-height': '1.25',
        'white-space': 'pre-line',
        color: AppStorePalette.geniusBody,
        'text-shadow': AppStorePalette.rowTextShadow
      }}
    >
      {Body}
    </span>
  </div>
)
