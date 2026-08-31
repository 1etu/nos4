import { createEffect, createSignal } from 'solid-js'
import { UIScrollView, UISegmentedControl } from 'UIKit'
import { AppStoreMetrics, AppStorePalette } from '../Support/AppStoreMetrics'
import type { AppStoreCategory } from '../Support/AppStoreCatalog'
import {
  AppStoreChart,
  appStoreChart,
  appStoreLoadChart,
  type AppStoreChartValue
} from '../Support/AppStoreService'
import type { AppStoreApplication } from '../Support/AppStoreTypes'
import { AppStoreChartList } from '../Charts/AppStoreChartList'

const Segments: readonly AppStoreChartValue[] = [
  AppStoreChart.paid,
  AppStoreChart.free,
  AppStoreChart.new
]

const SegmentTitles: readonly string[] = ['Paid', 'Free', 'Release Date']

export const AppStoreCategoryView = (props: {
  width: number
  category: AppStoreCategory
  onOpen: (application: AppStoreApplication) => void
}) => {
  const [segment, setSegment] = createSignal(0)

  const chart = () => Segments[segment()] ?? AppStoreChart.paid

  createEffect(() => {
    void appStoreLoadChart(chart(), props.category.genreId)
  })

  return (
    <div class="flex h-full w-full flex-col">
      <div
        class="flex shrink-0 items-center justify-center"
        style={{
          height: `${AppStoreMetrics.segmentBarHeight}px`,
          background: AppStorePalette.categoryBar,
          'box-shadow': AppStorePalette.categoryBarShadow
        }}
      >
        <UISegmentedControl
          segments={SegmentTitles}
          selected={segment()}
          width={props.width - AppStoreMetrics.segmentTriInset}
          tone="gray"
          onSelect={setSegment}
        />
      </div>

      <UIScrollView
        class="min-h-0 w-full flex-1"
        style={{ background: AppStorePalette.listBackground }}
      >
        <AppStoreChartList
          width={props.width}
          applications={appStoreChart(chart(), props.category.genreId)}
          ranked={true}
          lightFooter={false}
          onOpen={props.onOpen}
        />
      </UIScrollView>
    </div>
  )
}
