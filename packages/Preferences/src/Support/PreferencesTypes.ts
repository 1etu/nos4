import type { AssetName } from 'CoreGraphics'

export const PreferencesAccessory = {
  none: 'none',
  chevron: 'chevron',
  toggle: 'toggle',
  checkmark: 'checkmark',
  spinner: 'spinner'
} as const

export type PreferencesAccessoryValue =
  (typeof PreferencesAccessory)[keyof typeof PreferencesAccessory]

export const PreferencesBinding = {
  airplaneMode: 'airplaneMode',
  wifiPower: 'wifiPower',
  cellularData: 'cellularData',
  dataRoaming: 'dataRoaming',
  bluetooth: 'bluetooth',
  autoBrightness: 'autoBrightness',
  webTimeTravel: 'webTimeTravel'
} as const

export type PreferencesBindingValue =
  (typeof PreferencesBinding)[keyof typeof PreferencesBinding]

export interface PreferencesRowSpec {
  readonly id: string
  readonly title: string
  readonly icon?: AssetName
  readonly accessory: PreferencesAccessoryValue
  readonly destination?: string
  readonly value?: string
  readonly binding?: PreferencesBindingValue
  readonly defaultsKey?: string
  readonly defaultOn?: boolean
  readonly tone?: 'blue' | 'orange'
  readonly selected?: boolean
}

export interface PreferencesSectionSpec {
  readonly id: string
  readonly header?: string
  readonly footnote?: string
  readonly rows: readonly PreferencesRowSpec[]
}

export interface PreferencesPageSpec {
  readonly id: string
  readonly title: string
  readonly sections: readonly PreferencesSectionSpec[]
}
