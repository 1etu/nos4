export interface UIKeyboardHardwareHandlers {
  readonly onInsert: (text: string) => void
  readonly onDelete: () => void
  readonly onReturn: () => void
}

const editable = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
}

export const uiKeyboardAttachHardware = (
  handlers: UIKeyboardHardwareHandlers
): (() => void) => {
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    if (editable(event.target)) return
    if (event.key === 'Backspace') {
      event.preventDefault()
      handlers.onDelete()
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      handlers.onReturn()
      return
    }
    if (event.key.length !== 1) return
    event.preventDefault()
    handlers.onInsert(event.key)
  }

  window.addEventListener('keydown', onKeyDown)
  return () => window.removeEventListener('keydown', onKeyDown)
}
