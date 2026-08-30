import { Show } from 'solid-js'
import {
  GameCenterFonts,
  GameCenterMetrics,
  GameCenterPalette
} from '../Support/GameCenterMetrics'
import { gkTile } from './GKTexture'

export const GKField = (props: {
  label?: string
  value: string
  placeholder: string
  focused: boolean
  onFocus: () => void
}) => (
  <button
    type="button"
    class="relative flex w-full items-center"
    style={{
      height: `${GameCenterMetrics.fieldHeight}px`,
      margin: `0 ${GameCenterMetrics.fieldInsetX}px`,
      padding: `0 ${GameCenterMetrics.fieldPaddingX}px`,
      gap: `${GameCenterMetrics.fieldGap}px`,
      'border-radius': `${GameCenterMetrics.fieldRadius}px`,
      background: gkTile('GKAliasShadowTexture'),
      border: `${GameCenterMetrics.fieldBorder}px solid ${GameCenterPalette.fieldBorder}`,
      'box-shadow': GameCenterPalette.statusInnerShadow
    }}
    onClick={() => props.onFocus()}
  >
    <Show when={props.label}>
      {(text) => (
        <span
          style={{
            'font-family': GameCenterFonts.clarendon,
            'font-size': `${GameCenterMetrics.fieldFontSize}px`,
            'line-height': '1',
            color: GameCenterPalette.white,
            'text-shadow': GameCenterPalette.whiteShadow
          }}
        >
          {text()}
        </span>
      )}
    </Show>

    <span
      style={{
        'font-family': GameCenterFonts.clarendon,
        'font-size': `${GameCenterMetrics.fieldFontSize}px`,
        'line-height': '1',
        color: props.value === '' ? GameCenterPalette.fieldPlaceholder : GameCenterPalette.white,
        'text-shadow': GameCenterPalette.statusShadow
      }}
    >
      {props.value === '' ? props.placeholder : props.value}
    </span>

    <Show when={props.focused}>
      <div
        style={{
          width: `${GameCenterMetrics.caretWidth}px`,
          height: `${GameCenterMetrics.caretHeight}px`,
          background: GameCenterPalette.caret
        }}
      />
    </Show>
  </button>
)
