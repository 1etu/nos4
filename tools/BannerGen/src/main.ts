import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { BannerFontFile } from './BannerMetrics.ts'
import { Banners, bannerNamed, type BannerDefinition } from './BannerCatalog.ts'
import { bannerDocument, type BannerInput } from './BannerDocument.ts'
import { captureBanner } from './HeadlessCapture.ts'

const dataURI = (path: string, mime: string): string =>
  `data:${mime};base64,${readFileSync(join(process.cwd(), path)).toString('base64')}`

const requested = process.argv.slice(2)
const selected: readonly BannerDefinition[] =
  requested.length === 0
    ? Banners
    : requested.map((name) => {
        const banner = bannerNamed(name)
        if (!banner) throw new Error(`no banner named ${name}`)
        return banner
      })

const font = dataURI(BannerFontFile, 'font/ttf')

const inputFor = (banner: BannerDefinition): BannerInput => ({
  font,
  panel: {
    ...banner.panel,
    ...(banner.panel.icon ? { icon: dataURI(banner.panel.icon, 'image/png') } : {})
  },
  shots: banner.shots.map((shot) => dataURI(shot, 'image/png'))
})

const stage = mkdtempSync(join(tmpdir(), 'nos4bannerdoc-'))
const page = join(stage, 'banner.html')
writeFileSync(page, bannerDocument())

try {
  for (const banner of selected) {
    const encoded = await captureBanner(
      pathToFileURL(page).href,
      `window.composeBanner(${JSON.stringify(inputFor(banner))})`
    )
    const payload = encoded.slice(encoded.indexOf(',') + 1)
    writeFileSync(join(process.cwd(), banner.output), Buffer.from(payload, 'base64'))
    process.stdout.write(`banner: ${banner.output} from ${banner.shots.length} shots\n`)
  }
} finally {
  rmSync(stage, { recursive: true, force: true })
}
