import { createSignal } from 'solid-js'
import { NSUserDefaults } from 'NSUserDefaults'

export interface WeatherLocation {
  readonly id: string
  readonly name: string
  readonly latitude: number
  readonly longitude: number
}

export interface WeatherDay {
  readonly weatherCode: number
  readonly maxTemp: number
  readonly minTemp: number
}

export interface WeatherReading {
  readonly currentTemp: number
  readonly currentCode: number
  readonly isDay: boolean
  readonly daily: readonly WeatherDay[]
  readonly updated: string
}

const DefaultLocations: readonly WeatherLocation[] = [
  { id: 'istanbul', name: 'Istanbul', latitude: 41.0082, longitude: 28.9784 },
  { id: 'ankara', name: 'Ankara', latitude: 39.9334, longitude: 32.8597 },
  { id: 'los-angeles', name: 'Los Angeles', latitude: 34.0522, longitude: -118.2437 },
  { id: 'california', name: 'California', latitude: 36.7783, longitude: -119.4179 },
  { id: 'paris', name: 'Paris', latitude: 48.8566, longitude: 2.3522 }
]

const Endpoint = 'https://api.open-meteo.com/v1/forecast'
const ForecastDays = 6

interface OpenMeteoResponse {
  readonly current?: {
    readonly temperature_2m?: number
    readonly weather_code?: number
    readonly is_day?: number
  }
  readonly daily?: {
    readonly weather_code?: readonly number[]
    readonly temperature_2m_max?: readonly number[]
    readonly temperature_2m_min?: readonly number[]
  }
}

const [readings, setReadings] = createSignal<Record<string, WeatherReading>>({})

export const weatherReadings = readings

export const updatedLabel = (date: Date): string => {
  const time = date
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    .toUpperCase()
  return `Updated ${time}`
}

export const loadWeather = async (location: WeatherLocation): Promise<void> => {
  const query = new URLSearchParams({
    latitude: `${location.latitude}`,
    longitude: `${location.longitude}`,
    current: 'temperature_2m,weather_code,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    temperature_unit: unit() === 'metric' ? 'celsius' : 'fahrenheit',
    timezone: 'auto',
    forecast_days: `${ForecastDays}`
  })

  const response = await fetch(`${Endpoint}?${query.toString()}`)
  if (!response.ok) return
  const payload = (await response.json()) as OpenMeteoResponse

  const codes = payload.daily?.weather_code ?? []
  const highs = payload.daily?.temperature_2m_max ?? []
  const lows = payload.daily?.temperature_2m_min ?? []

  const daily: WeatherDay[] = codes.map((code, index) => ({
    weatherCode: code,
    maxTemp: highs[index] ?? 0,
    minTemp: lows[index] ?? 0
  }))

  setReadings({
    ...readings(),
    [location.id]: {
      currentTemp: payload.current?.temperature_2m ?? 0,
      currentCode: payload.current?.weather_code ?? 0,
      isDay: (payload.current?.is_day ?? 1) === 1,
      daily,
      updated: updatedLabel(new Date())
    }
  })
}

export const loadAllWeather = async (): Promise<void> => {
  await Promise.all(locations().map((location) => loadWeather(location)))
}

export type WeatherUnit = 'imperial' | 'metric'

const GeocodingEndpoint = 'https://geocoding-api.open-meteo.com/v1/search'
const SearchCount = 10

interface GeocodingResult {
  readonly id: number
  readonly name: string
  readonly latitude: number
  readonly longitude: number
  readonly country?: string
}

export const searchLocations = async (query: string): Promise<readonly WeatherLocation[]> => {
  const params = new URLSearchParams({
    name: query,
    count: `${SearchCount}`,
    language: 'en',
    format: 'json'
  })
  const response = await fetch(`${GeocodingEndpoint}?${params.toString()}`)
  if (!response.ok) return []
  const payload = (await response.json()) as { results?: readonly GeocodingResult[] }
  return (payload.results ?? []).map((entry) => ({
    id: `${entry.id}`,
    name: entry.country ? `${entry.name}, ${entry.country}` : entry.name,
    latitude: entry.latitude,
    longitude: entry.longitude
  }))
}

const CitiesKey = 'weather_cities'
const ModeKey = 'weather_mode'

const storedLocations = NSUserDefaults.object<WeatherLocation[]>(CitiesKey)
const storedMode = NSUserDefaults.string(ModeKey)

const [locations, setLocations] = createSignal<readonly WeatherLocation[]>(
  storedLocations && storedLocations.length > 0 ? storedLocations : DefaultLocations
)

const [unit, setUnitSignal] = createSignal<WeatherUnit>(
  storedMode === 'metric' ? 'metric' : 'imperial'
)

export const weatherLocations = locations
export const weatherUnit = unit

export const setWeatherUnit = (next: WeatherUnit): void => {
  setUnitSignal(next)
  NSUserDefaults.setString(ModeKey, next)
  void loadAllWeather()
}

export const addWeatherLocation = (location: WeatherLocation): void => {
  if (locations().some((entry) => entry.id === location.id)) return
  const next = [...locations(), location]
  setLocations(next)
  NSUserDefaults.setObject(CitiesKey, next)
  void loadWeather(location)
}

export const removeWeatherLocation = (id: string): void => {
  const next = locations().filter((entry) => entry.id !== id)
  if (next.length === 0) return
  setLocations(next)
  NSUserDefaults.setObject(CitiesKey, next)
}
