import { Show } from 'solid-js'
import { CAMediaTimingFunction, caAnimation, caTransition } from 'CoreAnimation'
import { UIAlertMetrics, UIAlertPalette } from './UIAlertMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const presentAnimation = caAnimation(
  UIAlertMetrics.presentDuration,
  CAMediaTimingFunction.easeInOut
)

const AlertButton = (props: { title: string; onClick: () => void }) => (
  <button
    type="button"
    class="relative flex flex-1 items-center justify-center"
    style={{
      height: `${UIAlertMetrics.buttonHeight}px`,
      'border-radius': `${UIAlertMetrics.buttonRadius}px`,
      background: UIAlertPalette.button,
      border: `1px solid ${UIAlertPalette.buttonStroke}`,
      'box-shadow': '0 0.5px 0 rgba(255,255,255,0.2)'
    }}
    onClick={props.onClick}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${UIAlertMetrics.titleFontSize}px`,
        'font-weight': '700',
        color: 'white',
        'text-shadow': '0 -1.2px 0 rgba(0,0,0,0.8)'
      }}
    >
      {props.title}
    </span>
  </button>
)

export const UIAlertView = (props: {
  visible: boolean
  title: string
  message: string
  buttonTitle?: string
  alternateTitle?: string
  onAlternate?: () => void
  onDismiss: () => void
}) => (
  <div
    class="absolute inset-0 flex items-center justify-center overflow-hidden"
    style={{
      opacity: `${props.visible ? 1 : 0}`,
      'pointer-events': props.visible ? 'auto' : 'none',
      background: `rgba(0,0,0,${UIAlertMetrics.dimOpacity})`,
      transition: caTransition(['opacity'], presentAnimation)
    }}
    onClick={props.onDismiss}
  >
    <div
      class="relative flex flex-col items-center"
      style={{
        width: `calc(100% - ${UIAlertMetrics.insetX * 2}px)`,
        'max-height': `${UIAlertMetrics.maxHeight}px`,
        'border-radius': `${UIAlertMetrics.radius}px`,
        background: UIAlertPalette.body,
        border: `${UIAlertMetrics.stroke}px solid transparent`,
        'background-clip': 'padding-box',
        'box-shadow': `0 2px ${UIAlertMetrics.shadowBlur}px rgba(0,0,0,0.75)`,
        transform: `scale(${props.visible ? 1 : UIAlertMetrics.enterScale})`,
        transition: caTransition(['transform'], presentAnimation)
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <div
        class="pointer-events-none absolute inset-0"
        style={{
          'border-radius': `${UIAlertMetrics.radius}px`,
          padding: `${UIAlertMetrics.stroke}px`,
          background: UIAlertPalette.rim,
          '-webkit-mask': 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          '-webkit-mask-composite': 'xor',
          'mask-composite': 'exclude'
        }}
      />
      <div
        class="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: `${UIAlertMetrics.glossHeight}px`,
          'border-radius': `${UIAlertMetrics.radius}px ${UIAlertMetrics.radius}px 0 0`,
          background: UIAlertPalette.gloss,
          opacity: `${UIAlertMetrics.glossOpacity}`
        }}
      />

      <span
        class="relative text-center"
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${UIAlertMetrics.titleFontSize}px`,
          'font-weight': '700',
          color: 'white',
          'text-shadow': '0 -1.2px 0 rgba(0,0,0,0.8)',
          'padding-top': `${UIAlertMetrics.titleTop}px`
        }}
      >
        {props.title}
      </span>

      <span
        class="relative text-center"
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${UIAlertMetrics.messageFontSize}px`,
          'font-weight': '400',
          color: 'white',
          'text-shadow': '0 -1.2px 0 rgba(0,0,0,0.8)',
          padding: `${UIAlertMetrics.messageTop}px ${UIAlertMetrics.messageInsetX}px ${UIAlertMetrics.messageBottom}px`
        }}
      >
        {props.message}
      </span>

      <div
        class="relative flex"
        style={{
          width: `calc(100% - ${UIAlertMetrics.buttonInsetX * 2}px)`,
          'margin-bottom': `${UIAlertMetrics.buttonBottom}px`,
          gap: `${UIAlertMetrics.buttonInsetX}px`
        }}
      >
        <Show when={props.alternateTitle}>
          {(title) => (
            <AlertButton
              title={title()}
              onClick={() => (props.onAlternate ?? props.onDismiss)()}
            />
          )}
        </Show>
        <AlertButton title={props.buttonTitle ?? 'OK'} onClick={props.onDismiss} />
      </div>
    </div>
  </div>
)
