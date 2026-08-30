import { For, Show, createSignal } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UIBarButton, UIScrollView } from 'UIKit'
import { HelveticaNeue, PhoneMetrics, PhonePalette } from '../Support/PhoneMetrics'
import { phFavorites, phRemoveFavorite, type PHFavorite } from '../Support/FavoritesStore'

const RemoveControl = (props: { armed: boolean; onPress: () => void }) => (
  <button
    type="button"
    class="relative flex shrink-0 items-center justify-center"
    style={{ 'margin-left': `${PhoneMetrics.removeControlOffsetX}px` }}
    onClick={() => props.onPress()}
  >
    <CGImage name="UIRemoveControlMinus" />
    <span
      class="absolute"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${PhoneMetrics.removeGlyphFontSize}px`,
        'font-weight': '900',
        color: 'white',
        transform: props.armed
          ? `translateY(${PhoneMetrics.removeGlyphArmedOffsetY}px) rotate(-90deg)`
          : `translateY(${PhoneMetrics.removeGlyphOffsetY}px)`
      }}
    >
      —
    </span>
  </button>
)

const FavoriteRow = (props: {
  favorite: PHFavorite
  editing: boolean
  armed: boolean
  onCall: () => void
  onArm: () => void
  onDelete: () => void
}) => (
  <>
    <div
      class="flex w-full items-center"
      style={{
        height: `${PhoneMetrics.rowHeight - PhoneMetrics.hairline}px`,
        'padding-left': `${PhoneMetrics.rowLeading}px`
      }}
      onClick={() => {
        if (props.editing) return
        props.onCall()
      }}
    >
      <Show when={props.editing}>
        <RemoveControl armed={props.armed} onPress={() => props.onArm()} />
      </Show>

      <span
        class="min-w-0"
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${PhoneMetrics.favoriteNameFontSize}px`,
          'font-weight': '700',
          color: 'black',
          'padding-left': `${props.editing ? PhoneMetrics.removeGlyphLeading : 0}px`,
          'padding-right': `${PhoneMetrics.rowTextTrailing}px`,
          'white-space': 'nowrap',
          overflow: 'hidden',
          'text-overflow': 'ellipsis'
        }}
      >
        {props.favorite.name}
      </span>

      <div class="flex flex-1 items-center justify-end">
        <Show
          when={props.armed}
          fallback={
            <>
              <span
                style={{
                  'font-family': HelveticaNeue,
                  'font-size': `${PhoneMetrics.favoriteTypeFontSize}px`,
                  'font-weight': '700',
                  color: PhonePalette.rowDetail,
                  'white-space': 'nowrap'
                }}
              >
                {props.favorite.type}
              </span>
              <div style={{ 'padding-right': `${PhoneMetrics.chevronTrailing}px` }}>
                <CGImage name="ABTableNextButton" />
              </div>
            </>
          }
        >
          <div style={{ 'padding-right': `${PhoneMetrics.deleteButtonTrailing}px` }}>
            <UIBarButton title="Delete" tone="red" onClick={() => props.onDelete()} />
          </div>
        </Show>
      </div>
    </div>
    <div style={{ height: `${PhoneMetrics.hairline}px`, background: PhonePalette.separator }} />
  </>
)

export const FavoritesView = (props: {
  editing: boolean
  onCall: (favorite: PHFavorite) => void
}) => {
  const [armed, setArmed] = createSignal('')

  return (
    <UIScrollView class="min-h-0 flex-1" style={{ background: 'white' }}>
      <For each={phFavorites()}>
        {(favorite) => (
          <FavoriteRow
            favorite={favorite}
            editing={props.editing}
            armed={props.editing && armed() === favorite.id}
            onCall={() => props.onCall(favorite)}
            onArm={() => setArmed(armed() === favorite.id ? '' : favorite.id)}
            onDelete={() => phRemoveFavorite(favorite.id)}
          />
        )}
      </For>
    </UIScrollView>
  )
}
