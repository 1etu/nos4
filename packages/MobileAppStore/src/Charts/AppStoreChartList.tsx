import { For, Show } from 'solid-js'
import { AppStorePalette } from '../Support/AppStoreMetrics'
import type { AppStoreApplication } from '../Support/AppStoreTypes'
import { AppStoreFooter } from '../Chrome/AppStoreFooter'
import { AppStoreRow } from './AppStoreRow'

export const AppStoreChartList = (props: {
  width: number
  applications: readonly AppStoreApplication[]
  ranked: boolean
  lightFooter: boolean
  onOpen: (application: AppStoreApplication) => void
}) => (
  <div
    class="flex w-full flex-col"
    style={{ background: AppStorePalette.listBackground }}
  >
    <Show when={props.applications.length > 0} fallback={<div class="h-full w-full" />}>
      <For each={props.applications}>
        {(application, at) => (
          <AppStoreRow
            application={application}
            index={at()}
            rank={props.ranked ? at() + 1 : undefined}
            onOpen={props.onOpen}
          />
        )}
      </For>
      <AppStoreFooter width={props.width} light={props.lightFooter} />
    </Show>
  </div>
)
