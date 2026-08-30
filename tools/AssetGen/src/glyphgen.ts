import { readFileSync, writeFileSync } from 'node:fs'
import { glyphOutline } from './GlyphOutline.ts'

const font = readFileSync('assets/fonts/PhoneKeyCaps.ttf')

const wanted = [
  { key: 'shiftSmall', codepoint: 0xf7e2 },
  { key: 'shiftLarge', codepoint: 0xf7e3 },
  { key: 'deleteWide', codepoint: 0xe008 },
  { key: 'globe', codepoint: 0xe005 }
]

const entries = wanted.map((item) => {
  const glyph = glyphOutline(font, item.codepoint)
  if (!glyph) throw new Error(`missing glyph for ${item.key}`)
  process.stdout.write(`${item.key}: ${glyph.width}x${glyph.height} units, ${glyph.path.length} chars\n`)
  return `  ${item.key}: {\n    path: '${glyph.path}',\n    width: ${glyph.width},\n    height: ${glyph.height}\n  }`
})

writeFileSync(
  'packages/TextInput/src/KeyCapGlyphs.gen.ts',
  `export const KeyCapGlyphs = {\n${entries.join(',\n')}\n} as const\n\nexport type KeyCapGlyphName = keyof typeof KeyCapGlyphs\n`
)
