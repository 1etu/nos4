import { NSUserDefaults } from 'NSUserDefaults'
import { ctCarrierName, ctCarrierVersion } from 'CoreTelephony'

const IdentityKey = 'preferences.identity'
const HexAlphabet = '0123456789ABCDEF'
const SerialAlphabet = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'

export const PreferencesDeviceMetrics = {
  systemVersion: '4.3 (8F190)',
  modemFirmware: '04.10.01',
  model: 'iPhone',
  applicationCount: 19,
  mediaCount: 0,
  capacityGigabytes: 29.1,
  availableGigabytes: 26.4,
  serialLength: 11,
  macGroups: 6,
  macGroupLength: 2,
  imeiGroups: [2, 6, 6, 1]
} as const

interface StoredIdentity {
  readonly serial: string
  readonly wifiAddress: string
  readonly bluetoothAddress: string
  readonly imei: string
  readonly iccid: string
}

const pick = (alphabet: string, length: number): string => {
  let value = ''
  for (let index = 0; index < length; index += 1) {
    value += alphabet.charAt(Math.floor(Math.random() * alphabet.length))
  }
  return value
}

const digits = (length: number): string => pick('0123456789', length)

const macAddress = (): string =>
  Array.from({ length: PreferencesDeviceMetrics.macGroups }, () =>
    pick(HexAlphabet, PreferencesDeviceMetrics.macGroupLength)
  ).join(':')

const mint = (): StoredIdentity => ({
  serial: pick(SerialAlphabet, PreferencesDeviceMetrics.serialLength),
  wifiAddress: macAddress(),
  bluetoothAddress: macAddress(),
  imei: PreferencesDeviceMetrics.imeiGroups.map((length) => digits(length)).join(' '),
  iccid: digits(18)
})

const identity = ((): StoredIdentity => {
  const stored = NSUserDefaults.object<StoredIdentity>(IdentityKey)
  if (stored && typeof stored.serial === 'string') return stored
  const made = mint()
  NSUserDefaults.setObject(IdentityKey, made)
  return made
})()

const gigabytes = (value: number): string => `${value.toFixed(1)} GB`

export const preferencesAboutRows = (): readonly { id: string; title: string; value: string }[] => [
  { id: 'aboutNetwork', title: 'Network', value: ctCarrierName() },
  { id: 'aboutSongs', title: 'Songs', value: String(PreferencesDeviceMetrics.mediaCount) },
  { id: 'aboutVideos', title: 'Videos', value: String(PreferencesDeviceMetrics.mediaCount) },
  { id: 'aboutPhotos', title: 'Photos', value: String(PreferencesDeviceMetrics.mediaCount) },
  {
    id: 'aboutApplications',
    title: 'Applications',
    value: String(PreferencesDeviceMetrics.applicationCount)
  },
  {
    id: 'aboutCapacity',
    title: 'Capacity',
    value: gigabytes(PreferencesDeviceMetrics.capacityGigabytes)
  },
  {
    id: 'aboutAvailable',
    title: 'Available',
    value: gigabytes(PreferencesDeviceMetrics.availableGigabytes)
  },
  { id: 'aboutVersion', title: 'Version', value: PreferencesDeviceMetrics.systemVersion },
  { id: 'aboutCarrier', title: 'Carrier', value: ctCarrierVersion() },
  { id: 'aboutModel', title: 'Model', value: PreferencesDeviceMetrics.model },
  { id: 'aboutSerial', title: 'Serial Number', value: identity.serial },
  { id: 'aboutWifi', title: 'Wi-Fi Address', value: identity.wifiAddress },
  { id: 'aboutBluetooth', title: 'Bluetooth', value: identity.bluetoothAddress },
  { id: 'aboutImei', title: 'IMEI', value: identity.imei },
  { id: 'aboutIccid', title: 'ICCID', value: identity.iccid },
  { id: 'aboutModem', title: 'Modem Firmware', value: PreferencesDeviceMetrics.modemFirmware }
]
