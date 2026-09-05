import {
  MobileHosts,
  bareHost,
  isMobileHost
} from '../../../packages/MobileSafari/src/Support/SafariTimeTravel.ts'

const AvailabilityEndpoint = 'https://archive.org/wayback/available'
const EraStart = '20100101'
const EraEnd = '20121231'
const LookupTimeout = 8000

interface Availability {
  readonly archived_snapshots?: {
    readonly closest?: {
      readonly timestamp?: string
      readonly status?: string
    }
  }
}

const cache = new Map<string, string | undefined>()

const capturedInEra = async (host: string, timestamp: string): Promise<boolean> => {
  const query = `url=${encodeURIComponent(host)}&timestamp=${timestamp}`
  const response = await fetch(`${AvailabilityEndpoint}?${query}`, {
    signal: AbortSignal.timeout(LookupTimeout)
  })
  if (!response.ok) return false
  const closest = ((await response.json()) as Availability).archived_snapshots?.closest
  if (!closest?.timestamp || closest.status !== '200') return false
  return closest.timestamp >= EraStart && closest.timestamp <= EraEnd
}

export const mobileHostFor = async (
  host: string,
  timestamp: string
): Promise<string | undefined> => {
  const bare = bareHost(host)
  if (isMobileHost(bare) || MobileHosts[bare]) return undefined
  if (cache.has(bare)) return cache.get(bare)
  const candidate = `m.${bare}`
  let found: string | undefined
  try {
    if (await capturedInEra(candidate, timestamp)) found = candidate
  } catch {
    found = undefined
  }
  cache.set(bare, found)
  return found
}
