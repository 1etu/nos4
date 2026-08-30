import type { AssetName } from 'CoreGraphics'

export interface GameCenterCatalogEntry {
  readonly bundleId: string
  readonly leaderboardId: string
  readonly title: string
  readonly icon: AssetName
}

export const GameCenterCatalog: readonly GameCenterCatalogEntry[] = [
  {
    bundleId: 'com.nos4.flattybird',
    leaderboardId: 'high-score',
    title: 'Flatty Bird',
    icon: 'FlattyBirdIcon'
  }
]
