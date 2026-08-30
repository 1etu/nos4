export const CTRadioAccessTechnology = {
  none: 'none',
  edge: 'CTRadioAccessTechnologyEdge',
  wcdma: 'CTRadioAccessTechnologyWCDMA',
  hsdpa: 'CTRadioAccessTechnologyHSDPA'
} as const

export type CTRadioAccessTechnologyValue =
  (typeof CTRadioAccessTechnology)[keyof typeof CTRadioAccessTechnology]

export interface CTNetworkInterface {
  readonly name: string
  readonly secured: boolean
  readonly bars: number
}
