import { UITabBarMetrics, type UITabBarItem } from 'UIKit'
import { ClockIcons } from '../Support/ClockIcons'

export type ClockTab = 'world' | 'alarm' | 'stopwatch' | 'timer'

const iconWidth = UITabBarMetrics.iconSize

export const ClockTabItems: readonly UITabBarItem[] = [
  { id: 'world', title: 'World Clock', icon: ClockIcons.worldClock, iconWidth },
  { id: 'alarm', title: 'Alarm', icon: ClockIcons.alarm, iconWidth },
  { id: 'stopwatch', title: 'Stopwatch', icon: ClockIcons.stopwatch, iconWidth },
  { id: 'timer', title: 'Timer', icon: ClockIcons.timer, iconWidth }
]
