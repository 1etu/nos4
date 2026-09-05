const ResultsEndpoint = 'https://www.bing.com/search'
const SearchTimeout = 15000
const MaxResults = 10

export const GoogleSearchPath = 'http://www.google.com/search'
export const GoogleHomePath = 'http://www.google.com/m'

interface SearchResult {
  readonly url: string
  readonly title: string
  readonly snippet: string
}

const decodeEntities = (value: string): string =>
  value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')

const stripTags = (value: string): string => decodeEntities(value.replace(/<[^>]+>/g, '')).trim()

export const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const unwrapRedirect = (href: string): string => {
  const link = decodeEntities(href)
  try {
    const parsed = new URL(link)
    const packed = parsed.searchParams.get('u')
    if (parsed.hostname.endsWith('bing.com') && packed?.startsWith('a1')) {
      return Buffer.from(packed.slice(2), 'base64url').toString('utf8')
    }
    return link
  } catch {
    return link
  }
}

const parseResults = (html: string): SearchResult[] => {
  const results: SearchResult[] = []
  for (const match of html.matchAll(/<li class="b_algo"[\s\S]*?<\/li>/g)) {
    const item = match[0]
    const anchor = /<h2[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/.exec(item)
    if (!anchor?.[1] || !anchor[2]) continue
    const url = unwrapRedirect(anchor[1])
    if (!/^https?:\/\//i.test(url)) continue
    const snippet = /<p[^>]*>([\s\S]*?)<\/p>/.exec(item)?.[1] ?? ''
    results.push({ url, title: stripTags(anchor[2]), snippet: stripTags(snippet) })
    if (results.length >= MaxResults) break
  }
  return results
}

export const fetchResults = async (query: string, userAgent: string): Promise<SearchResult[]> => {
  const params = new URLSearchParams({ q: query, setlang: 'en', cc: 'US' })
  const response = await fetch(`${ResultsEndpoint}?${params.toString()}`, {
    headers: { 'user-agent': userAgent, 'accept-language': 'en-US,en;q=0.9' },
    signal: AbortSignal.timeout(SearchTimeout)
  })
  if (!response.ok) return []
  return parseResults(await response.text())
}

const displayURL = (url: string): string => {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname === '/' ? '' : parsed.pathname
    return `${parsed.hostname}${path}`.slice(0, 60)
  } catch {
    return url
  }
}

const logo = `<span class="logo"><b style="color:#3369e8">G</b><b style="color:#d50f25">o</b><b style="color:#eeb211">o</b><b style="color:#3369e8">g</b><b style="color:#009925">l</b><b style="color:#d50f25">e</b></span>`

const resultRow = (result: SearchResult): string => `<div class="r">
  <a href="${escapeHtml(result.url)}">${escapeHtml(result.title)}</a>
  <div class="s">${escapeHtml(result.snippet)}</div>
  <cite>${escapeHtml(displayURL(result.url))}</cite>
</div>`

export const searchPage = (query: string, results: readonly SearchResult[], bridge: string): string => `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(query)} - Google Search</title>
<base href="${escapeHtml(`${GoogleSearchPath}?q=${encodeURIComponent(query)}`)}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html,body{margin:0;background:#fff}
  body{color:#000;font:15px/1.35 'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%}
  .bar{display:flex;align-items:center;gap:6px;padding:7px 8px;background:#f1f1f1;border-bottom:1px solid #d5d5d5}
  .logo{font:700 24px/1 'Times New Roman',Times,serif;letter-spacing:-1.5px;padding-right:2px}
  .bar input{flex:1;min-width:0;font-size:16px;padding:5px 6px;border:1px solid #b9b9b9;border-radius:3px;
    box-shadow:inset 0 1px 2px rgba(0,0,0,0.15)}
  .bar button{font-size:14px;padding:6px 10px;border:1px solid #8f8f8f;border-radius:3px;color:#222;
    background:linear-gradient(#fdfdfd,#d9d9d9)}
  .stats{padding:7px 8px;color:#666;font-size:12px;border-bottom:1px solid #e8e8e8}
  .r{padding:9px 8px 10px;border-bottom:1px solid #e5e5e5}
  .r a{color:#1111cc;text-decoration:underline;font-size:16px;line-height:1.25}
  .r .s{color:#333;font-size:13px;margin-top:3px}
  .r cite{display:block;color:#0e774a;font-style:normal;font-size:12px;margin-top:3px;word-break:break-all}
  .empty{padding:16px 8px;color:#333}
  .foot{padding:16px 8px 24px;text-align:center;font-size:12px;color:#666}
  .foot a{color:#1111cc}
</style></head>
<body>
<form class="bar" action="${GoogleSearchPath}" method="get">
  ${logo}
  <input type="text" name="q" value="${escapeHtml(query)}" autocapitalize="off" autocorrect="off">
  <button type="submit">Search</button>
</form>
<div class="stats">Web results for <b>${escapeHtml(query)}</b></div>
${results.length > 0 ? results.map(resultRow).join('\n') : `<div class="empty">Your search - <b>${escapeHtml(query)}</b> - did not match any documents.</div>`}
<div class="foot"><a href="${GoogleHomePath}">Google Home</a> &middot; Google.com in English<br>&copy;2011 Google</div>
<script>${bridge}</script></body></html>`

export const searchQueryFor = (original: string): string | undefined => {
  try {
    const parsed = new URL(original)
    if (!/(^|\.)google\.com$/i.test(parsed.hostname)) return undefined
    if (!['/search', '/m', '/m/search', '/xhtml'].includes(parsed.pathname)) return undefined
    const query = parsed.searchParams.get('q')?.trim()
    return query && query.length > 0 ? query : undefined
  } catch {
    return undefined
  }
}
