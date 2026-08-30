import { createSignal, type Accessor } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import { NSUserDefaults } from 'NSUserDefaults'
import { CTCarrierMetrics, CTDefaultsKey } from '../Support/CTMetrics'
import { CTCarrierDidChange, CoreTelephonyIdentifier } from '../Support/CTNotifications'
import { CTRadioAccessTechnology, type CTRadioAccessTechnologyValue } from '../Support/CTTypes'
import { ctAirplaneMode, ctCellularData } from '../Radio/CTRadioState'

const [carrierName, setCarrierName] = createSignal(
  NSUserDefaults.string(CTDefaultsKey.carrierName) ?? CTCarrierMetrics.defaultCarrierName
)

export const ctCarrierName: Accessor<string> = carrierName // maybe a set of real carriers l8
export const ctCarrierVersion = (): string => CTCarrierMetrics.carrierVersion

export const ctSignalBars = (): number =>
  ctAirplaneMode() ? 0 : CTCarrierMetrics.defaultBars

export const ctRadioAccessTechnology = (): CTRadioAccessTechnologyValue => {
  if (ctAirplaneMode() || !ctCellularData()) return CTRadioAccessTechnology.none
  return CTRadioAccessTechnology.hsdpa
}

export const ctSetCarrierName = (name: string): void => {
  if (carrierName() === name) return
  setCarrierName(name)
  NSUserDefaults.setString(CTDefaultsKey.carrierName, name)
  NSNotificationCenter.post(CTCarrierDidChange, CoreTelephonyIdentifier, { carrierName: name })
}
