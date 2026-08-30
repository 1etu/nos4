import { assetPointSize, assetURL, type AssetName } from 'CoreGraphics'

export const gkTile = (name: AssetName): string => {
  const size = assetPointSize(name)
  return `url(${assetURL(name)}) repeat top left / ${size.width}px ${size.height}px`
}

export const gkTexturedText = (name: AssetName) => {
  const size = assetPointSize(name)
  return {
    'background-image': `url(${assetURL(name)})`,
    'background-repeat': 'repeat',
    'background-size': `${size.width}px ${size.height}px`,
    '-webkit-background-clip': 'text',
    'background-clip': 'text',
    color: 'transparent'
  } as const
}

export const gkCover = (name: AssetName): string =>
  `url(${assetURL(name)}) no-repeat center / cover`
