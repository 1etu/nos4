import { Assets, type AssetName } from '../Generated/Assets.gen'

export const assetURL = (name: AssetName): string => `${import.meta.env.BASE_URL}${Assets[name]}`
