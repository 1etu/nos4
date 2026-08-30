import { createSignal, onCleanup, onMount, Show } from 'solid-js'
import { DeviceScene } from 'Device'
import { SpringBoard } from 'SpringBoard'
import { EventMonitor } from './EventMonitor'

const MonitorWidth = 360
const MonitorKey = 'F9'

export const DebugPage = () => {
  const [monitorOpen, setMonitorOpen] = createSignal(false)

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== MonitorKey) return
    event.preventDefault()
    setMonitorOpen(!monitorOpen())
  }

  onMount(() => {
    window.addEventListener('keydown', onKeyDown)
    onCleanup(() => window.removeEventListener('keydown', onKeyDown))
  })

  return (
    <>
      <DeviceScene>
        <SpringBoard />
      </DeviceScene>

      <Show when={monitorOpen()}>
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            bottom: '0',
            width: `${MonitorWidth}px`,
            'z-index': '2'
          }}
        >
          <EventMonitor />
        </div>
      </Show>
    </>
  )
}
