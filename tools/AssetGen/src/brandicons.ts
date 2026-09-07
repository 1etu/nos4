import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { captureBanner } from '../../BannerGen/src/HeadlessCapture.ts'

const IconSource = 'assets/brand/nos4-icon.png'
const BannerSource = 'assets/brand/nos4-og.png'
const OutputDirectory = 'assets/brand'

interface Job {
  readonly source: string
  readonly output: string
  readonly width: number
  readonly height: number
  readonly mime: 'image/png' | 'image/jpeg'
  readonly quality?: number
}

const Jobs: readonly Job[] = [
  { source: IconSource, output: 'favicon-32.png', width: 32, height: 32, mime: 'image/png' },
  { source: IconSource, output: 'favicon-192.png', width: 192, height: 192, mime: 'image/png' },
  { source: IconSource, output: 'apple-touch-icon.png', width: 180, height: 180, mime: 'image/png' },
  { source: IconSource, output: 'icon-512.png', width: 512, height: 512, mime: 'image/png' },
  {
    source: BannerSource,
    output: 'nos4-og-1200.jpg',
    width: 1200,
    height: 630,
    mime: 'image/jpeg',
    quality: 0.88
  }
]

const dataURI = (path: string): string =>
  `data:image/png;base64,${readFileSync(join(process.cwd(), path)).toString('base64')}`

const page = `<!doctype html>
<meta charset="utf-8">
<canvas id="stage"></canvas>
<script>
const load = (source) => new Promise((resolve, reject) => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.onerror = reject
  image.src = source
})

window.resizeImage = async ({ source, width, height, mime, quality }) => {
  const image = await load(source)
  const canvas = document.getElementById('stage')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  if (mime === 'image/jpeg') {
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)
  }
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const drawWidth = image.naturalWidth * scale
  const drawHeight = image.naturalHeight * scale
  context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight)
  return canvas.toDataURL(mime, quality)
}
</script>
`

const stage = mkdtempSync(join(tmpdir(), 'nos4brand-'))
const document = join(stage, 'resize.html')
writeFileSync(document, page)
mkdirSync(OutputDirectory, { recursive: true })

try {
  for (const job of Jobs) {
    const input = {
      source: dataURI(job.source),
      width: job.width,
      height: job.height,
      mime: job.mime,
      quality: job.quality ?? 1
    }
    const encoded = await captureBanner(
      pathToFileURL(document).href,
      `window.resizeImage(${JSON.stringify(input)})`
    )
    const bytes = Buffer.from(encoded.slice(encoded.indexOf(',') + 1), 'base64')
    writeFileSync(join(OutputDirectory, job.output), bytes)
    process.stdout.write(
      `${job.output} ${job.width}x${job.height} ${Math.round(bytes.length / 1024)}K\n`
    )
  }
} finally {
  rmSync(stage, { recursive: true, force: true })
}
