import { createSignal, type Accessor } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import { NSUserDefaults } from 'NSUserDefaults'
import { CTCarrierMetrics, CTDefaultsKey } from '../Support/CTMetrics'
import {
  CTAirplaneModeDidChange,
  CTCellularDataDidChange,
  CTReachabilityDidChange,
  CTWiFiPowerDidChange,
  CoreTelephonyIdentifier
} from '../Support/CTNotifications'

const stored = (key: string, fallback: boolean): boolean =>
  NSUserDefaults.object<boolean>(key) ?? fallback

const [airplaneMode, setAirplaneMode] = createSignal(stored(CTDefaultsKey.airplaneMode, false))
const [wifiPower, setWiFiPower] = createSignal(stored(CTDefaultsKey.wifiPower, true))
const [cellularData, setCellularData] = createSignal(stored(CTDefaultsKey.cellularData, true))
const [dataRoaming, setDataRoaming] = createSignal(stored(CTDefaultsKey.dataRoaming, false))
const [bluetooth, setBluetooth] = createSignal(stored(CTDefaultsKey.bluetooth, false))

export const ctAirplaneMode: Accessor<boolean> = airplaneMode
export const ctWiFiPower: Accessor<boolean> = wifiPower
export const ctCellularData: Accessor<boolean> = cellularData
export const ctDataRoaming: Accessor<boolean> = dataRoaming
export const ctBluetoothPower: Accessor<boolean> = bluetooth

export const ctNetworkReachable = (): boolean =>
  airplaneMode() ? wifiPower() : cellularData() || wifiPower()

export const ctWiFiActive = (): boolean => wifiPower()

const [networkName, setNetworkName] = createSignal(
  NSUserDefaults.string(CTDefaultsKey.networkName) ?? CTCarrierMetrics.defaultNetworkName
)

export const ctWiFiNetworkName: Accessor<string> = networkName

export const ctSetWiFiNetworkName = (name: string): void => {
  if (networkName() === name) return
  setNetworkName(name)
  NSUserDefaults.setString(CTDefaultsKey.networkName, name)
}

const publishReachability = () => {
  NSNotificationCenter.post(CTReachabilityDidChange, CoreTelephonyIdentifier, {
    reachable: ctNetworkReachable()
  })
}

export const ctSetAirplaneMode = (enabled: boolean): void => {
  if (airplaneMode() === enabled) return
  setAirplaneMode(enabled)
  NSUserDefaults.setObject(CTDefaultsKey.airplaneMode, enabled)
  NSNotificationCenter.post(CTAirplaneModeDidChange, CoreTelephonyIdentifier, { enabled })
  publishReachability()
}

export const ctSetWiFiPower = (enabled: boolean): void => {
  if (wifiPower() === enabled) return
  setWiFiPower(enabled)
  NSUserDefaults.setObject(CTDefaultsKey.wifiPower, enabled)
  NSNotificationCenter.post(CTWiFiPowerDidChange, CoreTelephonyIdentifier, { enabled })
  publishReachability()
}

export const ctSetCellularData = (enabled: boolean): void => {
  if (cellularData() === enabled) return
  setCellularData(enabled)
  NSUserDefaults.setObject(CTDefaultsKey.cellularData, enabled)
  NSNotificationCenter.post(CTCellularDataDidChange, CoreTelephonyIdentifier, { enabled })
  publishReachability()
}

export const ctSetDataRoaming = (enabled: boolean): void => {
  if (dataRoaming() === enabled) return
  setDataRoaming(enabled)
  NSUserDefaults.setObject(CTDefaultsKey.dataRoaming, enabled)
}

export const ctSetBluetoothPower = (enabled: boolean): void => {
  if (bluetooth() === enabled) return
  setBluetooth(enabled)
  NSUserDefaults.setObject(CTDefaultsKey.bluetooth, enabled)
}
