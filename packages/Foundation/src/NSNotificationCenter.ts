declare const payload: unique symbol

export interface NSNotification<T> {
  readonly name: string
  readonly object: string
  readonly userInfo: T
}

export interface NSNotificationDescriptor<T> {
  readonly name: string
  readonly [payload]: T
}

type ObserverFn = (notification: NSNotification<unknown>) => void

const observers = new Map<string, Set<ObserverFn>>()
const globalObservers = new Set<ObserverFn>()

export const defineNotification = <T>(name: string): NSNotificationDescriptor<T> => ({ name }) as NSNotificationDescriptor<T>

export const NSNotificationCenter = {
  post<T>(descriptor: NSNotificationDescriptor<T>, object: string, userInfo: T): void {
    const notification: NSNotification<unknown> = { name: descriptor.name, object, userInfo }
    const targeted = observers.get(descriptor.name)
    if (targeted) { for (const observer of [...targeted]) observer(notification)
    } for (const observer of [...globalObservers]) observer(notification)
  },

  addObserver<T>(
    descriptor: NSNotificationDescriptor<T>,
    using: (notification: NSNotification<T>) => void
  ): () => void {
    const existing = observers.get(descriptor.name)
    const set = existing ?? new Set<ObserverFn>()
    if (!existing) observers.set(descriptor.name, set)
    const observer: ObserverFn = (notification) => { using(notification as NSNotification<T>) }
    set.add(observer)
    return () => { set.delete(observer) }
  },

  addGlobalObserver(using: ObserverFn): () => void {
    globalObservers.add(using) // i gues so?
    return () => { globalObservers.delete(using)}
  }
}
