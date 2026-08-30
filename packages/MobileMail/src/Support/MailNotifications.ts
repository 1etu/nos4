import { defineNotification } from 'Foundation'

export const MailIdentifier = 'com.nos4.mobilemail'

export const MailStoreDidChange = defineNotification<{
  count: number
}>('MailStoreDidChangeNotification')

export const MailAccountDidChange = defineNotification<{
  email: string
}>('MailAccountDidChangeNotification')
