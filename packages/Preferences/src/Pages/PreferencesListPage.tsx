import { For } from 'solid-js'
import { UIScrollView } from 'UIKit'
import { PreferencesMetrics } from '../Support/PreferencesMetrics'
import type { PreferencesSectionSpec } from '../Support/PreferencesTypes'
import { PreferencesSection } from '../Rows/PreferencesSection'

export const PreferencesListPage = (props: {
  sections: readonly PreferencesSectionSpec[]
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
      <For each={props.sections}>
        {(section) => <PreferencesSection section={section} onOpen={props.onOpen} />}
      </For>
    </div>
  </UIScrollView>
)
