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
  readonly filename: string
}

const [items, setItems] = createSignal<VMRecordingItem[]>([])

export const vmRecordings = items

const sources = new Map<string, string>()

const titleFor = (date: Date): string =>
  date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

const stampFor = (date: Date): string => {
  const pad = (value: number) => `${value}`.padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    ` ${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  )
}

const extensionFor = (type: string): string => {
  if (type.includes('wav')) return 'wav'
  if (type.includes('mp4')) return 'm4a'
  if (type.includes('webm')) return 'webm'
  return 'audio'
}

const sourceFor = (stored: VMStoredRecording): string => {
  const existing = sources.get(stored.id)
  if (existing) return existing
  const created = URL.createObjectURL(stored.blob)
  sources.set(stored.id, created)
  return created
}

const present = (stored: VMStoredRecording): VMRecordingItem => {
  const date = new Date(stored.recordedAt)
  return {
    id: stored.id,
    title: titleFor(date),
    duration: stored.duration,
    date,
    source: sourceFor(stored),
    filename: `Voice Memo ${stampFor(date)}.${extensionFor(stored.blob.type)}`
  }
}

export const vmRefreshLibrary = async (): Promise<void> => {
  const stored = await vmLoadRecordings()
  const live = new Set(stored.map((entry) => entry.id))
  for (const [id, source] of sources) {
    if (live.has(id)) continue
    URL.revokeObjectURL(source)
    sources.delete(id)
  }
  setItems(stored.map(present))
}

export const vmAddRecording = async (recording: CELRecording): Promise<VMRecordingItem> => {
  const stored: VMStoredRecording = {
    id: `memo-${recording.recordedAt}-${Math.random().toString(36).slice(2, 8)}`,
    blob: recording.blob,
    duration: recording.duration,
    recordedAt: recording.recordedAt
  }
  await vmSaveRecording(stored)
  const item = present(stored)
  setItems([item, ...items()])
  return item
}

export const vmRemoveRecording = async (id: string): Promise<void> => {
  const source = sources.get(id)
  if (source) {
    URL.revokeObjectURL(source)
    sources.delete(id)
  }
  await vmDeleteRecording(id)
  setItems(items().filter((item) => item.id !== id))
}

export const vmExportRecording = (item: VMRecordingItem): void => {
  const link = document.createElement('a')
  link.href = item.source
  link.download = item.filename
  document.body.append(link)
  link.click()
  link.remove()
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
