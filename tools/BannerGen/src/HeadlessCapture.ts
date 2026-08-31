import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { BannerMetrics } from './BannerMetrics.ts'

const ChromeCandidates: readonly string[] = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
]

interface DebuggerTarget {
  readonly type: string
  readonly webSocketDebuggerUrl: string
}

interface DebuggerReply {
  readonly id?: number
  readonly result?: { readonly result?: { readonly value?: string } }
}

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const chromeBinary = (): string => {
  const override = process.env.NOS4_CHROME
  if (override) return override
  const found = ChromeCandidates.find((candidate) => existsSync(candidate))
  if (!found) throw new Error('no chrome binary found; set NOS4_CHROME')
  return found
}

const pageTarget = async (): Promise<string> => {
  const deadline = Date.now() + BannerMetrics.launchTimeoutMilliseconds
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${BannerMetrics.debuggerPort}/json/list`)
      const targets = (await response.json()) as readonly DebuggerTarget[]
      const page = targets.find((target) => target.type === 'page')
      if (page) return page.webSocketDebuggerUrl
    } catch {
      await wait(BannerMetrics.pollIntervalMilliseconds)
      continue
    }
    await wait(BannerMetrics.pollIntervalMilliseconds)
  }
  throw new Error('chrome did not expose a debugging target')
}

export const captureBanner = async (
  documentUrl: string,
  expression: string
): Promise<string> => {
  const profile = mkdtempSync(join(tmpdir(), 'nos4banner-'))
  const chrome = spawn(
    chromeBinary(),
    [
      '--headless=new',
      `--remote-debugging-port=${BannerMetrics.debuggerPort}`,
      '--no-first-run',
      '--disable-gpu',
      '--hide-scrollbars',
      '--allow-file-access-from-files',
      `--user-data-dir=${profile}`,
      'about:blank'
    ],
    { stdio: 'ignore' }
  )

  try {
    const socket = new WebSocket(await pageTarget())
    await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }))

    let sequence = 0
    const pending = new Map<number, (reply: DebuggerReply) => void>()

    socket.addEventListener('message', (event: MessageEvent) => {
      const reply = JSON.parse(String(event.data)) as DebuggerReply
      if (reply.id === undefined) return
      const settle = pending.get(reply.id)
      if (!settle) return
      pending.delete(reply.id)
      settle(reply)
    })

    const send = (method: string, params: object): Promise<DebuggerReply> => {
      sequence += 1
      const id = sequence
      socket.send(JSON.stringify({ id, method, params }))
      return new Promise((resolve) => pending.set(id, resolve))
    }

    await send('Page.enable', {})
    await send('Runtime.enable', {})
    await send('Page.navigate', { url: documentUrl })
    await wait(BannerMetrics.pollIntervalMilliseconds)

    const reply = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    })

    socket.close()
    const value = reply.result?.result?.value
    if (!value) throw new Error('the page returned no image')
    return value
  } finally {
    chrome.kill()
  }
}
