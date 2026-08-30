import { CGImage } from 'CoreGraphics'
import {
  UIScrollView,
  UISlider,
  UISwitch,
  UITableGroup,
  UITableRow,
  uiScreenAutoBrightness,
  uiScreenBrightness,
  uiScreenSetAutoBrightness,
  uiScreenSetBrightness
} from 'UIKit'
import { PreferencesMetrics, PreferencesPalette } from '../Support/PreferencesMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const PreferencesBrightnessPage = () => (
  <UIScrollView class="h-full w-full">
    <div style={{ 'padding-top': `${PreferencesMetrics.topSpacing}px` }}>
      <UITableGroup>
        <UITableRow separator>
          <div
            class="flex h-full w-full items-center"
            style={{ padding: `0 ${PreferencesMetrics.accessoryInset}px` }}
          >
            <UISlider
              value={uiScreenBrightness()}
              onInput={uiScreenSetBrightness}
              leading={<CGImage name="LessBright" />}
              trailing={<CGImage name="MoreBright" />}
            />
          </div>
        </UITableRow>
        <UITableRow>
          <div
            class="flex h-full w-full items-center"
            style={{ padding: `0 ${PreferencesMetrics.accessoryInset}px` }}
          >
            <span
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${PreferencesMetrics.valueFontSize}px`,
                'font-weight': '700',
                color: PreferencesPalette.rowTitle
              }}
            >
              Auto-Brightness
            </span>
            <div class="ml-auto">
              <UISwitch on={uiScreenAutoBrightness()} onChange={uiScreenSetAutoBrightness} />
            </div>
          </div>
        </UITableRow>
      </UITableGroup>
    </div>
  </UIScrollView>
)
