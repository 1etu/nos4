const ShellWidth = 1182
const ShellHeight = 2144
const CutoutX = 202
const CutoutY = 377
const CutoutWidth = 764
const CutoutHeight = 1356
const ButtonCenterX = 582
const ButtonCenterY = 1858
const ButtonDiameter = 174
const RingerTop = 368
const RingerHeight = 84
const VolumeUpTop = 546
const VolumeDownTop = 703
const VolumeHeight = 66
const SideButtonLeft = 128
const SideButtonWidth = 26
const PowerLeft = 735
const PowerWidth = 145
const PowerTop = 101
const PowerHeight = 30
const PortWidth = 150
const PortHeight = 44
const PortBottom = 2008
const StageWidth = 390

export const DeviceMetrics = {
  stageWidth: StageWidth,
  stageHeight: Math.round((StageWidth * CutoutHeight) / CutoutWidth),
  contentInsetX: 16,
  statusBarHeight: 24,
  homeButtonRestScale: 0.93,
  homeButtonPressedScale: 0.9,
  doublePressWindow: 300,
  screenFadeDuration: 0.28
} as const

const shellScale = DeviceMetrics.stageWidth / CutoutWidth

export const DeviceShell = {
  width: ShellWidth * shellScale,
  height: ShellHeight * shellScale,
  cutoutLeft: CutoutX * shellScale,
  cutoutTop: CutoutY * shellScale,
  buttonLeft: (ButtonCenterX - ButtonDiameter / 2) * shellScale,
  buttonTop: (ButtonCenterY - ButtonDiameter / 2) * shellScale,
  buttonSize: ButtonDiameter * shellScale,
  sideButtonLeft: SideButtonLeft * shellScale,
  sideButtonWidth: SideButtonWidth * shellScale,
  ringerTop: RingerTop * shellScale,
  ringerHeight: RingerHeight * shellScale,
  volumeUpTop: VolumeUpTop * shellScale,
  volumeDownTop: VolumeDownTop * shellScale,
  volumeHeight: VolumeHeight * shellScale,
  powerLeft: PowerLeft * shellScale,
  powerWidth: PowerWidth * shellScale,
  powerTop: PowerTop * shellScale,
  powerHeight: PowerHeight * shellScale,
  portLeft: (ButtonCenterX - PortWidth / 2) * shellScale,
  portTop: (PortBottom - PortHeight) * shellScale,
  portWidth: PortWidth * shellScale,
  portHeight: PortHeight * shellScale
} as const

export const DeviceShellBody = {
  left: 0.1066,
  top: 0.04618,
  right: 0.8714,
  bottom: 0.93703
} as const

export const DeviceContentWidth = DeviceMetrics.stageWidth - DeviceMetrics.contentInsetX * 2
export const DeviceContentHeight = DeviceMetrics.stageHeight
