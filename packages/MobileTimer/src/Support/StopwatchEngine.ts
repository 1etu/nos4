import { createSignal } from 'solid-js'

const [running, setRunning] = createSignal(false)
const [origin, setOrigin] = createSignal(0)
const [banked, setBanked] = createSignal(0)
const [lapOrigin, setLapOrigin] = createSignal(0)
const [laps, setLaps] = createSignal<number[]>([])

export const stopwatchRunning = running
export const stopwatchLaps = laps

export const stopwatchElapsed = (): number =>
  running() ? banked() + (Date.now() - origin()) : banked()

export const stopwatchLapElapsed = (): number => stopwatchElapsed() - lapOrigin()

export const stopwatchStart = (): void => {
  setOrigin(Date.now())
  setRunning(true)
}

export const stopwatchStop = (): void => {
  setBanked(stopwatchElapsed())
  setRunning(false)
}

export const stopwatchLap = (): void => {
  const total = stopwatchElapsed()
  setLaps([total - lapOrigin(), ...laps()])
  setLapOrigin(total)
}

export const stopwatchReset = (): void => {
  setRunning(false)
  setBanked(0)
  setOrigin(0)
  setLapOrigin(0)
  setLaps([])
}
