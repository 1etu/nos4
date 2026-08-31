import { createEffect } from 'solid-js'
import { UIScrollView } from 'UIKit'
import { AppStorePalette } from '../Support/AppStoreMetrics'
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
  AppStoreChart.grossing
]

export const AppStoreTop25View = (props: {
  width: number
  segment: number
  onOpen: (application: AppStoreApplication) => void
}) => {
  const chart = () => Segments[props.segment] ?? AppStoreChart.paid

  createEffect(() => {
    void appStoreLoadChart(chart())
  })

  return (
    <UIScrollView class="h-full w-full" style={{ background: AppStorePalette.listBackground }}>
      <AppStoreChartList
        width={props.width}
        applications={appStoreChart(chart())}
        ranked={true}
        lightFooter={false}
        onOpen={props.onOpen}
      />
    </UIScrollView>
  )
}
