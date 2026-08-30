import { defineNotification } from 'Foundation'

export const ContactsIdentifier = 'com.nos4.mobileaddressbook'

export const ContactsDidChange = defineNotification<{
  count: number
}>('ABAddressBookDidChangeNotification')
