import { For, Show } from 'solid-js'
import { UIScrollView } from 'UIKit'
import { AppStorePalette } from '../Support/AppStoreMetrics'
import { appStoreSearchResults } from '../Support/AppStoreService'
import type { AppStoreApplication, AppStoreEditingState } from '../Support/AppStoreTypes'
import { AppStoreRow } from '../Charts/AppStoreRow'

export const AppStoreSearchView = (props: {
  editing: AppStoreEditingState
  onOpen: (application: AppStoreApplication) => void
}) => (
  <div class="relative h-full w-full" style={{ background: AppStorePalette.listBackground }}>
    <UIScrollView class="h-full w-full">
      <div class="flex w-full flex-col">
        <For each={appStoreSearchResults()}>
          {(application, at) => (
            <AppStoreRow application={application} index={at()} onOpen={props.onOpen} />
          )}
        </For>
      </div>
    </UIScrollView>

    <Show when={props.editing !== 'None'}>
      <div class="absolute inset-0" style={{ background: AppStorePalette.searchDim }} />
    </Show>
  </div>
)
