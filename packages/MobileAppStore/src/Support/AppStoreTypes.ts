export type AppStoreTab = 'Featured' | 'Categories' | 'Top 25' | 'Search' | 'Updates'

export const AppStoreTabs: readonly AppStoreTab[] = [
  'Featured',
  'Categories',
  'Top 25',
  'Search',
  'Updates'
]

export const AppStoreScreen = {
  featured: 'Featured',
  featuredDetail: 'Featured_Destination',
  categories: 'Categories',
  category: 'Categories_Category',
  categoryDetail: 'Categories_Destination',
  top25: 'Top 25',
  top25Detail: 'Top25_Destination',
  search: 'Search',
  searchDetail: 'Search_Destination',
  updates: 'Updates'
} as const

export type AppStoreScreenValue = (typeof AppStoreScreen)[keyof typeof AppStoreScreen]

export type AppStoreEditingState = 'None' | 'Active' | 'ActiveEmpty'

export interface AppStoreApplication {
  readonly trackId: number
  readonly trackName: string
  readonly artistName: string
  readonly sellerName: string
  readonly sellerUrl: string
  readonly formattedPrice: string
  readonly averageUserRating: number
  readonly userRatingCount: number
  readonly artworkUrl: string
  readonly screenshotUrls: readonly string[]
  readonly description: string
  readonly version: string
  readonly fileSizeBytes: string
  readonly contentAdvisoryRating: string
  readonly advisories: readonly string[]
  readonly features: readonly string[]
  readonly currentVersionReleaseDate: string
}
