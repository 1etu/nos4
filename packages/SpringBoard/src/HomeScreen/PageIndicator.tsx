import { For } from 'solid-js'
import { SpringBoardMetrics } from '../Support/SpringBoardMetrics'

const size = SpringBoardMetrics.pageIndicatorSize

const MagnifierDot = (props: { active: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle
      cx="6.6"
      cy="6.6"
      r="5.1"
      stroke={props.active ? 'white' : SpringBoardMetrics.pageIndicatorIdle}
      stroke-width="2.6"
    />
    <path
      d="M10.6 10.6 L15 15"
      stroke={props.active ? 'white' : SpringBoardMetrics.pageIndicatorIdle}
      stroke-width="2.6"
      stroke-linecap="round"
    />
  </svg>
)

export const PageIndicator = (props: {
  page: number
  count: number
  onSelect: (page: number) => void
}) => (
  <div
    class="flex items-center justify-center"
    style={{ gap: `${SpringBoardMetrics.pageIndicatorSpacing}px` }}
  >
    <For each={Array.from({ length: props.count }, (_, index) => index)}>
      {(index) => (
        <button
          type="button"
          class="flex items-center justify-center"
          style={{ width: `${size}px`, height: `${size}px` }}
          onClick={() => props.onSelect(index)}
        >
          {index === 0 ? (
            <MagnifierDot active={props.page === 0} />
          ) : (
            <span
              style={{
                width: `${size}px`,
                height: `${size}px`,
                'border-radius': '9999px',
                background:
                  props.page === index ? 'white' : SpringBoardMetrics.pageIndicatorIdle
              }}
            />
          )}
        </button>
      )}
    </For>
  </div>
)
