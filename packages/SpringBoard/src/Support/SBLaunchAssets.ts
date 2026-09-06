import type { AssetName } from 'CoreGraphics'

const VoiceMemos: readonly AssetName[] = [
  'mic',
  'whiteglow',
  'bezel',
  'vu',
  'vumask',
  'needle',
  'record',
  'stop',
  'list',
  'voicememos_pause'
]

const Compass: readonly AssetName[] = [
  'Compass_Background',
  'CompassBezel',
  'CompassFace',
  'CompassFaceRim',
  'CompassFaceHighlight',
  'CompassFaceShadow',
  'CompassFaceDirection',
  'CompassPivot',
  'DeviceArrow'
]

const Notes: readonly AssetName[] = [
  'NotesBody',
  'NotesTopBar',
  'NotesEdgeTop',
  'NotesEdgeBottom',
  'bodyMarginThin_568h',
  'edgeTopMarginThin',
  'gradBottomMarginThin'
]

const Camera: readonly AssetName[] = [
  'PLCameraButtonSilver',
  'PLCameraButtonIcon',
  'PLCameraFlashIcon_2only_',
  'PLCameraSwitchIcon',
  'PLCameraToggle_2x'
]

const iPod: readonly AssetName[] = [
  'NowPlayingTableBackground',
  'NowPlayingFlipperBackground',
  'NowPlayingAlbumInfo',
  'noartplaceholder'
]

export const SBLaunchAssets: Readonly<Record<string, readonly AssetName[]>> = {
  'com.nos4.voicememos': VoiceMemos,
  'com.nos4.compass': Compass,
  'com.nos4.mobilenotes': Notes,
  'com.nos4.mobilecamera': Camera,
  'com.nos4.mobilemusicplayer': iPod
}

export const sbLaunchAssetsFor = (bundleId: string): readonly AssetName[] =>
  SBLaunchAssets[bundleId] ?? []
