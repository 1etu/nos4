import { createSignal } from 'solid-js'
import { NSUserDefaults } from 'NSUserDefaults'
import { uiWebViewTimeTravel } from 'UIKit'
import { MobileSafariMetrics } from './MobileSafariMetrics'
import { archivedURL, originalURL } from './SafariTimeTravel'

const PagesKey = 'webpages'
const BookmarksKey = 'bookmarks'
const ProxyOrigin = 'http://127.0.0.1:5174'
export const BlankPage = 'https://'

export type WebTransport = 'proxy' | 'direct'

export interface WebPage {
  readonly id: string
  readonly url: string
  readonly title: string
  readonly progress: number
  readonly history: readonly string[]
  readonly cursor: number
}

const emptyPage = (url = BlankPage): WebPage => ({
  id: `page-${Math.random().toString(36).slice(2, 10)}`,
  url,
  title: '',
  progress: 1,
  history: url === BlankPage ? [] : [url],
  cursor: url === BlankPage ? -1 : 0
})

const storedPages = NSUserDefaults.object<Record<string, string>>(PagesKey)

const initial = (): WebPage[] => {
  const entries = Object.entries(storedPages ?? {}).sort(
    (a, b) => Number(a[0]) - Number(b[0])
  )
  if (entries.length === 0) return [emptyPage()]
  return entries.map(([, url]) => emptyPage(url))
}

const [pages, setPages] = createSignal<readonly WebPage[]>(initial())
const [index, setIndex] = createSignal(0)
const [transport, setTransport] = createSignal<WebTransport>('proxy')

export const webPages = pages
export const pageIndex = index
export const webTransport = transport

export const currentPage = (): WebPage => pages()[index()] ?? emptyPage()

const persistPages = (next: readonly WebPage[]): void => {
  const dict: Record<string, string> = {}
  next.forEach((page, at) => {
    dict[`${at}`] = page.url
  })
  NSUserDefaults.setObject(PagesKey, dict)
}

const replace = (at: number, patch: Partial<WebPage>): void => {
  const next = pages().map((page, position) => (position === at ? { ...page, ...patch } : page))
  setPages(next)
  if (patch.url !== undefined) persistPages(next)
}

export const setPageIndex = (next: number): void => {
  setIndex(Math.min(Math.max(next, 0), pages().length - 1))
}

export const canAddPage = (): boolean => pages().length < MobileSafariMetrics.maxPages

export const addPage = (): void => {
  if (!canAddPage()) return
  const next = [...pages(), emptyPage()]
  setPages(next)
  persistPages(next)
}

export const closePage = (id: string): void => {
  if (pages().length <= 1) return
  const at = pages().findIndex((page) => page.id === id)
  const next = pages().filter((page) => page.id !== id)
  setPages(next)
  persistPages(next)
  if (at <= index()) setIndex(Math.max(0, index() - 1))
}

export const navigate = (url: string): void => {
  const page = currentPage()
  const trimmed = page.history.slice(0, page.cursor + 1)
  replace(index(), {
    url,
    progress: 0,
    history: [...trimmed, url],
    cursor: trimmed.length
  })
}

export const reportLocation = (url: string): void => {
  const page = currentPage()
  if (page.url === url) return
  const trimmed = page.history.slice(0, page.cursor + 1)
  replace(index(), { url, history: [...trimmed, url], cursor: trimmed.length })
}

export const reportTitle = (title: string): void => {
  if (currentPage().title === title) return
  replace(index(), { title })
}

export const reportProgress = (progress: number): void => {
  if (currentPage().progress === progress) return
  replace(index(), { progress })
}

export const canGoBack = (): boolean => currentPage().cursor > 0

export const canGoForward = (): boolean => {
  const page = currentPage()
  return page.cursor >= 0 && page.cursor < page.history.length - 1
}

export const goBack = (): void => {
  if (!canGoBack()) return
  const page = currentPage()
  const cursor = page.cursor - 1
  replace(index(), { cursor, url: page.history[cursor] ?? page.url, progress: 0 })
}

export const goForward = (): void => {
  if (!canGoForward()) return
  const page = currentPage()
  const cursor = page.cursor + 1
  replace(index(), { cursor, url: page.history[cursor] ?? page.url, progress: 0 })
}

export const reload = (): void => replace(index(), { progress: 0 })

export const resolveEntry = (raw: string): string => {
  const value = raw.trim()
  if (value.length === 0) return BlankPage
  if (/^https?:\/\//i.test(value)) return value
  return `https://${value}`
}

const WikipediaSearch = 'https://en.wikipedia.org/w/index.php?search='
const GoogleSearch = 'http://www.google.com/search?q='

export const searchURL = (query: string): string =>
  `${transport() === 'proxy' ? GoogleSearch : WikipediaSearch}${encodeURIComponent(query)}`

const isSearchURL = (url: string): boolean =>
  url.startsWith(WikipediaSearch) || url.startsWith(GoogleSearch)

export const frameURL = (url: string): string => {
  if (!/^https?:\/\//i.test(url)) return 'about:blank'
  const target = uiWebViewTimeTravel() && !isSearchURL(url) ? archivedURL(url) : url
  if (transport() === 'direct') return target
  return `${ProxyOrigin}/proxy?url=${encodeURIComponent(target)}`
}

const ProxyPrefix = `${ProxyOrigin}/proxy?url=`

export const reportedURL = (url: string): string => {
  if (!url.startsWith(ProxyPrefix)) return originalURL(url)
  try {
    return originalURL(decodeURIComponent(url.slice(ProxyPrefix.length)))
  } catch {
    return url
  }
}

export const useDirectTransport = (): void => {
  setTransport('direct')
}

export const probeProxy = async (): Promise<void> => {
  try {
    const response = await fetch(`${ProxyOrigin}/health`, { signal: AbortSignal.timeout(2500) })
    setTransport(response.ok ? 'proxy' : 'direct')
  } catch {
    setTransport('direct')
  }
}

const SeedBookmarks: Record<string, string> = {
  'http://www.apple.com/': 'Apple',
  'http://www.yahoo.com/': 'Yahoo!',
  'http://www.google.com/': 'Google',
  'http://en.wikipedia.org/': 'Wikipedia',
  'http://www.youtube.com/': 'YouTube',
  'http://www.facebook.com/': 'Facebook',
  'http://twitter.com/': 'Twitter',
  'http://www.nytimes.com/': 'The New York Times'
}

const storedBookmarks = NSUserDefaults.object<Record<string, string>>(BookmarksKey)

const [bookmarks, setBookmarks] = createSignal<Record<string, string>>(
  storedBookmarks ?? SeedBookmarks
)

export const webBookmarks = bookmarks

export const isBlank = (url: string): boolean => url === BlankPage || url.length === 0

export const addBookmark = (url: string, title: string): void => {
  const next = { ...bookmarks(), [url]: title }
  setBookmarks(next)
  NSUserDefaults.setObject(BookmarksKey, next)
}

export const removeBookmark = (url: string): void => {
  const next = { ...bookmarks() }
  delete next[url]
  setBookmarks(next)
  NSUserDefaults.setObject(BookmarksKey, next)
}
