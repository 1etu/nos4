const Namespace = 'com.nos4.defaults'

const scoped = (key: string): string => `${Namespace}.${key}`
const read = (key: string): string | undefined => {
  try { return window.localStorage.getItem(scoped(key)) ?? undefined
  } catch { return undefined }
}

const write = (key: string, value: string): void => {
  try { window.localStorage.setItem(scoped(key), value)
  } catch { return }
}

export const NSUserDefaults = {
  string(key: string): string | undefined { return read(key) },
  setString(key: string, value: string): void { write(key, value) },

  object<T>(key: string): T | undefined {
    const raw = read(key)
    if (raw === undefined) return undefined
    try { return JSON.parse(raw) as T
    } catch { return undefined
    }
  },

  setObject<T>(key: string, value: T): void { write(key, JSON.stringify(value)) },

  removeObject(key: string): void {
    try { window.localStorage.removeItem(scoped(key))
    } catch { return
    }
  }
}
