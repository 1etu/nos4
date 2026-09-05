import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  SafariTimeTravel,
  originalURL
} from '../../../packages/MobileSafari/src/Support/SafariTimeTravel.ts'
import { mobileHostFor } from './mobile.ts'
import { fetchResults, searchPage, searchQueryFor } from './search.ts'

const Port = Number(process.env.NOS4_PROXY_PORT ?? 5174)
const Host = '127.0.0.1'
const UserAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'

const UpstreamTimeout = 30000
const MarkupTypes = ['text/html', 'application/xhtml+xml', 'application/vnd.wap.xhtml+xml']

const isMarkup = (type: string): boolean =>
  MarkupTypes.some((candidate) => type.toLowerCase().includes(candidate))

const StrippedHeaders = new Set([
  'x-frame-options',
  'content-security-policy',
  'content-security-policy-report-only',
  'cross-origin-opener-policy',
  'cross-origin-embedder-policy',
  'content-encoding',
  'content-length',
  'transfer-encoding',
  'connection',
  'strict-transport-security'
])

const here = dirname(fileURLToPath(import.meta.url))
const bridge = readFileSync(join(here, 'bridge.js'), 'utf8')

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

interface Failure {
  readonly title: string
  readonly body: string
}

const quote = (value: string): string => `\u201c${value}\u201d`

const hostOf = (target: string): string => {
  try {
    return new URL(target).host
  } catch {
    return target
  }
}

const cannotConnect = (target: string): Failure => ({
  title: 'Safari can\u2019t connect to the server.',
  body: `Safari can\u2019t open the page ${quote(target)} because Safari can\u2019t connect to the server ${quote(hostOf(target))}.`
})

const notResponding = (target: string): Failure => ({
  title: 'Safari can\u2019t open the page.',
  body: `Safari can\u2019t open the page ${quote(target)} because the server where this page is located isn\u2019t responding.`
})

const invalidAddress = (target: string): Failure => ({
  title: 'Safari can\u2019t open the page.',
  body: `Safari can\u2019t open the page ${quote(target)} because the address isn\u2019t valid.`
})

const describeFailure = (target: string, error: unknown): Failure => {
  const name = error instanceof Error ? error.name : ''
  if (name === 'TimeoutError' || name === 'AbortError') return notResponding(target)
  return cannotConnect(target)
}

const compassGlyph = `<svg class="compass" viewBox="0 0 120 120" aria-hidden="true">
  <defs>
    <linearGradient id="dial" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d9d9d9"/><stop offset="1" stop-color="#c4c4c4"/>
    </linearGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f4f4f4"/><stop offset="1" stop-color="#b9b9b9"/>
    </linearGradient>
    <linearGradient id="needle" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#bdbdbd"/><stop offset="1" stop-color="#9e9e9e"/>
    </linearGradient>
  </defs>
  <g transform="translate(60 8)">
    <rect x="-4.5" y="-8" width="9" height="12" rx="4.5" fill="none" stroke="#b5b5b5" stroke-width="3"/>
    <rect x="-7" y="1" width="14" height="6" rx="2" fill="#c9c9c9" stroke="#adadad" stroke-width="1"/>
  </g>
  <circle cx="60" cy="64" r="52" fill="url(#rim)" stroke="#a9a9a9" stroke-width="1"/>
  <circle cx="60" cy="64" r="46" fill="url(#dial)" stroke="#b1b1b1" stroke-width="1"/>
  <circle cx="60" cy="64" r="46" fill="none" stroke="#ffffff" stroke-opacity="0.6" stroke-width="1" transform="translate(0 1)"/>
  <g class="ticks" stroke="#8f8f8f" stroke-width="1.4">TICKS</g>
  <g fill="#ffffff" fill-opacity="0.85" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="10" font-weight="700" text-anchor="middle">
    <text x="60" y="30">N</text><text x="60" y="105">S</text><text x="24" y="68">W</text><text x="96" y="68">E</text>
  </g>
  <g transform="rotate(-45 60 64)">
    <polygon points="60,22 66,64 60,106 54,64" fill="url(#needle)" stroke="#8d8d8d" stroke-width="0.8"/>
    <polygon points="60,22 66,64 60,64" fill="#ffffff" fill-opacity="0.35"/>
    <polygon points="18,64 60,58 102,64 60,70" fill="#cfcfcf" stroke="#9c9c9c" stroke-width="0.8"/>
  </g>
  <circle cx="60" cy="64" r="4.5" fill="#e8e8e8" stroke="#8d8d8d" stroke-width="1"/>
</svg>`

const compassTicks = (): string => {
  const marks: string[] = []
  for (let i = 0; i < 72; i += 1) {
    const major = i % 6 === 0
    const length = major ? 6 : 3
    marks.push(
      `<line x1="60" y1="${64 - 44}" x2="60" y2="${64 - 44 + length}" transform="rotate(${i * 5} 60 64)"${major ? ' stroke-width="2"' : ''}/>`
    )
  }
  return marks.join('')
}

const compass = compassGlyph.replace('TICKS', compassTicks())

const baseTag = (target: string): string =>
  /^https?:\/\//i.test(target) ? `<base href="${escapeHtml(target)}">` : ''

const errorPage = (target: string, failure: Failure): string => `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(failure.title)}</title>
${baseTag(target)}
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html,body{margin:0;height:100%}
  body{
    background:#e4e4e4 url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.16 0'/></filter><rect width='120' height='120' filter='url(%23n)'/></svg>");
    color:#5c5c5c;
    font:400 13px/1.45 'Lucida Grande','Helvetica Neue',Helvetica,Arial,sans-serif;
    display:flex;align-items:center;justify-content:center;text-align:center;
    -webkit-text-size-adjust:100%
  }
  .card{max-width:340px;padding:24px 20px}
  .compass{width:112px;height:112px;margin:0 auto 14px;display:block;
    filter:drop-shadow(0 1px 0 rgba(255,255,255,0.9))}
  h1{margin:0 0 10px;font-size:17px;font-weight:700;color:#6f6f6f;
    text-shadow:0 1px 0 rgba(255,255,255,0.9);display:inline-flex;align-items:center;gap:8px}
  .help{display:inline-flex;width:18px;height:18px;border-radius:50%;box-sizing:border-box;
    border:1px solid #9a9a9a;background:linear-gradient(#fdfdfd,#d8d8d8);
    color:#6a6a6a;font-size:12px;font-weight:700;line-height:1;align-items:center;justify-content:center;
    box-shadow:0 1px 0 rgba(255,255,255,0.9),inset 0 1px 0 #fff}
  p{margin:0;color:#6a6a6a;text-shadow:0 1px 0 rgba(255,255,255,0.9);word-break:break-word}
</style></head>
<body><div class="card">${compass}
<h1>${escapeHtml(failure.title)} <span class="help">?</span></h1>
<p>${escapeHtml(failure.body)}</p></div>
<script>${bridge}</script></body></html>`

const injectInto = (html: string, finalUrl: string): string => {
  const head = `<base href="${escapeHtml(finalUrl)}">\n<script>${bridge}</script>`
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head([^>]*)>/i, `<head$1>\n${head}`)
  if (/<html[^>]*>/i.test(html)) return html.replace(/<html([^>]*)>/i, `<html$1><head>${head}</head>`)
  return `<head>${head}</head>${html}`
}

const allowCors = (response: ServerResponse): void => {
  response.setHeader('access-control-allow-origin', '*')
  response.setHeader('access-control-allow-headers', '*')
}

const fetchPage = (target: string): Promise<Response> =>
  fetch(target, {
    redirect: 'follow',
    headers: {
      'user-agent': UserAgent,
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.9'
    },
    signal: AbortSignal.timeout(UpstreamTimeout)
  })

const handle = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
  const url = new URL(request.url ?? '/', `http://${Host}:${Port}`)
  allowCors(response)

  if (url.pathname === '/health') {
    response.writeHead(200, { 'content-type': 'text/plain' })
    response.end('ok')
    return
  }

  if (url.pathname !== '/proxy') {
    response.writeHead(404, { 'content-type': 'text/plain' })
    response.end('not found')
    return
  }

  let target = url.searchParams.get('url') ?? ''
  if (!/^https?:\/\//i.test(target)) {
    response.writeHead(400, { 'content-type': 'text/html; charset=utf-8' })
    response.end(errorPage(target, invalidAddress(target)))
    return
  }

  try {
    const original = originalURL(target)
    const archived = original !== target

    const query = searchQueryFor(original)
    if (query !== undefined) {
      const results = await fetchResults(query, UserAgent)
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
      response.end(searchPage(query, results, bridge))
      return
    }

    if (archived) {
      const parsed = new URL(original)
      const mobile = await mobileHostFor(parsed.hostname, SafariTimeTravel.timestamp)
      if (mobile) {
        parsed.hostname = mobile
        target = target.replace(original, parsed.href)
      }
    }

    let upstream = await fetchPage(target)
    if (archived && upstream.status === 404) upstream = await fetchPage(original)

    const type = upstream.headers.get('content-type') ?? 'application/octet-stream'
    const headers: Record<string, string> = {}
    upstream.headers.forEach((value, key) => {
      if (!StrippedHeaders.has(key.toLowerCase())) headers[key] = value
    })
    headers['access-control-allow-origin'] = '*'
    headers['x-nos4-final-url'] = upstream.url

    if (!isMarkup(type)) {
      const buffer = Buffer.from(await upstream.arrayBuffer())
      response.writeHead(upstream.status, headers)
      response.end(buffer)
      return
    }

    const html = await upstream.text()
    const body = injectInto(html, upstream.url)
    headers['content-type'] = 'text/html; charset=utf-8'
    response.writeHead(200, headers)
    response.end(body)
  } catch (error) {
    const original = originalURL(target)
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end(errorPage(original, describeFailure(original, error)))
  }
}

createServer((request, response) => {
  void handle(request, response)
}).listen(Port, Host, () => {
  process.stdout.write(`web proxy listening on http://${Host}:${Port}/proxy?url=\n`)
})
