export const AVPlaybackState = {
  stopped: 'M_IPOD_MSC_STOPPED',
  loading: 'M_IPOD_MSC_LOADING',
  playing: 'M_IPOD_MSC_PLAYING',
  paused: 'M_IPOD_MSC_PAUSED',
  blocked: 'M_IPOD_MSC_BLOCKED',
  missing: 'M_IPOD_MSC_MISSING',
  failed: 'M_IPOD_MSC_FAILED'
} as const

export type AVPlaybackStateValue = (typeof AVPlaybackState)[keyof typeof AVPlaybackState]

export const AVSessionState = {
  inactive: 'M_AUD_SES_INACTIVE',
  pending: 'M_AUD_SES_PENDING',
  active: 'M_AUD_SES_ACTIVE',
  denied: 'M_AUD_SES_DENIED',
  unsupported: 'M_AUD_SES_UNSUPPORTED'
} as const

export type AVSessionStateValue = (typeof AVSessionState)[keyof typeof AVSessionState]

export const AVAudioSessionCategory = {
  ambient: 'M_AUD_CAT_AMBIENT',
  playback: 'M_AUD_CAT_PLAYBACK'
} as const

export type AVAudioSessionCategoryValue =
  (typeof AVAudioSessionCategory)[keyof typeof AVAudioSessionCategory]

export const AVSystemSound = {
  keyTock: 'M_SND_KEY_TOCK',
  unlock: 'M_SND_UNLOCK',
  videoBegin: 'M_SND_VIDEO_BEGIN',
  videoEnd: 'M_SND_VIDEO_END',
  dtmf0: 'M_SND_DTMF_0',
  dtmf1: 'M_SND_DTMF_1',
  dtmf2: 'M_SND_DTMF_2',
  dtmf3: 'M_SND_DTMF_3',
  dtmf4: 'M_SND_DTMF_4',
  dtmf5: 'M_SND_DTMF_5',
  dtmf6: 'M_SND_DTMF_6',
  dtmf7: 'M_SND_DTMF_7',
  dtmf8: 'M_SND_DTMF_8',
  dtmf9: 'M_SND_DTMF_9',
  dtmfStar: 'M_SND_DTMF_STAR',
  dtmfPound: 'M_SND_DTMF_POUND'
} as const

export type AVSystemSoundValue = (typeof AVSystemSound)[keyof typeof AVSystemSound]
