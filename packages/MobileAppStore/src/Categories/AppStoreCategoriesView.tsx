import { For, onMount } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UIScrollView } from 'UIKit'
import { AppStoreMetrics, AppStorePalette } from '../Support/AppStoreMetrics'
import { AppStoreCategories, type AppStoreCategory } from '../Support/AppStoreCatalog'
import { appStoreCategoryArtwork, appStoreLoadCategoryArtwork } from '../Support/AppStoreService'
import { AppStoreFooter } from '../Chrome/AppStoreFooter'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const CategoryRow = (props: {
  category: AppStoreCategory
  index: number
  onOpen: (category: AppStoreCategory) => void
}) => {
  const even = () => props.index % 2 === 0

  return (
    <button
      type="button"
      class="flex w-full flex-col"
      style={{
        height: `${AppStoreMetrics.rowHeight}px`,
        background: even() ? AppStorePalette.rowEven : AppStorePalette.rowOdd
      }}
      onClick={() => props.onOpen(props.category)}
    >
      <div class="flex min-h-0 w-full flex-1 items-center">
        <img
          src={appStoreCategoryArtwork(props.category.genreId)}
          alt=""
          draggable={false}
          class="shrink-0"
          style={{
            width: `${AppStoreMetrics.rowIconSize}px`,
            height: `${AppStoreMetrics.rowIconSize}px`,
            'margin-left': `${AppStoreMetrics.rowIconInset}px`,
            'border-radius': `${AppStoreMetrics.rowIconRadius}px`,
            background: AppStorePalette.placeholder,
            'box-shadow': AppStorePalette.rowIconShadow
          }}
        />
        <span
          class="min-w-0 flex-1 text-left"
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${AppStoreMetrics.rowTitleFontSize}px`,
            'font-weight': '700',
            'line-height': '1.2',
            'white-space': 'nowrap',
            overflow: 'hidden',
            'text-overflow': 'ellipsis',
            color: 'black',
            'text-shadow': AppStorePalette.rowTextShadow,
            'padding-left': `${AppStoreMetrics.rowIconInset}px`
          }}
        >
          {props.category.name}
        </span>
        <div class="shrink-0" style={{ 'padding-right': `${AppStoreMetrics.rowTrailInset}px` }}>
          <CGImage name="UITableNext" />
        </div>
      </div>

      <div
        class="w-full shrink-0"
        style={{
          height: `${AppStoreMetrics.rowSeparator}px`,
          background: even()
            ? AppStorePalette.rowSeparatorTopEven
            : AppStorePalette.rowSeparatorTopOdd
        }}
      />
      <div
        class="w-full shrink-0"
        style={{
          height: `${AppStoreMetrics.rowSeparator}px`,
          background: even()
            ? AppStorePalette.rowSeparatorBottomEven
            : AppStorePalette.rowSeparatorBottomOdd
        }}
      />
    </button>
  )
}

export const AppStoreCategoriesView = (props: {
  width: number
  onOpen: (category: AppStoreCategory) => void
}) => {
  onMount(() => {
    for (const category of AppStoreCategories) {
      void appStoreLoadCategoryArtwork(category.genreId)
    }
  })

  return (
    <UIScrollView class="h-full w-full" style={{ background: AppStorePalette.listBackground }}>
      <div class="flex w-full flex-col">
        <For each={AppStoreCategories}>
          {(category, at) => (
            <CategoryRow category={category} index={at()} onOpen={props.onOpen} />
          )}
        </For>
        <AppStoreFooter width={props.width} light={true} />
      </div>
    </UIScrollView>
  )
}
