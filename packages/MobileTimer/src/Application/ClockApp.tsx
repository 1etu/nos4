import { createSignal, Match, Switch } from 'solid-js'
import { UIStatusBar, UITabBar } from 'UIKit'
import { ClockTabItems, type ClockTab } from '../Chrome/ClockTabs'
import { AlarmView } from '../Alarm/AlarmView'
import { StopwatchView } from '../Stopwatch/StopwatchView'
import { TimerView } from '../Timer/TimerView'
import { WorldClockView } from '../WorldClock/WorldClockView'

export const ClockApp = (props: { width: number }) => {
  const [tab, setTab] = createSignal<ClockTab>('world')

  return (
    <div class="relative flex h-full w-full flex-col overflow-hidden" style={{ background: 'black' }}>
      <UIStatusBar style="inApp" />

      <div class="relative flex-1 overflow-hidden">
        <Switch>
          <Match when={tab() === 'world'}>
            <WorldClockView />
          </Match>
          <Match when={tab() === 'alarm'}>
            <AlarmView />
          </Match>
          <Match when={tab() === 'stopwatch'}>
            <StopwatchView />
          </Match>
          <Match when={tab() === 'timer'}>
            <TimerView />
          </Match>
        </Switch>
      </div>

      <UITabBar
        width={props.width}
        items={ClockTabItems}
        selected={tab()}
        onSelect={(id) => setTab(id as ClockTab)}
      />
    </div>
  )
}
