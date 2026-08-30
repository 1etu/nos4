interface PNFormatRule {
  readonly index: number
  readonly priority: number
  readonly separator: string
}

interface PNFormatRuleset {
  readonly rules: readonly PNFormatRule[]
  readonly maxLength: number
}

const rule = (index: number, separator: string, priority = 0): PNFormatRule => ({
  index,
  priority,
  separator
})

const USParenthesis: readonly PNFormatRuleset[] = [
  { rules: [rule(3, '-')], maxLength: 7 },
  { rules: [rule(0, '('), rule(3, ')'), rule(3, ' ', 1), rule(6, '-')], maxLength: 10 }
]

const StartsWithOne: readonly PNFormatRuleset[] = [
  {
    rules: [rule(1, ' '), rule(1, '(', 1), rule(4, ')'), rule(4, ' ', 1), rule(7, '-')],
    maxLength: 11
  }
]

const rulesetFor = (
  rulesets: readonly PNFormatRuleset[],
  length: number
): PNFormatRuleset | undefined =>
  rulesets
    .filter((ruleset) => length <= ruleset.maxLength)
    .sort((left, right) => left.maxLength - right.maxLength)[0]

const separatorAt = (ruleset: PNFormatRuleset, index: number): string =>
  ruleset.rules
    .filter((entry) => entry.index === index)
    .sort((left, right) => left.priority - right.priority)
    .map((entry) => entry.separator)
    .join('')

export const phoneNumberFormat = (number: string): string => {
  if (number.length === 0) return number
  const ruleset = rulesetFor(number.startsWith('1') ? StartsWithOne : USParenthesis, number.length)
  if (!ruleset) return number

  let formatted = ''
  for (let index = 0; index < number.length; index += 1) {
    formatted += separatorAt(ruleset, index)
    formatted += number.charAt(index)
  }
  return formatted
}
