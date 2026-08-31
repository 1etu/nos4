import { BannerMetrics, BannerPalette } from './BannerMetrics.ts'

export interface BannerPanelInput {
  readonly icon?: string
  readonly headline: string
  readonly body?: string
  readonly taglineLead?: string
  readonly taglineLink?: string
}

export interface BannerInput {
  readonly font: string
  readonly panel: BannerPanelInput
  readonly shots: readonly string[]
}

const composer = `
const Metrics = ${JSON.stringify(BannerMetrics)}
const Palette = ${JSON.stringify(BannerPalette)}

const loadImage = (source) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('image did not decode'))
    image.src = source
  })

const trim = (image) => {
  const probe = document.createElement('canvas')
  probe.width = image.naturalWidth
  probe.height = image.naturalHeight
  const context = probe.getContext('2d')
  context.drawImage(image, 0, 0)
  const pixels = context.getImageData(0, 0, probe.width, probe.height).data

  const columns = new Uint32Array(probe.width)
  const rows = new Uint32Array(probe.height)

  for (let y = 0; y < probe.height; y += 1) {
    for (let x = 0; x < probe.width; x += 1) {
      const at = (y * probe.width + x) * 4
      if (pixels[at + 3] <= Metrics.trimAlphaFloor) continue
      const lit =
        pixels[at] < Metrics.trimThreshold ||
        pixels[at + 1] < Metrics.trimThreshold ||
        pixels[at + 2] < Metrics.trimThreshold
      if (!lit) continue
      columns[x] += 1
      rows[y] += 1
    }
  }

  const span = (counts, limit) => {
    let first = -1
    let last = -1
    for (let index = 0; index < counts.length; index += 1) {
      if (counts[index] < limit) continue
      if (first < 0) first = index
      last = index
    }
    return { first, last }
  }

  const horizontal = span(columns, probe.height * Metrics.trimInkFraction)
  const vertical = span(rows, probe.width * Metrics.trimInkFraction)

  if (horizontal.first < 0 || vertical.first < 0) {
    return { left: 0, top: 0, width: probe.width, height: probe.height }
  }
  return {
    left: horizontal.first,
    top: vertical.first,
    width: horizontal.last - horizontal.first + 1,
    height: vertical.last - vertical.first + 1
  }
}

const reflection = (image, crop, width, height) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = Metrics.reflectionHeight
  const context = canvas.getContext('2d')

  context.save()
  context.scale(1, -1)
  context.drawImage(image, crop.left, crop.top, crop.width, crop.height, 0, -height, width, height)
  context.restore()

  context.globalCompositeOperation = 'destination-out'
  const fade = context.createLinearGradient(0, 0, 0, Metrics.reflectionHeight)
  fade.addColorStop(0, 'rgba(0,0,0,' + Metrics.reflectionNear + ')')
  fade.addColorStop(1, 'rgba(0,0,0,1)')
  context.fillStyle = fade
  context.fillRect(0, 0, width, Metrics.reflectionHeight)

  return canvas
}

const faceFor = (weight, size) => weight + ' ' + size + 'px BannerFace, Helvetica, sans-serif'

const wrap = (context, text, limit) => {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    const candidate = line === '' ? word : line + ' ' + word
    if (line === '' || context.measureText(candidate).width <= limit) {
      line = candidate
      continue
    }
    lines.push(line)
    line = word
  }
  if (line !== '') lines.push(line)
  return lines
}

const panelLines = (context, panel) => {
  if (!panel.body) return []
  context.font = faceFor(Metrics.taglineWeight, Metrics.bodyFontSize)
  return wrap(context, panel.body, Metrics.textColumnWidth)
}

const panelHeight = (panel, icon, lines) => {
  let total = 0
  if (icon) total += Metrics.iconSize + Metrics.iconGap
  total += Metrics.headlineFontSize
  if (panel.taglineLink) total += Metrics.taglineGap + Metrics.taglineFontSize
  if (lines.length > 0) total += Metrics.bodyGap + lines.length * Metrics.bodyLineHeight
  return total
}

const drawPanel = (context, panel, icon, lines, x, centreY) => {
  let cursor = centreY - panelHeight(panel, icon, lines) / 2

  if (icon) {
    const ratio = icon.naturalWidth / icon.naturalHeight
    context.drawImage(icon, x, cursor, Metrics.iconSize * ratio, Metrics.iconSize)
    cursor += Metrics.iconSize + Metrics.iconGap
  }

  context.textBaseline = 'alphabetic'
  context.font = faceFor(Metrics.headlineWeight, Metrics.headlineFontSize)
  context.fillStyle = Palette.headline
  cursor += Metrics.headlineFontSize
  context.fillText(panel.headline, x, cursor)

  if (panel.taglineLink) {
    cursor += Metrics.taglineGap + Metrics.taglineFontSize
    context.font = faceFor(Metrics.taglineWeight, Metrics.taglineFontSize)
    context.fillStyle = Palette.tagline
    context.fillText(panel.taglineLead, x, cursor)
    const lead = context.measureText(panel.taglineLead).width
    context.fillStyle = Palette.link
    context.fillText(panel.taglineLink, x + lead, cursor)
  }

  if (lines.length === 0) return
  context.font = faceFor(Metrics.taglineWeight, Metrics.bodyFontSize)
  context.fillStyle = Palette.body
  cursor += Metrics.bodyGap
  for (const line of lines) {
    cursor += Metrics.bodyLineHeight
    context.fillText(line, x, cursor)
  }
}

window.composeBanner = async (input) => {
  const loaded = new FontFace('BannerFace', 'url(' + input.font + ')')
  await loaded.load()
  document.fonts.add(loaded)

  const icon = input.panel.icon ? await loadImage(input.panel.icon) : undefined
  const images = await Promise.all(input.shots.map(loadImage))
  const crops = images.map(trim)
  const widths = crops.map((crop) => Math.round((crop.width * Metrics.deviceHeight) / crop.height))

  const deviceSpan = widths.reduce((total, width) => total + width, 0)
  const gaps = Metrics.columnGap * widths.length
  const width = Metrics.paddingX * 2 + Metrics.textColumnWidth + gaps + deviceSpan
  const height =
    Metrics.paddingY * 2 +
    Metrics.deviceHeight +
    Metrics.reflectionGap +
    Metrics.reflectionHeight

  const canvas = document.createElement('canvas')
  canvas.width = width * Metrics.scale
  canvas.height = height * Metrics.scale
  const context = canvas.getContext('2d')
  context.scale(Metrics.scale, Metrics.scale)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'

  context.fillStyle = Palette.background
  context.fillRect(0, 0, width, height)

  const lines = panelLines(context, input.panel)
  drawPanel(
    context,
    input.panel,
    icon,
    lines,
    Metrics.paddingX,
    Metrics.paddingY + Metrics.deviceHeight / 2
  )

  let cursor = Metrics.paddingX + Metrics.textColumnWidth + Metrics.columnGap
  images.forEach((image, index) => {
    const crop = crops[index]
    const span = widths[index]
    context.drawImage(
      image,
      crop.left,
      crop.top,
      crop.width,
      crop.height,
      cursor,
      Metrics.paddingY,
      span,
      Metrics.deviceHeight
    )
    context.drawImage(
      reflection(image, crop, span, Metrics.deviceHeight),
      cursor,
      Metrics.paddingY + Metrics.deviceHeight + Metrics.reflectionGap
    )
    cursor += span + Metrics.columnGap
  })

  return canvas.toDataURL('image/png')
}
`

export const bannerDocument = (): string =>
  '<!doctype html><html><head><meta charset="utf-8"><title>banner</title>' +
  '<style>html,body{margin:0;background:' +
  BannerPalette.background +
  '}</style></head><body><script>' +
  composer +
  '<' +
  '/script></body></html>'
