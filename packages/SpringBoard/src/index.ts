export { SpringBoard } from './Application/SpringBoard'
export { LockScreen } from './LockScreen/LockScreen'
export { LockFooter } from './LockScreen/LockFooter'
export { HomeScreen } from './HomeScreen/HomeScreen'
export { SpringBoardMetrics } from './Support/SpringBoardMetrics'
export { HomeScreenApplications, DockApplications, SearchApplications, AppsSecondApplications } from './Support/Bundles'
export type { ApplicationRecord } from './Support/Bundles'
export {
  SpringBoardIdentifier,
  SBApplicationDidLaunch,
  SBApplicationDidTerminate,
  SBDidReturnToHomeScreen,
  SBDidUnlock
} from './Support/SpringBoardNotifications'
export { PageIndicator } from './HomeScreen/PageIndicator'
export { MultitaskingTray, multitaskingTrayHeight } from './Switcher/MultitaskingTray'
