import { CKPhotoProfile, ckApplyPhotoEffect } from '../Processing/CKPhotoEffect'
import {
  ckBuildExif,
  ckEmbedExif,
  ckEstimateExposure,
  ckMeanLuminance
} from '../Processing/CKPhotoMetadata'

interface Frame {
  readonly sourceX: number
  readonly sourceY: number
  readonly sourceWidth: number
  readonly sourceHeight: number
  readonly width: number
  readonly height: number
}

export const ckPhotoFrame = (videoWidth: number, videoHeight: number): Frame => {
  const aspect = CKPhotoProfile.sensorWidth / CKPhotoProfile.sensorHeight
  let sourceWidth = videoWidth
  let sourceHeight = videoHeight
  if (videoWidth / videoHeight > aspect) sourceWidth = Math.round(videoHeight * aspect)
  else sourceHeight = Math.round(videoWidth / aspect)
  const sourceX = Math.floor((videoWidth - sourceWidth) / 2)
  const sourceY = Math.floor((videoHeight - sourceHeight) / 2)
  const full = sourceWidth >= CKPhotoProfile.upscaleThreshold
  return {
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    width: full ? CKPhotoProfile.sensorWidth : Math.max(1, sourceWidth),
    height: full ? CKPhotoProfile.sensorHeight : Math.max(1, sourceHeight)
  }
}

const encode = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('The photo could not be saved.'))
    }, 'image/jpeg', CKPhotoProfile.jpegQuality)
  })

export const ckCapturePhoto = async (video: HTMLVideoElement): Promise<Blob> => {
  if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
    throw new Error('Wait for the camera preview.')
  }
  const frame = ckPhotoFrame(video.videoWidth, video.videoHeight)
  const canvas = document.createElement('canvas')
  canvas.width = frame.width
  canvas.height = frame.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Photo capture is unavailable.')
  context.imageSmoothingQuality = 'high'
  context.drawImage(
    video,
    frame.sourceX, frame.sourceY, frame.sourceWidth, frame.sourceHeight,
    0, 0, frame.width, frame.height
  )
  const image = context.getImageData(0, 0, frame.width, frame.height)
  image.data.set(ckApplyPhotoEffect(image.data, image.width, image.height))
  context.putImageData(image, 0, 0)
  const exposure = ckEstimateExposure(ckMeanLuminance(image.data))
  const jpeg = new Uint8Array(await (await encode(canvas)).arrayBuffer())
  const exif = ckBuildExif({ width: frame.width, height: frame.height, date: new Date(), exposure })
  return new Blob([ckEmbedExif(jpeg, exif)], { type: 'image/jpeg' })
}
