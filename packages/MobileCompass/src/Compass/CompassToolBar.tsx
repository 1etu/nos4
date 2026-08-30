import {
  CompassMetrics,
  CompassPalette,
  CompassToolBarHighlight
} from '../Support/CompassMetrics'
import { CompassBarButton } from './CompassBarButton'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const CompassToolBar = (props: { coordinateText: string; onOpenMaps: () => void }) => (
  <div
    class="relative flex shrink-0 items-center justify-between"
    style={{
      height: `${CompassMetrics.toolBarHeight}px`,
      padding: `0 ${CompassMetrics.toolBarInsetX}px`
    }}
  >
    <div
      class="pointer-events-none absolute inset-0"
      style={{ background: CompassPalette.toolBar, opacity: `${CompassMetrics.toolBarOpacity}` }}
    >
      <div
        class="absolute inset-x-0 top-0"
        style={{
          height: `${CompassToolBarHighlight}px`,
          background: CompassPalette.toolBarHighlight
        }}
      />
      <div
        class="absolute inset-x-0 top-0"
        style={{
          height: `${CompassMetrics.toolBarBorderWidth}px`,
          background: CompassPalette.toolBarBorder
        }}
      />
    </div>

    <CompassBarButton
      glyph="CompassLocateRing"
      glyphWidth={CompassMetrics.locateGlyphWidth}
      paddingX={CompassMetrics.locateGlyphPaddingX}
      onPress={props.onOpenMaps}
    />

    <span
      class="relative"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${CompassMetrics.coordinateFontSize}px`,
        'font-weight': '700',
        'line-height': '1',
        'white-space': 'nowrap',
        color: CompassPalette.text,
        'text-shadow': CompassPalette.textShadow
      }}
    >
      {props.coordinateText}
    </span>

    <CompassBarButton
      glyph="CompassInfo"
      glyphWidth={CompassMetrics.infoGlyphWidth}
      paddingX={CompassMetrics.infoGlyphPaddingX}
    />
  </div>
)
