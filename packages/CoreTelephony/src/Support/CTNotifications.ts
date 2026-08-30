import { defineNotification } from 'Foundation'

export const CoreTelephonyIdentifier = 'com.nos4.coretelephony'

export const CTAirplaneModeDidChange = defineNotification<{
  enabled: boolean
}>('CTAirplaneModeDidChangeNotification')

export const CTWiFiPowerDidChange = defineNotification<{
  enabled: boolean
}>('CTWiFiPowerDidChangeNotification')

export const CTCellularDataDidChange = defineNotification<{
  enabled: boolean
}>('CTCellularDataDidChangeNotification')

export const CTCarrierDidChange = defineNotification<{
  carrierName: string
}>('CTTelephonyNetworkInfoDidUpdateProvidersNotification')

export const CTReachabilityDidChange = defineNotification<{
  reachable: boolean
}>('CTReachabilityDidChangeNotification')
