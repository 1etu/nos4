import { createMemo } from 'solid-js'
import { ckPhotoLibrary, ckDownloadAsset } from 'CameraKit'

export interface PHAsset {
  readonly id: string
  readonly mediaType: 'image' | 'video'
  readonly path: string
  readonly url?: string
  readonly duration: number
}

const seed: readonly PHAsset[] = [
  { id: 'photo-1', mediaType: 'image', path: 'media/photo-1.jpg', duration: 0 },
  { id: 'photo-2', mediaType: 'image', path: 'media/photo-2.jpg', duration: 0 },
  { id: 'video-1', mediaType: 'video', path: 'media/video-1.mp4', duration: 10 },
  { id: 'photo-3', mediaType: 'image', path: 'media/photo-3.jpg', duration: 0 },
  { id: 'video-2', mediaType: 'video', path: 'media/video-2.mp4', duration: 10 }
]

const library = createMemo<readonly PHAsset[]>(() => [
  ...seed,
  ...ckPhotoLibrary().map((asset) => ({ ...asset, path: '' }))
])

export const photoLibrary = library

export const photoCount = (): number =>
  library().filter((asset) => asset.mediaType === 'image').length

export const videoCount = (): number =>
  library().filter((asset) => asset.mediaType === 'video').length

export const lastImage = (): PHAsset | undefined =>
  [...library()].reverse().find((asset) => asset.mediaType === 'image')

export const downloadAsset = (asset: PHAsset): void => {
  const captured = ckPhotoLibrary().find((entry) => entry.id === asset.id)
  const extension = asset.mediaType === 'image' ? 'jpg' : captured?.blob.type.includes('webm') ? 'webm' : 'mp4'
  ckDownloadAsset(mediaURL(asset), `IMG_${asset.id}.${extension}`)
}

export const mediaURL = (asset: PHAsset): string =>
  asset.url ?? `${import.meta.env.BASE_URL}${asset.path}`

export const durationLabel = (seconds: number): string => {
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = Math.floor(seconds % 60)
  return `${minutes}:${remainder < 10 ? '0' : ''}${remainder}`
}
