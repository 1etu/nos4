import { assetURL } from './AssetURL'
import type { AssetName } from '../Generated/Assets.gen'

const warmed = new Set<string>()

const warmOne = (source: string): void => {
  if (warmed.has(source)) return
  warmed.add(source)
  const image = new Image()
  image.decoding = 'async'
  image.src = source
  if (typeof image.decode === 'function') void image.decode().catch(() => undefined)
}

export const cgWarmAssets = (names: readonly AssetName[]): void => {
  if (typeof Image === 'undefined') return
  for (const name of names) warmOne(assetURL(name))
}

export const cgWarmURLs = (sources: readonly string[]): void => {
  if (typeof Image === 'undefined') return
  for (const source of sources) warmOne(source)
}
