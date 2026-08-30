import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { aliasMatchForm } from '../../../services/GameCenterService/src/Aliases/AliasNormalisation.ts'
import { GameCenterMetrics } from '../../../services/GameCenterService/src/Support/GameCenterMetrics.ts'

const SourceList = join(process.cwd(), 'vendor/wordlists/ldnoobw-en.txt')
const OutputModule = join(
  process.cwd(),
  'services/GameCenterService/src/Aliases/AliasBlocklist.gen.ts'
)

const entries = readFileSync(SourceList, 'utf8')
  .split('\n')
  .map((line) => aliasMatchForm(line))
  .filter((stem) => stem.length > 0 && stem.length <= GameCenterMetrics.aliasMaximumLength)

const stems = [...new Set(entries)].sort()

const module = `export const BlockedAliases: ReadonlySet<string> = new Set([
${stems.map((stem) => `  '${stem}'`).join(',\n')}
])
`

writeFileSync(OutputModule, module)
process.stdout.write(`blocklist: ${stems.length} stems\n`)
