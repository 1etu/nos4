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
    output: 'nos4-intro.png',
    panel: {
      headline: 'Introducing nOS4',
      taglineLead: 'Check it out at ',
      taglineLink: 'nos4.fun'
    },
    shots: ['intro_1.png', 'intro_2.png', 'intro_3.png']
  },
  {
    name: 'main',
    output: 'nos4-main.png',
    panel: {
      headline: 'Home',
      body: 'Every app a tap away, across pages and the dock. Double press Home to switch between what is already running, and drag one icon onto another to file them both in a folder.'
    },
    shots: ['main_1.png', 'main_3.png', 'main_2.png']
  },
  {
    name: 'maps',
    output: 'nos4-maps.png',
    panel: {
      icon: 'assets/homescreen-icons/maps.png',
      headline: 'Maps',
      body: 'Search for any place or address, get directions between two points, and find yourself with a single tap. Pull back the corner to change the view.'
    },
    shots: ['maps_1.png', 'maps_2.png', 'maps_3.png']
  }
]

export const bannerNamed = (name: string): BannerDefinition | undefined =>
  Banners.find((banner) => banner.name === name)
