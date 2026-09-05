import { createContext, useContext, type Accessor } from 'solid-js'
import { DeviceMetrics } from './DeviceMetrics'

export const DeviceScreenHeight = createContext<Accessor<number>>(() => DeviceMetrics.stageHeight)
export const useDeviceScreenHeight = () => useContext(DeviceScreenHeight)
