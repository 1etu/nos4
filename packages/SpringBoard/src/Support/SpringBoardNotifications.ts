import { defineNotification } from 'Foundation'

export const SpringBoardIdentifier = 'com.nos4.springboard'

export const SBApplicationDidLaunch = defineNotification<{ bundleId: string }>(
  'SBApplicationDidLaunchNotification'
)

export const SBApplicationDidTerminate = defineNotification<{ bundleId: string }>(
  'SBApplicationDidExitNotification'
)

export const SBDidReturnToHomeScreen = defineNotification<{ page: number }>(
  'SBHomeScreenDidAppearNotification'
)

export const SBDidUnlock = defineNotification<{ page: number }>(
  'SBLockScreenDidUnlockNotification'
)
