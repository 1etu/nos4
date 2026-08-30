const MimeTypes: Readonly<Record<string, string>> = {
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4; codecs="mp4a.40.2"',
  aac: 'audio/aac',
  ogg: 'audio/ogg; codecs="vorbis"',
  opus: 'audio/ogg; codecs="opus"',
  wav: 'audio/wav',
  flac: 'audio/flac',
  aiff: 'audio/aiff',
  caf: 'audio/x-caf',
  webm: 'audio/webm; codecs="opus"'
}

export const AVAudioExtensions = Object.keys(MimeTypes)

let probe: HTMLAudioElement | undefined
let cache: Set<string> | undefined

const canPlay = (extension: string): boolean => {
  if (typeof Audio === 'undefined') return false
  if (!probe) probe = new Audio()
  const mime = MimeTypes[extension]
  if (!mime) return false
  return probe.canPlayType(mime) !== ''
}

export const avSupportedExtensions = (): ReadonlySet<string> => {
  if (cache) return cache
  cache = new Set(AVAudioExtensions.filter(canPlay))
  return cache
}

export const avSupportsExtension = (extension: string): boolean =>
  avSupportedExtensions().has(extension.toLowerCase())

export const avExtensionOf = (path: string): string => {
  const match = /\.([a-z0-9]+)(?:[?#]|$)/i.exec(path)
  return match?.[1]?.toLowerCase() ?? ''
}

export const avResolveSource = (
  path: string,
  fallbacks: readonly string[] = ['mp3', 'm4a', 'ogg', 'wav']
): string => {
  if (path.startsWith('blob:') || path.startsWith('data:')) return path
  const extension = avExtensionOf(path)
  if (extension && avSupportsExtension(extension)) return path
  const stem = extension ? path.slice(0, -(extension.length + 1)) : path
  const usable = fallbacks.find((candidate) => avSupportsExtension(candidate))
  return usable ? `${stem}.${usable}` : path
}
