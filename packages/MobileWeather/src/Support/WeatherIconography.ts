import type { AssetName } from 'CoreGraphics'

export const iconCode = (code: number | undefined, isDay: boolean): string => {
  if (code === undefined) return ''
  const suffix = isDay ? 'd' : 'n'
  if (code === 0) return `01${suffix}`
  if (code === 1 || code === 2) return `02${suffix}`
  if (code === 3) return `03${suffix}`
  if (code === 45 || code === 48) return `50${suffix}`
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return `10${suffix}`
  if ([71, 73, 75, 77, 85, 86].includes(code)) return `13${suffix}`
  if ([95, 96, 99].includes(code)) return `11${suffix}`
  return `50${suffix}`
}

const dayImages: Record<string, string> = {
  '01d': 'sun',
  '02d': 'partly_cloudy',
  '03d': 'cloudy',
  '04d': 'partly_cloudy',
  '09d': 'rain_clouds',
  '10d': 'rain',
  '11d': 'lightning',
  '13d': 'snow',
  '50d': 'fog'
}

export const iconAsset = (code: string, mini: boolean): AssetName => {
  if (code.includes('n')) return 'moon'
  const key = dayImages[code] ?? 'fog'
  return (mini ? `weather_mini_${key}` : `weather_${key}`) as AssetName
}

const dayOffsets: Record<string, number> = {
  '01d': 0,
  '02d': 0,
  '03d': 20,
  '04d': 0,
  '09d': 15,
  '10d': 22.5,
  '11d': 25,
  '13d': 10,
  '50d': 15
}

export const iconOffset = (code: string): number => {
  if (code.includes('n')) return 40
  if (!code.includes('d')) return 0
  return dayOffsets[code] ?? 15
}
