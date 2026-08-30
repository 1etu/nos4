import { createSignal } from 'solid-js'
import type { CELRecording } from 'Celestial'
import {
  vmDeleteRecording,
  vmLoadRecordings,
  vmSaveRecording,
  type VMStoredRecording
} from './VMRecordingStore'

export interface VMRecordingItem {
  readonly id: string
  readonly title: string
  readonly duration: number
  readonly date: Date
  readonly source: string
}

const [items, setItems] = createSignal<VMRecordingItem[]>([])

export const vmRecordings = items

const titleFor = (date: Date): string =>
  date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

const present = (stored: VMStoredRecording): VMRecordingItem => ({
  id: stored.id,
  title: titleFor(new Date(stored.recordedAt)),
  duration: stored.duration,
  date: new Date(stored.recordedAt),
  source: URL.createObjectURL(stored.blob)
})

export const vmRefreshLibrary = async (): Promise<void> => {
  const stored = await vmLoadRecordings()
  for (const item of items()) URL.revokeObjectURL(item.source)
  setItems(stored.map(present))
}

export const vmAddRecording = async (recording: CELRecording): Promise<void> => {
  const stored: VMStoredRecording = {
    id: `${recording.recordedAt}`,
    blob: recording.blob,
    duration: recording.duration,
    recordedAt: recording.recordedAt
  }
  await vmSaveRecording(stored)
  setItems([present(stored), ...items()])
}

export const vmRemoveRecording = async (id: string): Promise<void> => {
  const doomed = items().find((item) => item.id === id)
  if (doomed) URL.revokeObjectURL(doomed.source)
  await vmDeleteRecording(id)
  setItems(items().filter((item) => item.id !== id))
}

export const vmDurationLabel = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00'
  const total = Math.round(seconds)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

export const vmShortDuration = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`
  return vmDurationLabel(seconds)
}
