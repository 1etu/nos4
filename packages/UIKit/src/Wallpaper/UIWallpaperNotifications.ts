import { defineNotification } from 'Foundation'

export const UIWallpaperIdentifier = 'com.nos4.uiwallpaper'

export const UIWallpaperDidChange = defineNotification<{
  wallpaper: string
}>('UIWallpaperDidChangeNotification')
