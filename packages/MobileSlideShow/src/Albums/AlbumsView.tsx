import { CGImage } from 'CoreGraphics'
import { lastImage, mediaURL, photoLibrary } from '../Support/PhotoLibrary'
import { PhotosMetrics, PhotosPalette } from '../Support/PhotosMetrics'
import { UIScrollView } from 'UIKit'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"



export const AlbumsView = (props: { onOpenCameraRoll: () => void }) => (
  <UIScrollView class="h-full w-full" style={{ background: 'white' }}>
    <div style={{ 'padding-top': `${PhotosMetrics.contentInsetTop}px` }}>
      <button type="button" class="block w-full text-left" onClick={props.onOpenCameraRoll}>
        <div class="flex items-center">
          <div
            class="overflow-hidden"
            style={{
              width: `${PhotosMetrics.albumRowThumbSize}px`,
              height: `${PhotosMetrics.albumRowThumbSize}px`,
              'flex-shrink': '0'
            }}
          >
            {lastImage() ? (
              <img
                src={mediaURL(lastImage()!)}
                alt=""
                draggable={false}
                class="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${PhotosMetrics.albumRowTitleFontSize}px`,
              'padding-left': `${PhotosMetrics.albumRowTitleLeading}px`,
              'padding-right': `${PhotosMetrics.albumRowTitleTrailing}px`,
              'white-space': 'nowrap'
            }}
          >
            <span style={{ 'font-weight': '700', color: 'black' }}>Camera Roll </span>
            <span style={{ color: PhotosPalette.albumCount }}>({photoLibrary().length})</span>
          </span>
          <CGImage
            name="UITableNext"
            class="ml-auto"
            style={{ 'margin-right': `${PhotosMetrics.albumRowChevronTrailing}px` }}
          />
        </div>
        <div
          style={{
            height: `${PhotosMetrics.separatorHeight}px`,
            background: PhotosPalette.separator
          }}
        />
      </button>
    </div>
  </UIScrollView>
)
