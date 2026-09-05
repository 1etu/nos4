import { CKPhotoProfile, ckApplyPhotoEffect } from '../Processing/CKPhotoEffect'

export const ckCapturePhoto = async (video: HTMLVideoElement): Promise<Blob> => {
  if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
    throw new Error('Wait for the camera preview.')
  }
  const scale = Math.min(1, CKPhotoProfile.maximumDimension / Math.max(video.videoWidth, video.videoHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Photo capture is unavailable.')
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  const frame = context.getImageData(0, 0, canvas.width, canvas.height)
  frame.data.set(ckApplyPhotoEffect(frame.data, frame.width, frame.height))
  context.putImageData(frame, 0, 0)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('The photo could not be saved.'))
    }, 'image/jpeg', CKPhotoProfile.jpegQuality)
  })
}
