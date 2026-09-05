import { createSignal } from 'solid-js'
import { defineNotification, NSNotificationCenter } from 'Foundation'

export interface CKStoredAsset {
  readonly id: string
  readonly mediaType: 'image' | 'video'
  readonly blob: Blob
  readonly duration: number
  readonly createdAt: number
}

export interface CKLibraryAsset extends CKStoredAsset {
  readonly url: string
}

export const CKPhotoLibraryDidChange = defineNotification<{ id: string }>('CKPhotoLibraryDidChangeNotification')
const [assets, setAssets] = createSignal<readonly CKLibraryAsset[]>([])
const [storageError, setStorageError] = createSignal('')
export const ckPhotoLibrary = assets
export const ckStorageError = storageError
let database: Promise<IDBDatabase> | undefined
let loaded: Promise<void> | undefined

const openDatabase = (): Promise<IDBDatabase> => {
  if (database) return database
  database = new Promise((resolve, reject) => {
    const request = indexedDB.open('CameraKit', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('captures', { keyPath: 'id' })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(new Error('Close other tabs and try again.'))
  })
  void database.catch(() => { database = undefined })
  return database
}

const isStoredAsset = (value: unknown): value is CKStoredAsset => {
  if (typeof value !== 'object' || value === null) return false
  return 'id' in value && typeof value.id === 'string' && 'blob' in value && value.blob instanceof Blob &&
    'mediaType' in value && (value.mediaType === 'image' || value.mediaType === 'video') &&
    'duration' in value && typeof value.duration === 'number' && Number.isFinite(value.duration) &&
    'createdAt' in value && typeof value.createdAt === 'number' && Number.isFinite(value.createdAt)
}

const restore = async () => {
  try {
    const db = await openDatabase()
    const rows = await new Promise<unknown[]>((resolve, reject) => {
      const request = db.transaction('captures').objectStore('captures').getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const existing = new Set(assets().map((asset) => asset.id))
    const restored = rows.filter(isStoredAsset).filter((asset) => !existing.has(asset.id))
      .map((asset) => ({ ...asset, url: URL.createObjectURL(asset.blob) }))
    setAssets((current) => [...current, ...restored].sort((a, b) => a.createdAt - b.createdAt))
  } catch {
    setStorageError('Local storage is unavailable. Download your captures to keep them.')
    loaded = undefined
  }
}

export const ckLoadPhotoLibrary = (): Promise<void> => {
  loaded ??= restore()
  return loaded
}

export const ckSaveCapture = async (blob: Blob, mediaType: 'image' | 'video', duration = 0) => {
  const asset: CKStoredAsset = { id: crypto.randomUUID(), blob, mediaType, duration, createdAt: Date.now() }
  const entry = { ...asset, url: URL.createObjectURL(blob) }
  setAssets((current) => [...current, entry])
  NSNotificationCenter.post(CKPhotoLibraryDidChange, 'com.nos4.camerakit', { id: asset.id })
  try {
    const db = await openDatabase()
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('captures', 'readwrite')
      transaction.objectStore('captures').put(asset)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
    setStorageError('')
  } catch {
    setStorageError('This capture is not saved locally. Download it to keep it.')
  }
  return entry
}

export const ckDownloadAsset = (url: string, filename: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
}
