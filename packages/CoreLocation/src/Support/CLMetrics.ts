export const CLLocationMetrics = {
  earthRadiusMetres: 6378137,
  fixTimeoutMilliseconds: 12000,
  fixMaximumAgeMilliseconds: 15000,
  geocodeTimeoutMilliseconds: 8000,
  geocodeResultLimit: 12,
  distanceFilterMetres: 8,
  degreesPerRadian: 180 / Math.PI,
  fallbackAccuracyMetres: 65
} as const

export const CLLocationEndpoint = {
  forward: 'https://nominatim.openstreetmap.org/search',
  reverse: 'https://nominatim.openstreetmap.org/reverse'
} as const
