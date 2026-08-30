import { createSignal } from 'solid-js'
import { NSUserDefaults } from 'NSUserDefaults'

export interface PHFavorite {
  readonly id: string
  readonly name: string
  readonly number: string
  readonly type: string
}

const StorageKey = 'favorites'

const [store, setStore] = createSignal<PHFavorite[]>(
  NSUserDefaults.object<PHFavorite[]>(StorageKey) ?? []
)

export const phFavorites = store

const persist = (next: PHFavorite[]): void => {
  setStore(next)
  NSUserDefaults.setObject(StorageKey, next)
}

export const phAddFavorite = (name: string, number: string, type: string): void => {
  persist([...store(), { id: `favorite-${Date.now()}`, name, number, type }])
}

export const phRemoveFavorite = (id: string): void => {
  persist(store().filter((entry) => entry.id !== id))
}
