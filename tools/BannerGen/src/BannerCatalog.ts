export interface BannerPanel {
  readonly icon?: string
  readonly headline: string
  readonly body?: string
  readonly taglineLead?: string
  readonly taglineLink?: string
}

export interface BannerDefinition {
  readonly name: string
  readonly output: string
  readonly panel: BannerPanel
  readonly shots: readonly string[]
}

export const Banners: readonly BannerDefinition[] = [
  {
    name: 'intro',
    output: 'nosmarketingassets/nos4-intro.png',
    panel: {
      headline: 'Introducing nOS4',
      taglineLead: 'Check it out at ',
      taglineLink: 'nos4.fun'
    },
    shots: ['intro_1.png', 'intro_2.png', 'intro_3.png']
  },
  {
    name: 'main',
    output: 'nosmarketingassets/nos4-main.png',
    panel: {
      headline: 'Home',
      body: 'Every app a tap away, across pages and the dock. Double press Home to switch between what is already running, and drag one icon onto another to file them both in a folder.'
    },
    shots: ['main_1.png', 'main_3.png', 'main_2.png']
  },
  {
    name: 'maps',
    output: 'nosmarketingassets/nos4-maps.png',
    panel: {
      icon: 'assets/homescreen-icons/maps.png',
      headline: 'Maps',
      body: 'Search for any place or address, get directions between two points, and find yourself with a single tap. Pull back the corner to change the view.'
    },
    shots: ['maps_1.png', 'maps_2.png', 'maps_3.png']
  },
  {
    name: 'safari',
    output: 'nosmarketingassets/nos4-safari.png',
    panel: {
      icon: 'assets/homescreen-icons/safari.png',
      headline: 'Safari',
      body: 'The real web, on the phone you remember. Pages load, bookmarks and history stay where you left them, and open pages tile up so you can flick between them.'
    },
    shots: ['safari_1.png', 'safari_2.png', 'safari_3.png']
  },
  {
    name: 'mail',
    output: 'nosmarketingassets/nos4-mail.png',
    panel: {
      icon: 'assets/homescreen-icons/mail.png',
      headline: 'Mail',
      body: 'Mailboxes, an inbox that counts what you have not read, and a reading view you can page through one message at a time.'
    },
    shots: ['mail_1.png', 'mail_2.png', 'mail_3.png']
  },
  {
    name: 'phone',
    output: 'nosmarketingassets/nos4-phone.png',
    panel: {
      icon: 'assets/homescreen-icons/phone.png',
      headline: 'Phone',
      body: 'Favourites, recents and every contact you have, behind a keypad that still feels like a keypad. Tap a name and the call screen takes over.'
    },
    shots: ['phone_1.png', 'phone_2.png', 'phone_3.png']
  },
  {
    name: 'itunes',
    output: 'nosmarketingassets/nos4-itunes.png',
    panel: {
      icon: 'assets/homescreen-icons/itunes.png',
      headline: 'iTunes',
      body: 'Browse new music, open an album to see every track and what it costs, and dig through videos. The charts are live.'
    },
    shots: ['itunes_1.png', 'itunes_2.png', 'itunes_3.png']
  },
  {
    name: 'appstore',
    output: 'nosmarketingassets/nos4-appstore.png',
    panel: {
      icon: 'assets/homescreen-icons/app-store.png',
      headline: 'App Store',
      body: 'Featured, categories and the top 25, pulled from the real store. Search it, read the write up, and flick through the screenshots.'
    },
    shots: ['appstore_1.png', 'appstore_2.png', 'appstore_3.png']
  },
  {
    name: 'gamecenter',
    output: 'nosmarketingassets/nos4-gamecenter.png',
    panel: {
      icon: 'assets/homescreen-icons/game-center.png',
      headline: 'Game Center',
      body: 'A real account with a nickname nobody else can take, and leaderboards backed by a live database. Play Flatty Bird and your score lands on the board.'
    },
    shots: ['gamecenter_1.png', 'gamecenter_2.png', 'gamecenter_3.png']
  },
  {
    name: 'weather',
    output: 'nosmarketingassets/nos4-weather.png',
    panel: {
      icon: 'assets/homescreen-icons/weather-fahrenheit.png',
      headline: 'Weather',
      body: 'Six days ahead for anywhere you care about. Add a city, flip between them, and read the conditions off live forecast data.'
    },
    shots: ['weather_1.png', 'weather_2.png', 'weather_3.png']
  },
  {
    name: 'clock',
    output: 'nosmarketingassets/nos4-clock.png',
    panel: {
      icon: 'assets/homescreen-icons/clock.png',
      headline: 'Clock',
      body: 'World clock, alarms, a stopwatch and a timer. The dials really move, and the alarms really go off.'
    },
    shots: ['clock_1.png', 'clock_2.png', 'clock_3.png']
  },
  {
    name: 'settings',
    output: 'nosmarketingassets/nos4-settings.png',
    panel: {
      icon: 'assets/homescreen-icons/settings.png',
      headline: 'Settings',
      body: 'Airplane mode, Wi-Fi, brightness, wallpaper, sounds. Every switch is wired to something, and what you change sticks.'
    },
    shots: ['settings_1.png', 'settings_2.png']
  },
  {
    name: 'doom',
    output: 'nosmarketingassets/nos4-doom.png',
    panel: {
      icon: 'assets/doom/doomicon.png',
      headline: 'Doom',
      body: 'Yes, it runs Doom.'
    },
    shots: ['doom_1_big.png']
  }
]

export const bannerNamed = (name: string): BannerDefinition | undefined =>
  Banners.find((banner) => banner.name === name)
