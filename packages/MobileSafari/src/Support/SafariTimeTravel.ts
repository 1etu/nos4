export const SafariTimeTravel = {
  archiveOrigin: 'https://web.archive.org',
  timestamp: '20110615000000',
  flag: 'if_'
} as const

const ArchivePattern = /^https?:\/\/web\.archive\.org\/web\/\d+(?:[a-z]{2}_)?\/(https?:\/\/.+)$/i

export const MobileHosts: Readonly<Record<string, string>> = {
  'facebook.com': 'touch.facebook.com',
  'youtube.com': 'm.youtube.com',
  'wikipedia.org': 'en.m.wikipedia.org',
  'en.wikipedia.org': 'en.m.wikipedia.org',
  'yahoo.com': 'm.yahoo.com',
  'twitter.com': 'mobile.twitter.com',
  'cnn.com': 'm.cnn.com',
  'nytimes.com': 'mobile.nytimes.com',
  'amazon.com': 'm.amazon.com',
  'ebay.com': 'm.ebay.com',
  'reddit.com': 'm.reddit.com',
  'imdb.com': 'm.imdb.com',
  'bing.com': 'm.bing.com'
}

const MobileFrontPages: Readonly<Record<string, string>> = {
  'google.com': '/m'
}

export const bareHost = (host: string): string => host.replace(/^www\./i, '').toLowerCase()

export const isMobileHost = (host: string): boolean =>
  /^(m|mobile|touch|iphone|wap)\./i.test(host) || /\.m\./i.test(host)

export const mobileURL = (url: string): string => {
  try {
    const parsed = new URL(url)
    const bare = bareHost(parsed.hostname)
    const host = MobileHosts[bare]
    if (host) {
      parsed.hostname = host
      return parsed.href
    }
    const frontPage = MobileFrontPages[bare]
    if (frontPage && (parsed.pathname === '/' || parsed.pathname === '')) {
      parsed.pathname = frontPage
      return parsed.href
    }
    return url
  } catch {
    return url
  }
}

export const isArchivedURL = (url: string): boolean => ArchivePattern.test(url)

export const archivedURL = (url: string): string =>
  isArchivedURL(url)
    ? url
    : `${SafariTimeTravel.archiveOrigin}/web/${SafariTimeTravel.timestamp}${SafariTimeTravel.flag}/${mobileURL(url)}`

export const originalURL = (url: string): string => ArchivePattern.exec(url)?.[1] ?? url
