import { defineNotification } from 'Foundation'

export const TextInputIdentifier = 'com.nos4.textinput'

export const UIKeyboardWillShow = defineNotification<{ owner: string }>(
  'UIKeyboardWillShowNotification'
)
export const UIKeyboardWillHide = defineNotification<{ owner: string }>(
  'UIKeyboardWillHideNotification'
)
export const UIKeyboardDidInsert = defineNotification<{ text: string }>(
  'UIKeyboardDidInsertTextNotification'
)
export const UIKeyboardDidDelete = defineNotification<{ count: number }>(
  'UIKeyboardDidDeleteBackwardNotification'
)
export const UIKeyboardDidReturn = defineNotification<{ owner: string }>(
  'UIKeyboardDidPressReturnKeyNotification'
)
