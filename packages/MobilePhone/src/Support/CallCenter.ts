import { createSignal } from 'solid-js'
import { phPlaceCall } from './RecentsStore'

export type PHCallState = 'idle' | 'incoming' | 'dialing' | 'active'

export interface PHCall {
  readonly name: string
  readonly number: string
  readonly label: string
}

const UnlabelledCall = 'unknown'

const [call, setCall] = createSignal<PHCall | undefined>()
const [state, setState] = createSignal<PHCallState>('idle')
const [connectedAt, setConnectedAt] = createSignal(0)

export const phCall = call
export const phCallState = state
export const phCallConnectedAt = connectedAt

export const phDialCall = (name: string, number: string, label: string): void => {
  if (number === '') return
  phPlaceCall(number, label === '' ? UnlabelledCall : label)
  setCall({ name, number, label })
  setState('dialing')
}

export const phReceiveCall = (name: string, number: string, label: string): void => {
  setCall({ name, number, label })
  setState('incoming')
}

export const phConnectCall = (): void => {
  setConnectedAt(Date.now())
  setState('active')
}

export const phEndCall = (): void => {
  setCall(undefined)
  setConnectedAt(0)
  setState('idle')
}

export const phCallDuration = (now: number): string => {
  const seconds = Math.max(0, Math.floor((now - connectedAt()) / 1000))
  const minutes = Math.floor(seconds / 60)
  const pad = (value: number) => String(value).padStart(2, '0')
  if (minutes < 60) return `${pad(minutes)}:${pad(seconds % 60)}`
  return `${Math.floor(minutes / 60)}:${pad(minutes % 60)}:${pad(seconds % 60)}`
}
