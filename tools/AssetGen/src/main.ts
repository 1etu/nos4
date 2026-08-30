import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { basename, join, relative } from 'node:path'
import { decodeCgBI, isCgBI } from './CgBI.ts'
import { sanitizeSFNT } from './SFNT.ts'

const CatalogRoot = join(
  process.cwd(),
  'the-oldos-project/OldOS/OldOS/Assets.xcassets'
)
const GameCatalogRoot = join(process.cwd(), 'vendor/Assets.xcassets')
const GameSoundRoot = join(process.cwd(), 'vendor/sounds')
const SourceRoot = join(process.cwd(), 'the-oldos-project/OldOS/OldOS')
const OutputAssets = join(process.cwd(), 'assets')
const OutputManifest = join(
  process.cwd(),
  'packages/CoreGraphics/src/Generated/Assets.gen.ts'
)
const PreferredScales = ['2x', '3x', '1x']

interface CatalogImage {
  readonly filename?: string
  readonly scale?: string
  readonly resizing?: {
    readonly 'cap-insets'?: Record<string, number>
    readonly mode?: string
  }
}

interface CatalogContents {
  readonly images?: readonly CatalogImage[]
}

interface ExtractedAsset {
  readonly key: string
  readonly path: string
  readonly capInsets: Record<string, number> | undefined
  readonly width: number
  readonly height: number
}

const pngPointSize = (bytes: Buffer, scale: number): { width: number; height: number } => {
  let offset = 8
  while (offset + 8 <= bytes.length) {
    const length = bytes.readUInt32BE(offset)
    if (bytes.toString('latin1', offset + 4, offset + 8) === 'IHDR') {
      return {
        width: bytes.readUInt32BE(offset + 8) / scale,
        height: bytes.readUInt32BE(offset + 12) / scale
      }
    }
    offset += 12 + length
  }
  return { width: 0, height: 0 }
}

const slug = (value: string): string =>
  value
    .replace(/\.imageset$/, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

const identifier = (value: string): string => {
  const cleaned = value.replace(/\.imageset$/, '').replace(/[^A-Za-z0-9]+/g, '_')
  return /^[0-9]/.test(cleaned) ? `_${cleaned}` : cleaned
}

const imagesets = (root: string): string[] => {
  const found: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (!statSync(full).isDirectory()) continue
      if (entry.endsWith('.imageset')) {
        found.push(full)
        continue
      }
      walk(full)
    }
  }
  walk(root)
  return found
}

const pick = (contents: CatalogContents): CatalogImage | undefined => {
  for (const scale of PreferredScales) {
    const match = contents.images?.find((image) => image.scale === scale && image.filename)
    if (match) return match
  }
  return contents.images?.find((image) => image.filename)
}

const run = (): void => {
  rmSync(OutputAssets, { recursive: true, force: true })
  mkdirSync(OutputAssets, { recursive: true })

  const sets = [...imagesets(CatalogRoot), ...imagesets(GameCatalogRoot)]
  const claimed = new Map<string, string>()
  const extracted: ExtractedAsset[] = []
  const skipped: string[] = []
  const unconverted: string[] = []
  let converted = 0

  for (const set of sets) {
    const contents = JSON.parse(
      readFileSync(join(set, 'Contents.json'), 'utf8')
    ) as CatalogContents
    const image = pick(contents)
    if (!image?.filename) {
      skipped.push(relative(CatalogRoot, set))
      continue
    }

    const group = slug(basename(join(set, '..')))
    const name = slug(basename(set))
    const base = identifier(basename(set))
    const key = claimed.has(base) ? `${identifier(basename(join(set, '..')))}_${base}` : base
    claimed.set(base, set)

    const extension = image.filename.slice(image.filename.lastIndexOf('.'))
    const relativePath = `${group}/${name}${extension}`
    mkdirSync(join(OutputAssets, group), { recursive: true })
    const sourceFile = join(set, image.filename)
    const target = join(OutputAssets, relativePath)
    const bytes = readFileSync(sourceFile)
    if (isCgBI(bytes)) {
      try {
        writeFileSync(target, decodeCgBI(bytes))
        converted += 1
      } catch {
        copyFileSync(sourceFile, target)
        unconverted.push(relativePath)
      }
    } else {
      copyFileSync(sourceFile, target)
    }

    const scale = Number((image.scale ?? '1x').replace('x', '')) || 1
    const size = pngPointSize(readFileSync(target), scale)

    extracted.push({
      key,
      path: relativePath,
      capInsets: image.resizing?.['cap-insets'],
      width: size.width,
      height: size.height
    })
  }

  extracted.sort((a, b) => a.key.localeCompare(b.key))

  const entries = extracted
    .map((asset) => `  ${asset.key}: '${asset.path}'`)
    .join(',\n')

  const sliced = extracted
    .filter((asset) => asset.capInsets)
    .map((asset) => `  ${asset.key}: ${JSON.stringify(asset.capInsets)}`)
    .join(',\n')

  const sounds: string[] = []
  const walkSounds = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) {
        walkSounds(full)
        continue
      }
      if (/\.(aiff|caf|wav|mp3|m4a)$/i.test(entry)) sounds.push(full)
    }
  }
  walkSounds(SourceRoot)
  walkSounds(GameSoundRoot)

  const vendorRoot = join(process.cwd(), 'vendor')
  const vendorExcluded = new Set(['Assets.xcassets', 'wordlists', 'sounds'])
  const copyVendor = (dir: string, rel: string): void => {
    for (const entry of readdirSync(dir)) {
      if (rel === '' && vendorExcluded.has(entry)) continue
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) {
        mkdirSync(join(OutputAssets, rel, entry), { recursive: true })
        copyVendor(full, join(rel, entry))
        continue
      }
      if (/.(ttf|otf)$/i.test(entry)) {
        writeFileSync(join(OutputAssets, rel, entry), sanitizeSFNT(readFileSync(full)))
        continue
      }
      copyFileSync(full, join(OutputAssets, rel, entry))
    }
  }
  copyVendor(vendorRoot, '')

  mkdirSync(join(OutputAssets, 'sounds'), { recursive: true })
  const soundEntries = sounds
    .map((source) => {
      const name = basename(source)
      copyFileSync(source, join(OutputAssets, 'sounds', name))
      return `  ${identifier(name.replace(/\.[^.]+$/, ''))}: 'sounds/${name}'`
    })
    .sort()
    .join(',\n')

  writeFileSync(
    OutputManifest,
    `export const Assets = {\n${entries}\n} as const\n\n` +
      `export type AssetName = keyof typeof Assets\n\n` +
      `export const AssetCapInsets: Partial<Record<AssetName, Record<string, number>>> = {\n${sliced}\n}\n\n` +
      `export const AssetSize: Record<AssetName, { width: number; height: number }> = {\n${extracted
        .map((asset) => `  ${asset.key}: { width: ${asset.width}, height: ${asset.height} }`)
        .join(',\n')}\n}\n\n` +
      `export const Sounds = {\n${soundEntries}\n} as const\n\n` +
      `export type SoundName = keyof typeof Sounds\n`
  )

  process.stdout.write(`extracted ${sounds.length} sounds\n`)

  process.stdout.write(
    `extracted ${extracted.length} imagesets, ${extracted.filter((a) => a.capInsets).length} with cap insets, ${skipped.length} skipped\n`
  )
}

run()
