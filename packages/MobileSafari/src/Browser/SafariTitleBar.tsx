import { createEffect, Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { CAMediaTimingFunction, caAnimation, caTransition } from 'CoreAnimation'
import { MobileSafariMetrics, MobileSafariPalette } from '../Support/MobileSafariMetrics'
import {
  beginEditing,
  clearField,
  endEditing,
  focusedField,
  isEditingChrome,
  resetQuery,
  safariQueryState,
  safariQueryText,
  safariUrlState,
  safariUrlText,
  setFieldText,
  syncUrlText,
  type EditingState,
  type SafariField
} from '../Support/SafariEditing'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const editAnimation = caAnimation(
  MobileSafariMetrics.defaultDuration,
  CAMediaTimingFunction.easeInOut
)

const SearchField = (props: {
  field: SafariField
  value: string
  placeholder: string
  editing: EditingState
  radius: number
  fill: string
  showClear: boolean
  showReload: boolean
  leadMargin: number
  trailMargin: number
  onSubmit: () => void
  onReload?: () => void
}) => (
  <div
    class="flex items-center"
    style={{
      'margin-left': `${props.leadMargin}px`,
      'margin-right': `${props.trailMargin}px`,
      'border-radius': `${props.radius}px`,
      border: `${MobileSafariMetrics.fieldStroke}px solid ${MobileSafariPalette.fieldStroke}`,
      background: props.fill,
      'box-shadow': 'inset 0 1px 1.8px rgba(0,0,0,0.5)',
      padding: `${MobileSafariMetrics.fieldPaddingY}px ${MobileSafariMetrics.fieldTrailingInset}px ${MobileSafariMetrics.fieldPaddingY}px ${MobileSafariMetrics.fieldLeadingInset}px`,
      gap: `${MobileSafariMetrics.fieldContentSpacing}px`
    }}
  >
    <input
      value={props.value}
      placeholder={props.placeholder}
      spellcheck={false}
      autocapitalize="off"
      autocomplete="off"
      onInput={(event) => setFieldText(props.field, event.currentTarget.value)}
      onFocus={() => beginEditing(props.field)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') props.onSubmit()
      }}
      style={{
        flex: '1',
        'min-width': '0',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        'font-family': HelveticaNeue,
        'font-size': `${MobileSafariMetrics.titleFontSize}px`,
        color: props.editing === 'None' ? MobileSafariPalette.fieldTextIdle : 'black'
      }}
    />
    <Show when={props.showClear}>
      <button
        type="button"
        class="flex shrink-0 items-center"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => clearField(props.field)}
      >
        <CGImage name="UITextFieldClearButton" />
      </button>
    </Show>
    <Show when={props.showReload}>
      <button
        type="button"
        onClick={() => props.onReload?.()}
        class="flex shrink-0 items-center"
      >
        <CGImage name="AddressViewReload" />
      </button>
    </Show>
  </div>
)

export const SafariTitleBar = (props: {
  width: number
  title: string
  url: string
  progress: number
  onNavigate: (url: string) => void
  onSearch: (query: string) => void
  onReload: () => void
}) => {
  createEffect(() => syncUrlText(props.url))

  const urlWidth = () =>
    safariUrlState() === 'None'
      ? (props.width * 2) / 3 - MobileSafariMetrics.urlRestReduction
      : props.width - MobileSafariMetrics.urlEditReduction

  const progressWidth = () =>
    safariUrlState() === 'None'
      ? (props.width * 2) / 3 - MobileSafariMetrics.progressRestReduction
      : props.width - MobileSafariMetrics.progressEditReduction

  const queryWidth = () =>
    safariQueryState() === 'None'
      ? props.width / 3
      : props.width - MobileSafariMetrics.urlEditReduction

  const loading = () => props.progress > 0 && props.progress < 1

  const sweep = () => (props.progress !== 1 ? props.progress : 0)

  const urlFill = () =>
    `linear-gradient(to right, rgba(255,255,255,0) ${sweep() * 100}%, rgb(255,255,255) ${sweep() * 100}%)`

  const submitUrl = () => {
    props.onNavigate(safariUrlText())
    endEditing()
  }

  const submitQuery = () => {
    props.onSearch(safariQueryText())
    resetQuery()
    endEditing()
  }

  return (
    <div
      class="relative flex flex-col justify-center"
      style={{
        height: `${MobileSafariMetrics.titleBarHeight}px`,
        background: MobileSafariPalette.titleBar,
        'border-bottom': `1px solid ${MobileSafariPalette.barEdge}`,
        'box-shadow': 'inset 0 -1px 0 rgba(230,230,230,0.2)'
      }}
    >
      <div class="flex items-center justify-center">
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${MobileSafariMetrics.titleFontSize}px`,
            'font-weight': '700',
            color: MobileSafariPalette.titleText,
            'text-shadow': '0 0.66px 0 rgba(255,255,255,0.51)',
            padding: `0 ${MobileSafariMetrics.titleInsetX}px`,
            'white-space': 'nowrap',
            overflow: 'hidden',
            'text-overflow': 'ellipsis'
          }}
        >
          {props.title.length > 0 ? props.title : 'Untitled'}
        </span>
      </div>

      <div class="relative flex items-center">
      <div
        class="flex w-full items-center justify-center overflow-hidden"
        style={{ gap: `${MobileSafariMetrics.fieldRowSpacing}px` }}
      >
        <div
          class="relative shrink-0"
          style={{
            width: `${safariQueryState() === 'None' ? urlWidth() : 0}px`,
            'margin-right': `${safariQueryState() === 'None' ? 0 : -MobileSafariMetrics.fieldRowSpacing}px`,
            opacity: `${safariQueryState() === 'None' ? 1 : 0}`,
            transition: caTransition(['width', 'margin-right', 'opacity'], editAnimation)
          }}
        >
          <div
            class="absolute"
            style={{
              left: `${MobileSafariMetrics.urlLeadMargin}px`,
              width: `${progressWidth()}px`,
              top: '0',
              bottom: '0',
              'border-radius': `${MobileSafariMetrics.fieldRadius}px`,
              background: loading() ? MobileSafariPalette.progress : 'white',
              transition: caTransition(['width'], editAnimation)
            }}
          />
          <div class="relative">
            <SearchField
              field="url"
              value={safariUrlText()}
              placeholder=""
              editing={safariUrlState()}
              radius={MobileSafariMetrics.fieldRadius}
              fill={urlFill()}
              leadMargin={MobileSafariMetrics.urlLeadMargin}
              trailMargin={MobileSafariMetrics.urlTrailMargin}
              showClear={safariUrlState() === 'Active' && safariUrlText().length > 0}
              showReload={safariUrlState() === 'None'}
              onSubmit={submitUrl}
              onReload={props.onReload}
            />
          </div>
        </div>

        <div
          class="shrink-0"
          style={{
            width: `${safariUrlState() === 'None' ? queryWidth() : 0}px`,
            'margin-right': `${safariUrlState() === 'None' ? 0 : -MobileSafariMetrics.fieldRowSpacing}px`,
            opacity: `${safariUrlState() === 'None' ? 1 : 0}`,
            transition: caTransition(['width', 'margin-right', 'opacity'], editAnimation)
          }}
        >
          <SearchField
            field="query"
            value={safariQueryText()}
            placeholder="Google"
            editing={safariQueryState()}
            radius={MobileSafariMetrics.fieldCapsuleRadius}
            fill="white"
            leadMargin={MobileSafariMetrics.queryLeadMargin}
            trailMargin={MobileSafariMetrics.queryTrailMargin}
            showClear={safariQueryState() === 'Active' && safariQueryText().length > 0}
            showReload={false}
            onSubmit={submitQuery}
          />
        </div>

        <div
          class="shrink-0"
          style={{
            width: `${isEditingChrome() ? MobileSafariMetrics.editingSpacerWidth : 0}px`,
            'margin-left': `${isEditingChrome() ? 0 : -MobileSafariMetrics.fieldRowSpacing}px`,
            transition: caTransition(['width', 'margin-left'], editAnimation)
          }}
        />
      </div>

      <button
        type="button"
        class="absolute flex items-center justify-center"
        style={{
          right: `${MobileSafariMetrics.cancelTrailing}px`,
          top: '50%',
          width: `${MobileSafariMetrics.cancelWidth}px`,
          height: `${MobileSafariMetrics.cancelHeight}px`,
          'border-radius': `${MobileSafariMetrics.cancelRadius}px`,
          background: MobileSafariPalette.buttonTone.gray,
          'box-shadow':
            'inset 0 0.6px 1.6px rgba(0,0,0,0.7), 0 0.8px 0 rgba(255,255,255,0.28)',
          transform: `translate(${isEditingChrome() ? 0 : MobileSafariMetrics.cancelWidth + MobileSafariMetrics.cancelTrailing}px, -50%)`,
          'pointer-events': isEditingChrome() ? 'auto' : 'none',
          transition: caTransition(['transform'], editAnimation)
        }}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          const field = focusedField()
          endEditing()
          if (field === 'query') resetQuery()
          syncUrlText(props.url)
        }}
      >
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${MobileSafariMetrics.cancelFontSize}px`,
            'font-weight': '700',
            color: 'white',
            'text-shadow': '0 -0.25px 2px rgba(0,0,0,0.75)'
          }}
        >
          Cancel
        </span>
      </button>
      </div>
    </div>
  )
}
