import { createSignal, type JSX } from 'solid-js'

const PressedOpacity = 0.55
const PressedScale = 0.94
const PressDuration = 0.08

export const PressableButton = (props: {
  onClick?: () => void
  disabled?: boolean
  label?: string
  scale?: boolean
  class?: string
  style?: JSX.CSSProperties
  children: JSX.Element
}) => {
  const [pressed, setPressed] = createSignal(false)

  const release = () => setPressed(false)

  return (
    <button
      type="button"
      disabled={props.disabled}
      aria-label={props.label}
      class={props.class}
      style={{
        opacity: `${pressed() ? PressedOpacity : 1}`,
        transform: pressed() && props.scale !== false ? `scale(${PressedScale})` : 'scale(1)',
        transition: `opacity ${PressDuration}s linear, transform ${PressDuration}s linear`,
        'touch-action': 'none',
        ...props.style
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onClick={() => props.onClick?.()}
    >
      {props.children}
    </button>
  )
}
