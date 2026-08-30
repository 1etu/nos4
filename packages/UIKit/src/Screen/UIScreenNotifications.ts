import { defineNotification } from 'Foundation'

export const UIScreenIdentifier = 'com.nos4.uiscreen'

export const UIScreenBrightnessDidChange = defineNotification<{
  brightness: number
}>('UIScreenBrightnessDidChangeNotification')
