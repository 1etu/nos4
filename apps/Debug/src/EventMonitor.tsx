import { createSignal, For, onCleanup } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'

const MaxEntries = 300

interface LoggedEvent {
  readonly id: number
  readonly name: string
  readonly args: string
}

export const EventMonitor = () => {
  const [entries, setEntries] = createSignal<readonly LoggedEvent[]>([])
  let nextId = 0

  onCleanup(
    NSNotificationCenter.addGlobalObserver((notification) => {
      const entry: LoggedEvent = {
        id: nextId,
        name: notification.name,
        args: JSON.stringify(notification.userInfo)
      }
      nextId += 1
      setEntries((previous) => [entry, ...previous].slice(0, MaxEntries))
    })
  )

  return (
    <div style={{ height: '100%', overflow: 'auto', background: '#c0c0c0', padding: '6px' }}>
      <For each={entries()}>
        {(entry) => (
          <div style={{ background: '#ffffff', padding: '3px 6px', 'margin-bottom': '2px' }}>
            {entry.name} {entry.args}
          </div>
        )}
      </For>
    </div>
  )
}
