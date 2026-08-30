import { assetURL, type AssetName } from 'CoreGraphics'
import { UITabBarMetrics, type UITabBarItem } from 'UIKit'
import { PhoneMetrics } from '../Support/PhoneMetrics'

export type PhoneTab = 'Favorites' | 'Recents' | 'Contacts' | 'Keypad' | 'Voicemail'

const mask = (name: AssetName): string => `url(${assetURL(name)})`

export const PhoneTabItems: readonly UITabBarItem[] = [
  {
    id: 'Favorites',
    title: 'Favorites',
    icon: mask('Favorites_Phone'),
    iconWidth: UITabBarMetrics.iconSize
  },
  {
    id: 'Recents',
    title: 'Recents',
    icon: mask('Recents_Phone'),
    iconWidth: UITabBarMetrics.iconSize
  },
  {
    id: 'Contacts',
    title: 'Contacts',
    icon: mask('Contacts_Phone'),
    iconWidth: UITabBarMetrics.iconSize
  },
  {
    id: 'Keypad',
    title: 'Keypad',
    icon: mask('Keypad_Phone'),
    iconWidth: PhoneMetrics.tabIconWidthKeypad
  },
  {
    id: 'Voicemail',
    title: 'Voicemail',
    icon: mask('Voicemail_Phone'),
    iconWidth: PhoneMetrics.tabIconWidthVoicemail
  }
]
