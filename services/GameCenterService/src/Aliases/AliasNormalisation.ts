const CombiningMarks = /\p{M}+/gu
const NonAlphanumeric = /[^a-z0-9]+/g
const RepeatedCharacters = /(.)\1+/g

const MultiCharacterLeet: readonly (readonly [string, string])[] = [
  ['|_|', 'u'],
  ['\\/\\/', 'w'],
  ['|\\|', 'n'],
  ['\\/', 'v'],
  ['ph', 'f']
]

const SingleCharacterLeet: Readonly<Record<string, string>> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '8': 'b',
  '@': 'a',
  $: 's',
  '!': 'i',
  '|': 'i',
  '+': 't',
  '(': 'c',
  '<': 'c'
}

const foldAccents = (value: string): string =>
  value.normalize('NFKD').replace(CombiningMarks, '').toLowerCase()

const applyLeet = (value: string): string => {
  let folded = value
  for (const [pattern, replacement] of MultiCharacterLeet) {
    folded = folded.replaceAll(pattern, replacement)
  }
  let mapped = ''
  for (const character of folded) mapped += SingleCharacterLeet[character] ?? character
  return mapped
}

export const aliasUniquenessForm = (value: string): string =>
  foldAccents(value).replace(NonAlphanumeric, '')

export const aliasMatchForm = (value: string): string =>
  applyLeet(foldAccents(value))
    .replace(NonAlphanumeric, '')
    .replace(RepeatedCharacters, '$1')

