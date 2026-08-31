import { Show, onMount } from 'solid-js'
import { UIScrollView } from 'UIKit'
import { AppStorePalette } from '../Support/AppStoreMetrics'
import { appStoreFeatured, appStoreLoadFeatured } from '../Support/AppStoreService'
import type { AppStoreApplication } from '../Support/AppStoreTypes'
import { AppStoreChartList } from '../Charts/AppStoreChartList'
import { AppStoreGeniusView } from './AppStoreGeniusView'

export const AppStoreFeaturedView = (props: {
  width: number
  segment: number
  onOpen: (application: AppStoreApplication) => void
}) => {
  onMount(() => {
    void appStoreLoadFeatured()
  })

  return (
    <Show when={props.segment === 0} fallback={<AppStoreGeniusView />}>
      <UIScrollView class="h-full w-full" style={{ background: AppStorePalette.listBackground }}>
        <AppStoreChartList
          width={props.width}
          applications={appStoreFeatured()}
          ranked={false}
          lightFooter={true}
          onOpen={props.onOpen}
        />
      </UIScrollView>
    </Show>
  )
}
