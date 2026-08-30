export interface CATransaction {
  readonly cancel: () => void
}

export const caAfter = (seconds: number, run: () => void): CATransaction => {
  const id = setTimeout(run, seconds * 1000)
  return { cancel: () => clearTimeout(id) }
}
