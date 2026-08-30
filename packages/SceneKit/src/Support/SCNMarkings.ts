import { CanvasTexture, SRGBColorSpace, type Texture } from 'three'

const LegendSize = 512
const MarkSize = 256
const LegendFace = 'ui-sans-serif, system-ui, Arial, sans-serif'
const LegendInk = '#4f4d47'
const LegendScribe = '#d9d5cb'
const MarkInk = '#8d8d90'
const PrimaryText = '16A 250V~'
const SecondaryText = '3500W'
const PrimaryHeight = 15
const SecondaryHeight = 13
const PrimaryRow = 0.775
const SecondaryRow = 0.848
const ScribeRadius = 0.452
const ScribeWidth = 1.6
const GateRadius = 0.026
const GateRow = 0.198
const TridentStroke = 0.055
const TridentTail = 0.075
const TridentSpan = 0.2
const TridentFork = 0.42
const TridentTip = 0.16
const TridentSquare = 0.052

const surface = (size: number): CanvasRenderingContext2D => {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) throw new Error('marking')
  return context
}

const publish = (context: CanvasRenderingContext2D): Texture => {
  const texture = new CanvasTexture(context.canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export const scnMakeSocketLegend = (): Texture => {
  const context = surface(LegendSize)
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, LegendSize, LegendSize)

  context.strokeStyle = LegendScribe
  context.lineWidth = ScribeWidth
  context.beginPath()
  context.arc(LegendSize / 2, LegendSize / 2, LegendSize * ScribeRadius, 0, Math.PI * 2)
  context.stroke()

  context.fillStyle = LegendScribe
  context.beginPath()
  context.arc(LegendSize / 2, LegendSize * GateRow, LegendSize * GateRadius, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = LegendInk
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = `500 ${PrimaryHeight}px ${LegendFace}`
  context.fillText(PrimaryText, LegendSize / 2, LegendSize * PrimaryRow)
  context.font = `500 ${SecondaryHeight}px ${LegendFace}`
  context.fillText(SecondaryText, LegendSize / 2, LegendSize * SecondaryRow)

  return publish(context)
}

export const scnMakeUSBMark = (): Texture => {
  const context = surface(MarkSize)
  const centre = MarkSize / 2
  const stroke = MarkSize * TridentStroke
  const fork = MarkSize * TridentFork
  const span = MarkSize * TridentSpan
  const tip = MarkSize * TridentTip

  context.strokeStyle = MarkInk
  context.fillStyle = MarkInk
  context.lineWidth = stroke
  context.lineCap = 'butt'

  context.beginPath()
  context.arc(centre, MarkSize - MarkSize * TridentTail, MarkSize * TridentTail, 0, Math.PI * 2)
  context.fill()

  context.beginPath()
  context.moveTo(centre, MarkSize - MarkSize * TridentTail)
  context.lineTo(centre, tip)
  context.moveTo(centre - span, fork)
  context.lineTo(centre - span, fork - span)
  context.lineTo(centre, fork - span * 2)
  context.moveTo(centre + span, fork)
  context.lineTo(centre + span, fork - span)
  context.lineTo(centre, fork - span * 2)
  context.stroke()

  context.beginPath()
  context.moveTo(centre, 0)
  context.lineTo(centre - tip * 0.62, tip)
  context.lineTo(centre + tip * 0.62, tip)
  context.closePath()
  context.fill()

  const square = MarkSize * TridentSquare
  context.fillRect(centre - span - square, fork - square, square * 2, square * 2)
  context.beginPath()
  context.arc(centre + span, fork, square * 1.15, 0, Math.PI * 2)
  context.fill()

  return publish(context)
}
