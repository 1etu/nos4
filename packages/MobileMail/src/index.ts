export { MailApp } from './Application/MailApp'
export { MailMetrics, MailPalette } from './Support/MailMetrics'
export { MailScreen, MailProvider } from './Support/MailTypes'
export type {
  MailScreenValue,
  MailProviderValue,
  MailAddress,
  MailMessage,
  MailFolder,
  MailAccount
} from './Support/MailTypes'
export { MailIdentifier, MailStoreDidChange, MailAccountDidChange } from './Support/MailNotifications'
export {
  MailFolders,
  mailMessages,
  mailAccount,
  mailUpdated,
  mailRefreshing,
  mailMessagesIn,
  mailUnreadIn,
  mailTotalIn,
  mailMarkSeen,
  mailMoveMessage,
  mailDeleteMessage,
  mailSendMessage,
  mailSignIn,
  mailSignOut
} from './Support/MailStore'
export { mailRelativeTime, mailDetailDate, mailUpdatedLabel } from './Support/MailDate'
