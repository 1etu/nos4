export const CELRecorderMetrics = {
  minimumVU: -20,
  maximumVU: 5,
  smoothingTau: 0.3,
  referenceOffset: 12,
  silenceFloor: 1e-20,
  stopTimeout: 1500,
  fftSize: 2048,
  sampleRate: 44100,
  channelCount: 1
} as const

export const CELRecorderFormats = [
  'audio/mp4;codecs=mp4a.40.2',
  'audio/mp4',
  'audio/webm;codecs=opus',
  'audio/webm'
] as const
