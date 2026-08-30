import { createSignal } from 'solid-js'
import { NSUserDefaults } from 'NSUserDefaults'

export interface ClockCity {
  readonly id: string
  readonly name: string
  readonly zone: string
}

const StorageKey = 'worldclock_cities'

export const WorldCities: readonly ClockCity[] = [
  { id: 'abu-dhabi', name: 'Abu Dhabi', zone: 'Asia/Dubai' },
  { id: 'amsterdam', name: 'Amsterdam', zone: 'Europe/Amsterdam' },
  { id: 'athens', name: 'Athens', zone: 'Europe/Athens' },
  { id: 'auckland', name: 'Auckland', zone: 'Pacific/Auckland' },
  { id: 'bangkok', name: 'Bangkok', zone: 'Asia/Bangkok' },
  { id: 'berlin', name: 'Berlin', zone: 'Europe/Berlin' },
  { id: 'buenos-aires', name: 'Buenos Aires', zone: 'America/Argentina/Buenos_Aires' },
  { id: 'cairo', name: 'Cairo', zone: 'Africa/Cairo' },
  { id: 'chicago', name: 'Chicago', zone: 'America/Chicago' },
  { id: 'cupertino', name: 'Cupertino', zone: 'America/Los_Angeles' },
  { id: 'denver', name: 'Denver', zone: 'America/Denver' },
  { id: 'dublin', name: 'Dublin', zone: 'Europe/Dublin' },
  { id: 'hong-kong', name: 'Hong Kong', zone: 'Asia/Hong_Kong' },
  { id: 'honolulu', name: 'Honolulu', zone: 'Pacific/Honolulu' },
  { id: 'istanbul', name: 'Istanbul', zone: 'Europe/Istanbul' },
  { id: 'johannesburg', name: 'Johannesburg', zone: 'Africa/Johannesburg' },
  { id: 'lagos', name: 'Lagos', zone: 'Africa/Lagos' },
  { id: 'london', name: 'London', zone: 'Europe/London' },
  { id: 'madrid', name: 'Madrid', zone: 'Europe/Madrid' },
  { id: 'mexico-city', name: 'Mexico City', zone: 'America/Mexico_City' },
  { id: 'moscow', name: 'Moscow', zone: 'Europe/Moscow' },
  { id: 'mumbai', name: 'Mumbai', zone: 'Asia/Kolkata' },
  { id: 'new-york', name: 'New York', zone: 'America/New_York' },
  { id: 'paris', name: 'Paris', zone: 'Europe/Paris' },
  { id: 'reykjavik', name: 'Reykjavik', zone: 'Atlantic/Reykjavik' },
  { id: 'rio', name: 'Rio de Janeiro', zone: 'America/Sao_Paulo' },
  { id: 'rome', name: 'Rome', zone: 'Europe/Rome' },
  { id: 'san-francisco', name: 'San Francisco', zone: 'America/Los_Angeles' },
  { id: 'seoul', name: 'Seoul', zone: 'Asia/Seoul' },
  { id: 'singapore', name: 'Singapore', zone: 'Asia/Singapore' },
  { id: 'stockholm', name: 'Stockholm', zone: 'Europe/Stockholm' },
  { id: 'sydney', name: 'Sydney', zone: 'Australia/Sydney' },
  { id: 'tokyo', name: 'Tokyo', zone: 'Asia/Tokyo' },
  { id: 'toronto', name: 'Toronto', zone: 'America/Toronto' },
  { id: 'vancouver', name: 'Vancouver', zone: 'America/Vancouver' }
]

const DefaultCityIds: readonly string[] = ['mumbai', 'london', 'tokyo', 'honolulu']

const cityById = new Map(WorldCities.map((city) => [city.id, city]))

const restore = (): ClockCity[] => {
  const stored = NSUserDefaults.object<string[]>(StorageKey) ?? [...DefaultCityIds]
  return stored
    .map((id) => cityById.get(id))
    .filter((city): city is ClockCity => city !== undefined)
}

const [cities, setCities] = createSignal<ClockCity[]>(restore())

export const worldClockCities = cities

const persist = (next: ClockCity[]): void => {
  setCities(next)
  NSUserDefaults.setObject(
    StorageKey,
    next.map((city) => city.id)
  )
}

export const addWorldClockCity = (city: ClockCity): void => {
  if (cities().some((entry) => entry.id === city.id)) return
  persist([...cities(), city])
}

export const removeWorldClockCity = (id: string): void => {
  persist(cities().filter((entry) => entry.id !== id))
}
