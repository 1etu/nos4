import { AppStoreMetrics, AppStorePalette } from '../Support/AppStoreMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const UpToDate = 'All Apps Are Up to Date'

export const AppStoreUpdatesView = () => (
  <div
    class="flex h-full w-full items-center justify-center"
    style={{ background: AppStorePalette.geniusBackground }}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${AppStoreMetrics.geniusFontSize}px`,
        'font-weight': '700',
        'line-height': '1.25',
        color: 'black',
        'text-shadow': AppStorePalette.rowTextShadow
      }}
    >
      {UpToDate}
    </span>
  </div>
)
