import { Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { ctSetWiFiPower, ctWiFiNetworkName, ctWiFiPower } from 'CoreTelephony'
import {
  UIScrollView,
  UISwitch,
  UITableGroup,
  UITableGroupHeader,
  UITableMetrics,
  UITablePalette,
  UITableRow
} from 'UIKit'
import { PreferencesMetrics, PreferencesPalette } from '../Support/PreferencesMetrics'
import { PreferencesFootnote } from '../Rows/PreferencesSection'
import { preferencesSetSwitch, preferencesSwitchValue } from '../Support/PreferencesDefaults'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"
const AskToJoinKey = 'askToJoinNetworks'

const SwitchRow = (props: { title: string; on: boolean; onChange: (on: boolean) => void }) => (
  <div
    class="flex h-full w-full items-center"
    style={{ padding: `0 ${PreferencesMetrics.accessoryInset}px` }}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${UITableMetrics.rowFontSize}px`,
        'font-weight': '700',
        color: PreferencesPalette.rowTitle
      }}
    >
      {props.title}
    </span>
    <div class="ml-auto">
      <UISwitch on={props.on} onChange={props.onChange} />
    </div>
  </div>
)

export const PreferencesWiFiPage = () => (
  <UIScrollView class="h-full w-full">
    <div
      class="flex flex-col"
      style={{
        gap: `${PreferencesMetrics.sectionSpacing}px`,
        'padding-top': `${PreferencesMetrics.topSpacing}px`,
        'padding-bottom': `${PreferencesMetrics.bottomSpacing}px`
      }}
    >
      <UITableGroup>
        <UITableRow>
          <SwitchRow title="Wi-Fi" on={ctWiFiPower()} onChange={ctSetWiFiPower} />
        </UITableRow>
      </UITableGroup>

      <div class="flex flex-col" style={{ gap: `${PreferencesMetrics.topSpacing / 2}px` }}>
        <UITableGroupHeader title="Choose a Network..." />
        <UITableGroup>
          <Show when={ctWiFiPower()}>
            <UITableRow separator>
              <div
                class="flex h-full w-full items-center"
                style={{ padding: `0 ${PreferencesMetrics.accessoryInset}px` }}
              >
                <CGImage
                  name="TWPickerTableCellChecked"
                  style={{
                    width: `${PreferencesMetrics.checkmarkSize}px`,
                    height: `${PreferencesMetrics.checkmarkSize}px`
                  }}
                />
                <span
                  style={{
                    'font-family': HelveticaNeue,
                    'font-size': `${UITableMetrics.rowFontSize}px`,
                    'font-weight': '700',
                    color: PreferencesPalette.selectedTitle,
                    'margin-left': `${PreferencesMetrics.iconInset}px`
                  }}
                >
                  {ctWiFiNetworkName()}
                </span>
                <div class="ml-auto flex items-center" style={{ gap: '6px' }}>
                  <CGImage name="Lock" />
                  <CGImage name="Wi_Fi_Blue_3" />
                  <CGImage name="ABTableNextButton" />
                </div>
              </div>
            </UITableRow>
          </Show>
          <UITableRow>
            <div
              class="flex h-full w-full items-center"
              style={{ padding: `0 ${PreferencesMetrics.accessoryInset}px` }}
            >
              <span
                style={{
                  'font-family': HelveticaNeue,
                  'font-size': `${UITableMetrics.rowFontSize}px`,
                  'font-weight': '700',
                  color: UITablePalette.rowValue
                }}
              >
                Other...
              </span>
              <div class="ml-auto">
                <CGImage name="UITableNext" />
              </div>
            </div>
          </UITableRow>
        </UITableGroup>
      </div>

      <div class="flex flex-col" style={{ gap: `${PreferencesMetrics.topSpacing / 2}px` }}>
        <UITableGroup>
          <UITableRow>
            <SwitchRow
              title="Ask to Join Networks"
              on={preferencesSwitchValue(undefined, AskToJoinKey, true)}
              onChange={(next) => preferencesSetSwitch(undefined, AskToJoinKey, next)}
            />
          </UITableRow>
        </UITableGroup>
        <PreferencesFootnote
          text={
            'Known networks will be joined\n automatically. If no known networks are available, you will we asked before joining \na new network.'
          }
        />
      </div>
    </div>
  </UIScrollView>
)
