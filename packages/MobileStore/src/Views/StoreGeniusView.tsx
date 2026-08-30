import { CGImage } from 'CoreGraphics'
import { StoreMetrics, StorePalette } from '../Support/StoreMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const Subject = ['Music', 'Movies', 'TV Shows'] as const

export const StoreGeniusView = (props: { segment: number }) => (
  <div
    class="flex h-full w-full flex-col items-center"
    style={{ background: StorePalette.geniusBackdrop }}
  >
    <CGImage
      name="geniusatom"
      style={{
        width: `${StoreMetrics.geniusIconWidth}px`,
        height: 'auto',
        'object-fit': 'contain',
        'margin-top': `${StoreMetrics.geniusIconTop}px`
      }}
    />

    <div style={{ height: `${StoreMetrics.geniusHeadlineGap}px` }} />

    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${StoreMetrics.geniusFontSize}px`,
        'font-weight': '700',
        color: 'black',
        'text-align': 'center',
        'text-shadow': '0 0.9px 0 rgba(255,255,255,0.4)',
        'white-space': 'pre-line'
      }}
    >
      {`You do not currently have any Genius\nrecommendations for ${Subject[props.segment] ?? 'Music'}.`}
    </span>

    <div style={{ height: `${StoreMetrics.geniusBodyGap}px` }} />

    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${StoreMetrics.geniusFontSize}px`,
        'font-weight': '400',
        color: StorePalette.geniusBody,
        'text-align': 'center',
        'text-shadow': '0 0.9px 0 rgba(255,255,255,0.4)',
        'white-space': 'pre-line'
      }}
    >
      {'To start seeing recommendations,\nteach Genius about your tastes by\ndownloading content from iTunes.'}
    </span>
  </div>
)
