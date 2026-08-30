import { For, createSignal } from 'solid-js'
import { ContactsAlphabet, ContactsMetrics, ContactsPalette } from '../Support/ContactsMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const Magnifier = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <circle cx="5" cy="5" r="3.6" stroke={ContactsPalette.indexInk} stroke-width="1.4" />
    <path
      d="M7.8 7.8 L11 11"
      stroke={ContactsPalette.indexInk}
      stroke-width="1.4"
      stroke-linecap="round"
    />
  </svg>
)

export const ContactsIndexStrip = (props: {
  available: readonly string[]
  onJump: (letter: string) => void
}) => {
  const [pressed, setPressed] = createSignal(false)
  let strip!: HTMLDivElement

  const jumpAt = (clientY: number) => {
    const box = strip.getBoundingClientRect()
    const usable = box.height - ContactsMetrics.indexDragFudge
    const step = usable / ContactsAlphabet.length
    const index = Math.floor((clientY - box.top) / step)
    const letter = ContactsAlphabet[Math.min(Math.max(index, 0), ContactsAlphabet.length - 1)]
    if (!letter) return
    if (letter !== 'Search' && !props.available.includes(letter)) return
    props.onJump(letter)
  }

  const onMove = (event: PointerEvent) => jumpAt(event.clientY)

  const onUp = () => {
    setPressed(false)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }

  const onDown = (event: PointerEvent) => {
    setPressed(true)
    jumpAt(event.clientY)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div
      ref={strip}
      class="absolute right-0 top-0 flex flex-col items-center justify-center"
      style={{
        height: '100%',
        'padding-right': `${ContactsMetrics.indexTrailing}px`,
        'touch-action': 'none',
        'z-index': '2'
      }}
      onPointerDown={onDown}
    >
      <div
        class="absolute"
        style={{
          right: `${ContactsMetrics.indexCapsuleTrailing}px`,
          top: `${ContactsMetrics.indexCapsuleInsetY}px`,
          bottom: `${ContactsMetrics.indexCapsuleInsetY}px`,
          width: `${ContactsMetrics.indexCapsuleWidth}px`,
          'border-radius': `${ContactsMetrics.indexCapsuleRadius}px`,
          background: ContactsPalette.indexCapsule,
          opacity: pressed() ? '1' : '0'
        }}
      />
      <div class="relative flex flex-col items-center" style={{ gap: '2px' }}>
        <For each={ContactsAlphabet}>
          {(letter) => (
            <div
              class="flex items-center justify-center"
              style={{
                width: `${ContactsMetrics.indexLetterWidth}px`,
                height: `${ContactsMetrics.indexLetterHeight}px`,
                'font-family': HelveticaNeue,
                'font-size': `${ContactsMetrics.indexFontSize}px`,
                'font-weight': '700',
                'line-height': `${ContactsMetrics.indexLetterHeight}px`,
                color: ContactsPalette.indexInk
              }}
            >
              {letter === 'Search' ? <Magnifier /> : letter}
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
