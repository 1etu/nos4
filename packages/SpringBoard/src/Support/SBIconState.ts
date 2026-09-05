import { createSignal } from 'solid-js'
import { NSUserDefaults } from 'NSUserDefaults'
import {
  AppsSecondApplications,
  FolderApplications,
  HomeScreenApplications,
  applicationForBundle,
  type ApplicationRecord
} from './Bundles'

export type SBIconEntry =
  | { readonly kind: 'app'; readonly bundleId: string }
  | { readonly kind: 'folder'; readonly name: string; readonly bundleIds: readonly string[] }

const IconStateKey = 'iconState'
const UtilitiesFolderSlot = 9
const PageCapacity = 16

export const SBFolderCapacity = 4

const app = (bundleId: string): SBIconEntry => ({ kind: 'app', bundleId })

const defaultPages = (): SBIconEntry[][] => {
  const first = HomeScreenApplications.map((record) => app(record.bundleId))
  first.splice(UtilitiesFolderSlot, 0, {
    kind: 'folder',
    name: 'Utilities',
    bundleIds: FolderApplications.map((record) => record.bundleId)
  })
  return [first, AppsSecondApplications.map((record) => app(record.bundleId))]
}

const validEntry = (entry: SBIconEntry): boolean => {
  if (entry.kind === 'app') return applicationForBundle(entry.bundleId) !== undefined
  return (
    typeof entry.name === 'string' &&
    entry.bundleIds.length >= 2 &&
    entry.bundleIds.length <= SBFolderCapacity &&
    entry.bundleIds.every((bundleId) => applicationForBundle(bundleId) !== undefined)
  )
}

const InstalledApplications: readonly ApplicationRecord[] = [
  ...HomeScreenApplications,
  ...FolderApplications,
  ...AppsSecondApplications
]

const placedBundles = (entries: readonly SBIconEntry[][]): Set<string> => {
  const placed = new Set<string>()
  for (const page of entries) {
    for (const entry of page) {
      if (entry.kind === 'app') placed.add(entry.bundleId)
      else for (const bundleId of entry.bundleIds) placed.add(bundleId)
    }
  }
  return placed
}

const withNewlyInstalled = (saved: SBIconEntry[][]): SBIconEntry[][] => {
  const placed = placedBundles(saved)
  const installed = InstalledApplications.filter((record) => !placed.has(record.bundleId))
  if (installed.length === 0) return saved
  const pages = saved.map((entries) => [...entries])
  for (const record of installed) {
    const open = pages.find((entries) => entries.length < PageCapacity) ?? pages[pages.length - 1]
    open?.push(app(record.bundleId))
  }
  return pages
}

const restore = (): SBIconEntry[][] => {
  const saved = NSUserDefaults.object<SBIconEntry[][]>(IconStateKey)
  if (!saved || saved.length !== 2) return defaultPages()
  if (!saved.every((entries) => Array.isArray(entries) && entries.every(validEntry))) {
    return defaultPages()
  }
  return withNewlyInstalled(saved)
}

const [pages, setPages] = createSignal<SBIconEntry[][]>(restore())

export const sbIconPages = pages

const commit = (next: SBIconEntry[][]) => {
  setPages(next)
  NSUserDefaults.setObject(IconStateKey, next)
}

const withPage = (page: number, change: (entries: SBIconEntry[]) => SBIconEntry[]) => {
  commit(pages().map((entries, index) => (index === page ? change([...entries]) : entries)))
}

export const sbIconMove = (page: number, from: number, to: number) => {
  withPage(page, (entries) => {
    const [entry] = entries.splice(from, 1)
    if (entry) entries.splice(to, 0, entry)
    return entries
  })
}

export const sbIconCreateFolder = (page: number, target: number, dragged: number): number => {
  let slot = target
  withPage(page, (entries) => {
    const base = entries[target]
    const added = entries[dragged]
    if (base?.kind !== 'app' || added?.kind !== 'app') return entries
    const record = applicationForBundle(base.bundleId)
    entries[target] = {
      kind: 'folder',
      name: record?.category ?? 'Utilities',
      bundleIds: [base.bundleId, added.bundleId]
    }
    entries.splice(dragged, 1)
    slot = dragged < target ? target - 1 : target
    return entries
  })
  return slot
}

export const sbIconAddToFolder = (page: number, target: number, dragged: number) => {
  withPage(page, (entries) => {
    const folder = entries[target]
    const added = entries[dragged]
    if (folder?.kind !== 'folder' || added?.kind !== 'app') return entries
    if (folder.bundleIds.length >= SBFolderCapacity) return entries
    entries[target] = { ...folder, bundleIds: [...folder.bundleIds, added.bundleId] }
    entries.splice(dragged, 1)
    return entries
  })
}

export const sbIconExtractFromFolder = (page: number, folderIndex: number, bundleId: string) => {
  withPage(page, (entries) => {
    const folder = entries[folderIndex]
    if (folder?.kind !== 'folder') return entries
    const remaining = folder.bundleIds.filter((entry) => entry !== bundleId)
    if (remaining.length === 1 && remaining[0]) {
      entries[folderIndex] = app(remaining[0])
    } else {
      entries[folderIndex] = { ...folder, bundleIds: remaining }
    }
    entries.splice(folderIndex + 1, 0, app(bundleId))
    return entries
  })
}

export const sbIconReorderFolder = (page: number, folderIndex: number, from: number, to: number) => {
  withPage(page, (entries) => {
    const folder = entries[folderIndex]
    if (folder?.kind !== 'folder') return entries
    const bundleIds = [...folder.bundleIds]
    const [moved] = bundleIds.splice(from, 1)
    if (moved) bundleIds.splice(to, 0, moved)
    entries[folderIndex] = { ...folder, bundleIds }
    return entries
  })
}
