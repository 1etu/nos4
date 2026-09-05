import type { AssetName } from 'CoreGraphics'

export interface ApplicationRecord {
  readonly bundleId: string
  readonly displayName: string
  readonly icon: AssetName
  readonly category: string
  readonly smallIcon?: AssetName
  readonly requiresData?: boolean
  readonly url?: string
}

const DataApplications: readonly string[] = [
  'gamecenter',
  'appstore',
  'mobilestore',
  'mobilesafari',
  'maps',
  'weather',
  'stocks',
  'mobilemail',
  'star'
]

const RepositoryURL = 'https://github.com/1etu/nos4'

const application = (
  slug: string,
  displayName: string,
  icon: AssetName,
  category: string,
  smallIcon?: AssetName
): ApplicationRecord => ({
  bundleId: `com.nos4.${slug}`,
  displayName,
  icon,
  category,
  ...(smallIcon ? { smallIcon } : {}),
  ...(DataApplications.includes(slug) ? { requiresData: true } : {})
})

const link = (
  slug: string,
  displayName: string,
  icon: AssetName,
  category: string,
  url: string
): ApplicationRecord => ({
  ...application(slug, displayName, icon, category),
  url
})

export const CalendarBundleId = 'com.nos4.mobilecal'

export const HomeScreenApplications: readonly ApplicationRecord[] = [
  application('mobilesms', 'Messages', 'Messages', 'Social'),
  application('mobilecal', 'Calendar', 'Calendar', 'Productivity'),
  application('mobileslideshow', 'Photos', 'Photos', 'Photography'),
  application('mobilecamera', 'Camera', 'Camera', 'Photography'),
  application('stocks', 'Stocks', 'Stocks', 'Finance'),
  application('maps', 'Maps', 'Maps', 'Navigation'),
  application('weather', 'Weather', 'Weather_Fahrenheit', 'Weather'),
  application('mobilenotes', 'Notes', 'Notes', 'Productivity'),
  application('mobilestore', 'iTunes', 'iTunes', 'Music'),
  application('appstore', 'App Store', 'App_Store', 'Utilities'),
  application('gamecenter', 'Game Center', 'Game_Center', 'Games'),
  application('flattybird', 'Flatty Bird', 'FlattyBirdIcon', 'Games'),
  application('doom', 'Doom', 'DoomIcon', 'Games'),
  application('preferences', 'Settings', 'Settings', 'Utilities'),
  link('star', 'Star!', 'StarIcon', 'Social', RepositoryURL)
]

export const FolderApplications: readonly ApplicationRecord[] = [
  application('mobiletimer', 'Clock', 'Clock', 'Utilities', 'Clock_Small'),
  application('calculator', 'Calculator', 'Calculator', 'Utilities', 'Calculator_Small'),
  application('compass', 'Compass', 'Compass', 'Navigation', 'Compass_Small'),
  application('voicememos', 'Voice Memos', 'Voice_Memos', 'Utilities', 'Voice_Memos_Small')
]

export const AppsSecondApplications: readonly ApplicationRecord[] = [
  application('mobileaddressbook', 'Contacts', 'Contacts', 'Utilities')
]

export const DockApplications: readonly ApplicationRecord[] = [
  application('mobilephone', 'Phone', 'Phone', 'Social'),
  application('mobilemail', 'Mail', 'Mail', 'Productivity'),
  application('mobilesafari', 'Safari', 'Safari', 'Utilities'),
  application('mobilemusicplayer', 'iPod', 'iPod', 'Music')
]

export const SearchApplications: readonly ApplicationRecord[] = [
  ...HomeScreenApplications,
  ...DockApplications,
  ...AppsSecondApplications
]

const registry = new Map<string, ApplicationRecord>(
  [...SearchApplications, ...FolderApplications].map((record) => [record.bundleId, record])
)

export const applicationForBundle = (bundleId: string): ApplicationRecord | undefined =>
  registry.get(bundleId)
