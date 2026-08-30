import { createSignal } from 'solid-js'
import { NSUserDefaults } from 'NSUserDefaults'

export interface PHRecentCall {
  readonly id: string
  readonly date: number
  readonly number: string
  readonly type: string
}

const StorageKey = 'recents'

const [store, setStore] = createSignal<PHRecentCall[]>(
  NSUserDefaults.object<PHRecentCall[]>(StorageKey) ?? []
)

export const phRecentCalls = store

const persist = (next: PHRecentCall[]): void => {
  setStore(next)
  NSUserDefaults.setObject(StorageKey, next)
}

export const phPlaceCall = (number: string, type: string): void => {
  if (number === '') return
  persist([...store(), { id: `call-${Date.now()}`, date: Date.now(), number, type }])
}

export const phClearRecentCalls = (): void => persist([])
