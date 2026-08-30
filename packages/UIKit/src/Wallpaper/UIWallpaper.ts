import { createSignal, type Accessor } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import { NSUserDefaults } from 'NSUserDefaults'
import type { AssetName } from 'CoreGraphics'
import { UIWallpaperDefaultsKey, UIWallpaperMetrics } from './UIWallpaperMetrics'
import { UIWallpaperDidChange, UIWallpaperIdentifier } from './UIWallpaperNotifications'

export const UIWallpaperTarget = {
  lock: 'lock',
  home: 'home'
} as const

export type UIWallpaperTargetValue = (typeof UIWallpaperTarget)[keyof typeof UIWallpaperTarget]

const restore = (key: string): AssetName => {
  const stored = NSUserDefaults.string(key)
  return (stored ?? UIWallpaperMetrics.defaultWallpaper) as AssetName
}

const [lock, setLock] = createSignal<AssetName>(restore(UIWallpaperDefaultsKey.lock))
const [home, setHome] = createSignal<AssetName>(restore(UIWallpaperDefaultsKey.home))

export const uiWallpaperLock: Accessor<AssetName> = lock
export const uiWallpaperHome: Accessor<AssetName> = home

export const uiWallpaperSet = (
  targets: readonly UIWallpaperTargetValue[],
  wallpaper: AssetName
): void => {
  for (const target of targets) {
    if (target === UIWallpaperTarget.lock) {
      setLock(wallpaper)
      NSUserDefaults.setString(UIWallpaperDefaultsKey.lock, wallpaper)
      continue
    }
    setHome(wallpaper)
    NSUserDefaults.setString(UIWallpaperDefaultsKey.home, wallpaper)
  }
  NSNotificationCenter.post(UIWallpaperDidChange, UIWallpaperIdentifier, { wallpaper })
}

export const uiWallpaperCatalog = (): readonly AssetName[] =>
  Array.from(
    { length: UIWallpaperMetrics.catalogCount },
    (_entry, index) => `Wallpaper_${index + 1}` as AssetName
  )
