import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const source = 'vendor/Assets.xcassets/Brand/GitHubOriginal.imageset/original.png'
const manifest = 'packages/CoreGraphics/src/Generated/Assets.gen.ts'
const bytes = readFileSync(source)
const width = bytes.readUInt32BE(16)
const height = bytes.readUInt32BE(20)
mkdirSync('assets/brand', { recursive: true })
copyFileSync(source, 'assets/brand/githuboriginal.png')
const text = readFileSync(manifest, 'utf8')
if (!text.includes('  GitHubOriginal:')) {
  writeFileSync(manifest, text
    .replace('export const Assets = {', "export const Assets = {\n  GitHubOriginal: 'brand/githuboriginal.png',")
    .replace('export const AssetSize: Record<AssetName, { width: number; height: number }> = {',
      `export const AssetSize: Record<AssetName, { width: number; height: number }> = {\n  GitHubOriginal: { width: ${width}, height: ${height} },`))
}
