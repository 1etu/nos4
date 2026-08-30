import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const Port = Number(process.env.NOS4_PROXY_PORT ?? 5174)
const Host = '127.0.0.1'
const UserAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'

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

const errorPage = (target: string, reason: string): string => `<!doctype html>
<html><head><meta charset="utf-8"><title>Cannot Open Page</title>
<style>
  html,body{margin:0;height:100%;background:#5d6367;color:#fff;
    font:400 15px/1.45 'Helvetica Neue',Helvetica,Arial,sans-serif;
    display:flex;align-items:center;justify-content:center}
  .card{max-width:280px;padding:22px;text-align:center}
  h1{margin:0 0 10px;font-size:19px;font-weight:700}
  p{margin:0;opacity:.72;word-break:break-all}
</style></head>
<body><div class="card"><h1>Cannot Open Page</h1>
<p>${escapeHtml(reason)}</p><p style="margin-top:10px">${escapeHtml(target)}</p></div>
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

  const target = url.searchParams.get('url') ?? ''
  if (!/^https?:\/\//i.test(target)) {
    response.writeHead(400, { 'content-type': 'text/html; charset=utf-8' })
    response.end(errorPage(target, 'The address is not a valid web address.'))
    return
  }

  try {
    const upstream = await fetch(target, {
      redirect: 'follow',
      headers: {
        'user-agent': UserAgent,
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9'
      },
      signal: AbortSignal.timeout(20000)
    })

    const type = upstream.headers.get('content-type') ?? 'application/octet-stream'
    const headers: Record<string, string> = {}
    upstream.headers.forEach((value, key) => {
      if (!StrippedHeaders.has(key.toLowerCase())) headers[key] = value
    })
    headers['access-control-allow-origin'] = '*'
    headers['x-nos4-final-url'] = upstream.url

    if (!type.includes('text/html')) {
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
    const reason = error instanceof Error ? error.message : 'The server stopped responding.'
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end(errorPage(target, reason))
  }
}

createServer((request, response) => {
  void handle(request, response)
}).listen(Port, Host, () => {
  process.stdout.write(`web proxy listening on http://${Host}:${Port}/proxy?url=\n`)
})
