import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { captureBanner } from '../../BannerGen/src/HeadlessCapture.ts'

const Artwork = 'vendor/Assets.xcassets/Brand/GitHubOriginal.imageset/original.png'
const Template = 'assets/homescreen-icons/settings.png'
const ImageSet = 'vendor/Assets.xcassets/Brand/StarIcon.imageset'
const ImageFile = 'StarIcon.png'
const Output = 'assets/brand/staricon.png'
const Manifest = 'packages/CoreGraphics/src/Generated/Assets.gen.ts'

const StarIconMetrics = {
  faceTop: 'rgb(248,249,251)',
  faceBottom: 'rgb(214,218,224)',
  keyFloor: 250,
  artScale: 0.88,
  artOffsetY: 0.03,
  glossCenterY: -0.55,
  glossRadiusX: 0.85,
  glossRadiusY: 1.05,
  glossTopAlpha: 0.5,
  glossBottomAlpha: 0.1
} as const

const dataURI = (path: string): string =>
  `data:image/png;base64,${readFileSync(join(process.cwd(), path)).toString('base64')}`

const page = `<!doctype html>
<meta charset="utf-8">
<canvas id="icon"></canvas>
<script>
const load = (source) => new Promise((resolve, reject) => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.onerror = reject
  image.src = source
})

window.composeIcon = async ({ artwork, template, metrics }) => {
  const [art, mask] = await Promise.all([load(artwork), load(template)])
  const width = mask.naturalWidth
  const height = mask.naturalHeight
  const canvas = document.getElementById('icon')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  context.imageSmoothingQuality = 'high'

  const face = context.createLinearGradient(0, 0, 0, height)
  face.addColorStop(0, metrics.faceTop)
  face.addColorStop(1, metrics.faceBottom)
  context.fillStyle = face
  context.fillRect(0, 0, width, height)

  const scratch = document.createElement('canvas')
  scratch.width = art.naturalWidth
  scratch.height = art.naturalHeight
  const scratchContext = scratch.getContext('2d')
  scratchContext.drawImage(art, 0, 0)
  const pixels = scratchContext.getImageData(0, 0, scratch.width, scratch.height)
  const data = pixels.data
  for (let i = 0; i < data.length; i += 4) {
    const white =
      data[i] >= metrics.keyFloor && data[i + 1] >= metrics.keyFloor && data[i + 2] >= metrics.keyFloor
    if (white) data[i + 3] = 0
  }
  scratchContext.putImageData(pixels, 0, 0)
  const artWidth = width * metrics.artScale
  const artHeight = (artWidth * scratch.height) / scratch.width
  context.drawImage(
    scratch,
    (width - artWidth) / 2,
    (height - artHeight) / 2 + height * metrics.artOffsetY,
    artWidth,
    artHeight
  )

  context.save()
  context.beginPath()
  context.ellipse(
    width / 2,
    height * metrics.glossCenterY,
    width * metrics.glossRadiusX,
    height * metrics.glossRadiusY,
    0,
    0,
    Math.PI * 2
  )
  context.clip()
  const glossBottom = height * (metrics.glossCenterY + metrics.glossRadiusY)
  const gloss = context.createLinearGradient(0, 0, 0, glossBottom)
  gloss.addColorStop(0, 'rgba(255,255,255,' + metrics.glossTopAlpha + ')')
  gloss.addColorStop(1, 'rgba(255,255,255,' + metrics.glossBottomAlpha + ')')
  context.fillStyle = gloss
  context.fillRect(0, 0, width, height)
  context.restore()

  context.globalCompositeOperation = 'destination-in'
  context.drawImage(mask, 0, 0)
  context.globalCompositeOperation = 'source-over'
  return canvas.toDataURL('image/png')
}
</script>
`

const stage = mkdtempSync(join(tmpdir(), 'nos4staricon-'))
const pagePath = join(stage, 'icon.html')
writeFileSync(pagePath, page)

try {
  const input = { artwork: dataURI(Artwork), template: dataURI(Template), metrics: StarIconMetrics }
  const encoded = await captureBanner(
    pathToFileURL(pagePath).href,
    `window.composeIcon(${JSON.stringify(input)})`
  )
  const bytes = Buffer.from(encoded.slice(encoded.indexOf(',') + 1), 'base64')
  const width = bytes.readUInt32BE(16)
  const height = bytes.readUInt32BE(20)

  mkdirSync(ImageSet, { recursive: true })
  writeFileSync(join(ImageSet, ImageFile), bytes)
  writeFileSync(
    join(ImageSet, 'Contents.json'),
    `${JSON.stringify(
      {
        images: [{ filename: ImageFile, idiom: 'universal', scale: '1x' }],
        info: { author: 'nos4', version: 1 }
      },
      null,
      2
    )}\n`
  )
  mkdirSync('assets/brand', { recursive: true })
  copyFileSync(join(ImageSet, ImageFile), Output)

  const text = readFileSync(Manifest, 'utf8')
  if (!text.includes('  StarIcon:')) {
    const eol = text.includes('\r\n') ? '\r\n' : '\n'
    writeFileSync(
      Manifest,
      text
        .replace('export const Assets = {', `export const Assets = {${eol}  StarIcon: 'brand/staricon.png',`)
        .replace(
          'export const AssetSize: Record<AssetName, { width: number; height: number }> = {',
          `export const AssetSize: Record<AssetName, { width: number; height: number }> = {${eol}  StarIcon: { width: ${width}, height: ${height} },`
        )
    )
  }
  process.stdout.write(`icon: ${Output} ${width}x${height}\n`)
} finally {
  rmSync(stage, { recursive: true, force: true })
}
