import { createSignal, For, Show } from 'solid-js'
import { UIBarButton, UINavigationBar, UIScrollView } from 'UIKit'
import { ClockPalette } from '../Support/ClockMetrics'
import { addAlarm, clockAlarms, removeAlarm, setAlarmEnabled } from '../Support/AlarmStore'
import { AlarmEditor } from './AlarmEditor'
import { AlarmRow } from './AlarmRow'

export const AlarmView = () => {
  const [editing, setEditing] = createSignal(false)
  const [adding, setAdding] = createSignal(false)

  return (
    <div class="relative flex h-full w-full flex-col overflow-hidden">
      <UINavigationBar
        title="Alarm"
        leading={
          <UIBarButton
            title={editing() ? 'Done' : 'Edit'}
            tone={editing() ? 'blue' : 'gray'}
            onClick={() => setEditing(!editing())}
          />
        }
        trailing={<UIBarButton title="+" tone="gray" onClick={() => setAdding(true)} />}
      />

      <UIScrollView class="flex-1" style={{ background: ClockPalette.listBackground }}>
        <For each={clockAlarms()}>
          {(alarm) => (
            <AlarmRow
              alarm={alarm}
              editing={editing()}
              onToggle={(on) => setAlarmEnabled(alarm.id, on)}
              onDelete={() => removeAlarm(alarm.id)}
            />
          )}
        </For>
      </UIScrollView>

      <Show when={adding()}>
        <div class="absolute inset-0">
          <AlarmEditor
            onCancel={() => setAdding(false)}
            onSave={(hours, minutes, repeat) => {
              addAlarm(hours, minutes, repeat)
              setAdding(false)
            }}
          />
        </div>
      </Show>
    </div>
  )
}
