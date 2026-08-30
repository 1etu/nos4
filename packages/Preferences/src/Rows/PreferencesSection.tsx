import { For, Show } from 'solid-js'
import { UITableGroup, UITableGroupHeader, UITableRow } from 'UIKit'
import { PreferencesMetrics, PreferencesPalette } from '../Support/PreferencesMetrics'
import type { PreferencesSectionSpec } from '../Support/PreferencesTypes'
import { PreferencesRow } from './PreferencesRow'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const PreferencesFootnote = (props: { text: string }) => (
  <div
    class="text-center"
    style={{
      padding: `0 ${PreferencesMetrics.footnoteInsetX}px`,
      'font-family': HelveticaNeue,
      'font-size': `${PreferencesMetrics.footnoteFontSize}px`,
      color: PreferencesPalette.footnote,
      'text-shadow': PreferencesPalette.footnoteShadow,
      'white-space': 'pre-line'
    }}
  >
    {props.text}
  </div>
)

export const PreferencesSection = (props: {
  section: PreferencesSectionSpec
  onOpen: (id: string) => void
}) => (
  <div class="flex flex-col" style={{ gap: `${PreferencesMetrics.topSpacing / 2}px` }}>
    <Show when={props.section.header}>
      {(header) => <UITableGroupHeader title={header()} />}
    </Show>
    <UITableGroup>
      <For each={props.section.rows}>
        {(row, at) => (
          <UITableRow separator={at() < props.section.rows.length - 1}>
            <PreferencesRow row={row} onOpen={props.onOpen} />
          </UITableRow>
        )}
      </For>
    </UITableGroup>
    <Show when={props.section.footnote}>
      {(footnote) => <PreferencesFootnote text={footnote()} />}
    </Show>
  </div>
)
