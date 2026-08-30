import { For } from 'solid-js'
import { UIScrollView, UITableGroup, UITableGroupHeader, UITableMetrics, UITablePalette, UITableRow } from 'UIKit'
import { PreferencesMetrics, PreferencesPalette } from '../Support/PreferencesMetrics'
import { preferencesAboutRows } from '../Support/PreferencesDevice'
import { PreferencesSection } from '../Rows/PreferencesSection'
import { PreferencesAccessory, type PreferencesSectionSpec } from '../Support/PreferencesTypes'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const legalSection: PreferencesSectionSpec = {
  id: 'legal',
  rows: [
    { id: 'legal', title: 'Legal', accessory: PreferencesAccessory.chevron },
    { id: 'regulatory', title: 'Regulatory', accessory: PreferencesAccessory.chevron }
  ]
}

export const PreferencesAboutPage = (props: {
  deviceName: string
  onOpen: (id: string) => void
}) => (
  <UIScrollView class="h-full w-full">
    <div
      class="flex flex-col"
      style={{
        gap: `${PreferencesMetrics.sectionSpacing}px`,
        'padding-top': `${PreferencesMetrics.topSpacing}px`,
        'padding-bottom': `${PreferencesMetrics.bottomSpacing}px`
      }}
    >
      <div class="flex flex-col" style={{ gap: `${PreferencesMetrics.topSpacing / 2}px` }}>
        <UITableGroupHeader title={props.deviceName} />
        <UITableGroup>
          <For each={preferencesAboutRows()}>
            {(row, at) => (
              <UITableRow separator={at() < preferencesAboutRows().length - 1}>
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
                    {row.title}
                  </span>
                  <span
                    class="ml-auto"
                    style={{
                      'font-family': HelveticaNeue,
                      'font-size': `${PreferencesMetrics.valueFontSize}px`,
                      color: UITablePalette.rowValue,
                      'white-space': 'nowrap'
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              </UITableRow>
            )}
          </For>
        </UITableGroup>
      </div>

      <PreferencesSection section={legalSection} onOpen={props.onOpen} />
    </div>
  </UIScrollView>
)
