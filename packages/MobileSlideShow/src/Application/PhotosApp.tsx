import { createSignal, onMount, Show } from 'solid-js'
import { ckLoadPhotoLibrary, ckStorageError } from 'CameraKit'
import { CAMediaTimingFunction, CATransitionDuration, caAnimation, caTransition } from 'CoreAnimation'
import { UIStatusBar } from 'UIKit'
import { AlbumsView } from '../Albums/AlbumsView'
import { CameraRoll } from '../Albums/CameraRoll'
import { PhotoDestination } from '../Albums/PhotoDestination'
import { PhotosTabBar, type PhotosTab } from '../Chrome/PhotosTabBar'
import { PhotosTitleBar } from '../Chrome/PhotosTitleBar'
import { PhotosMetrics, PhotosPalette } from '../Support/PhotosMetrics'
import { photoLibrary, type PHAsset } from '../Support/PhotoLibrary'

const navAnimation = caAnimation(CATransitionDuration.standard, CAMediaTimingFunction.linear)

const AlbumsDepth = 0
const CameraRollDepth = 1
const DestinationDepth = 2
const PanelCount = 3

export const PhotosApp = () => {
  onMount(() => { void ckLoadPhotoLibrary() })
  const [tab, setTab] = createSignal<PhotosTab>('Albums')
  const [depth, setDepth] = createSignal(AlbumsDepth)
  const [selected, setSelected] = createSignal<PHAsset | undefined>()
  const [barsHidden, setBarsHidden] = createSignal(false)

  const open = (asset: PHAsset) => {
    setSelected(asset)
    setDepth(DestinationDepth)
  }

  const title = () => {
    if (tab() !== 'Albums') return tab()
    if (depth() === AlbumsDepth) return 'Albums'
    if (depth() === CameraRollDepth) return 'Camera Roll'
    const asset = selected()
    const position = asset ? photoLibrary().findIndex((entry) => entry.id === asset.id) + 1 : 0
    return `${position} of ${photoLibrary().length}`
  }

  const backLabel = () => {
    if (tab() !== 'Albums') return undefined
    if (depth() === CameraRollDepth) return 'Albums'
    if (depth() === DestinationDepth) return 'Camera Roll'
    return undefined
  }

  const backWidth = () =>
    depth() === DestinationDepth
      ? PhotosMetrics.backButtonCameraRollWidth
      : PhotosMetrics.backButtonAlbumsWidth

  return (
    <div class="relative h-full w-full overflow-hidden" style={{ background: 'black' }}>
      <div
        class="absolute inset-x-0 top-0 flex flex-col"
        style={{
          bottom: depth() === DestinationDepth ? '0' : `${PhotosMetrics.tabBarHeight}px`
        }}
      >
        <div
          class="relative h-full w-full overflow-hidden"
          style={{ background: PhotosPalette.contentGradient }}
        >
          <div
            class="flex h-full"
            style={{
              width: `${PanelCount * 100}%`,
              transform: `translateX(-${(depth() * 100) / PanelCount}%)`,
              transition: caTransition(['transform'], navAnimation)
            }}
          >
            <div class="h-full" style={{ width: `${100 / PanelCount}%` }}>
              <AlbumsView onOpenCameraRoll={() => setDepth(CameraRollDepth)} />
            </div>
            <div class="h-full" style={{ width: `${100 / PanelCount}%` }}>
              <CameraRoll onOpen={open} />
            </div>
            <div class="h-full" style={{ width: `${100 / PanelCount}%` }}>
              <Show when={selected()}>
                {(asset) => (
                  <PhotoDestination
                    asset={asset()}
                    onIndexChange={(next) => setSelected(photoLibrary()[next])}
                  />
                )}
              </Show>
            </div>
          </div>
        </div>
      </div>

      <div
        class="absolute inset-x-0 top-0 flex flex-col"
        style={{
          opacity: `${barsHidden() ? 0 : 1}`,
          transition: caTransition(['opacity'], navAnimation)
        }}
      >
        <UIStatusBar />
        <PhotosTitleBar
          title={title()}
          backLabel={backLabel()}
          backWidth={backWidth()}
          showAction={depth() === CameraRollDepth}
          onBack={() => setDepth(depth() - 1)}
        />
      </div>

      <Show when={depth() !== DestinationDepth}>
        <div class="absolute inset-x-0 bottom-0">
          <PhotosTabBar selected={tab()} onSelect={setTab} />
        </div>
      </Show>

      <span class="hidden">{barsHidden() ? '' : ''}</span>
      <Show when={ckStorageError()}>
        <div role='status' class='absolute inset-x-0 bottom-0' style={{ color: 'white', background: 'black' }}>
          {ckStorageError()}
        </div>
      </Show>
      <button type="button" class="hidden" onClick={() => setBarsHidden(!barsHidden())} />
    </div>
  )
}
