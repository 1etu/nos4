import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { GameCenterMetrics } from './Support/GameCenterMetrics.ts'
import { gameCenterHandler } from './Http/GameCenterHandler.ts'

const Port = Number(process.env.NOS4_GAME_CENTER_PORT ?? GameCenterMetrics.defaultPort)
const Host = '127.0.0.1'
const DatabaseUrl = process.env.DATABASE_URL ?? ''
const ConfiguredOrigins = (process.env.NOS4_GAME_CENTER_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0)

const loopbackOrigins = (): string[] => {
  const origins: string[] = []
  const first = GameCenterMetrics.developmentOriginFirstPort
  for (let port = first; port < first + GameCenterMetrics.developmentOriginPortCount; port += 1) {
    origins.push(`http://localhost:${port}`, `http://127.0.0.1:${port}`)
  }
  return origins
}

const AllowedOrigins = ConfiguredOrigins.length > 0 ? ConfiguredOrigins : loopbackOrigins()

if (DatabaseUrl === '') {
  process.stderr.write('DATABASE_URL is not set; put it in the root .env\n')
  process.exit(1)
}

const handle = gameCenterHandler({ databaseUrl: DatabaseUrl, allowedOrigins: AllowedOrigins })

const collect = (message: IncomingMessage): Promise<Buffer> =>
  new Promise((resolve) => {
    const chunks: Buffer[] = []
    let total = 0
    message.on('data', (chunk: Buffer) => {
      total += chunk.length
      if (total <= GameCenterMetrics.maximumRequestBodyBytes) chunks.push(chunk)
    })
    message.on('end', () => resolve(Buffer.concat(chunks)))
  })

const toRequest = async (message: IncomingMessage): Promise<Request> => {
  const headers = new Headers()
  for (const [name, value] of Object.entries(message.headers)) {
    if (typeof value === 'string') headers.set(name, value)
  }
  headers.delete('cf-connecting-ip')
  headers.delete('x-forwarded-for')
  headers.set('cf-connecting-ip', message.socket.remoteAddress ?? Host)

  const method = message.method ?? 'GET'
  const url = `http://${Host}:${Port}${message.url ?? '/'}`
  if (method === 'GET' || method === 'HEAD') return new Request(url, { method, headers })

  const collected = await collect(message)
  return new Request(url, { method, headers, body: collected.toString('utf8') })
}

const respond = async (reply: Response, response: ServerResponse): Promise<void> => {
  const headers: Record<string, string> = {}
  reply.headers.forEach((value, name) => {
    headers[name] = value
  })
  response.writeHead(reply.status, headers)
  const payload = await reply.arrayBuffer()
  response.end(Buffer.from(payload))
}

createServer((message, response) => {
  void toRequest(message)
    .then(handle)
    .then((reply) => respond(reply, response))
}).listen(Port, Host, () => {
  process.stdout.write(`game center service listening on http://${Host}:${Port}\n`)
})
