const DatabaseName = 'com.nos4.mobilevoicememos'
const StoreName = 'recordings'
const DatabaseVersion = 1

export interface VMStoredRecording {
  readonly id: string
  readonly blob: Blob
  readonly duration: number
  readonly recordedAt: number
}

let handle: Promise<IDBDatabase> | undefined

const database = (): Promise<IDBDatabase> => {
  if (handle) return handle
  handle = new Promise((resolve, reject) => {
    const request = indexedDB.open(DatabaseName, DatabaseVersion)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(StoreName)) {
        request.result.createObjectStore(StoreName, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  return handle
}

const transact = async <T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T | undefined> => {
  try {
    const db = await database()
    return await new Promise<T>((resolve, reject) => {
      const request = run(db.transaction(StoreName, mode).objectStore(StoreName))
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } catch {
    return undefined
  }
}

export const vmLoadRecordings = async (): Promise<VMStoredRecording[]> => {
  const rows = await transact<VMStoredRecording[]>('readonly', (store) => store.getAll())
  return (rows ?? []).sort((a, b) => b.recordedAt - a.recordedAt)
}

export const vmSaveRecording = async (recording: VMStoredRecording): Promise<void> => {
  await transact('readwrite', (store) => store.put(recording))
}

export const vmDeleteRecording = async (id: string): Promise<void> => {
  await transact('readwrite', (store) => store.delete(id))
}
