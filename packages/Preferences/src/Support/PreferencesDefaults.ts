import { createSignal } from 'solid-js'
import { NSUserDefaults } from 'NSUserDefaults'
import {
  ctAirplaneMode,
  ctBluetoothPower,
  ctCellularData,
  ctDataRoaming,
  ctSetAirplaneMode,
  ctSetBluetoothPower,
  ctSetCellularData,
  ctSetDataRoaming,
  ctSetWiFiPower,
  ctWiFiPower
} from 'CoreTelephony'
import { uiScreenAutoBrightness, uiScreenSetAutoBrightness } from 'UIKit'
import { PreferencesBinding, type PreferencesBindingValue } from './PreferencesTypes'

const StorePrefix = 'preferences.'

const [switches, setSwitches] = createSignal<Record<string, boolean>>(
  NSUserDefaults.object<Record<string, boolean>>(`${StorePrefix}switches`) ?? {}
)

const readers: Record<PreferencesBindingValue, () => boolean> = {
  [PreferencesBinding.airplaneMode]: ctAirplaneMode,
  [PreferencesBinding.wifiPower]: ctWiFiPower,
  [PreferencesBinding.cellularData]: ctCellularData,
  [PreferencesBinding.dataRoaming]: ctDataRoaming,
  [PreferencesBinding.bluetooth]: ctBluetoothPower,
  [PreferencesBinding.autoBrightness]: uiScreenAutoBrightness
}

const writers: Record<PreferencesBindingValue, (on: boolean) => void> = {
  [PreferencesBinding.airplaneMode]: ctSetAirplaneMode,
  [PreferencesBinding.wifiPower]: ctSetWiFiPower,
  [PreferencesBinding.cellularData]: ctSetCellularData,
  [PreferencesBinding.dataRoaming]: ctSetDataRoaming,
  [PreferencesBinding.bluetooth]: ctSetBluetoothPower,
  [PreferencesBinding.autoBrightness]: uiScreenSetAutoBrightness
}

export const preferencesSwitchValue = (
  binding: PreferencesBindingValue | undefined,
  key: string | undefined,
  fallback: boolean
): boolean => {
  if (binding) return readers[binding]()
  if (!key) return fallback
  return switches()[key] ?? fallback
}

export const preferencesSetSwitch = (
  binding: PreferencesBindingValue | undefined,
  key: string | undefined,
  on: boolean
): void => {
  if (binding) {
    writers[binding](on)
    return
  }
  if (!key) return
  const next = { ...switches(), [key]: on }
  setSwitches(next)
  NSUserDefaults.setObject(`${StorePrefix}switches`, next)
}
