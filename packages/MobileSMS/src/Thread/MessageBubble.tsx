import type { JSX } from 'solid-js'
import { MessagesMetrics, MessagesPalette } from '../Support/MessagesMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const TailBox = { width: 13, height: 18 } as const
const TailFill = 'M0 0c0.6 8 3.6 13.8 13 16.6C8 18 3.5 18 0 18Z'
const TailEdge = 'M0 0c0.6 8 3.6 13.8 13 16.6C8 18 3.5 18 0 18'
const TailReach = MessagesMetrics.tailWidth - MessagesMetrics.tailOverlap

const tailPlacement = (outgoing: boolean): JSX.CSSProperties =>
  outgoing
    ? { right: `${-TailReach}px` }
    : { left: `${-TailReach}px`, transform: 'scaleX(-1)' }

const bubbleGeometry = (outgoing: boolean): JSX.CSSProperties =>
  outgoing
    ? {
        'margin-right': `${TailReach}px`,
        'border-radius': `${MessagesMetrics.bubbleRadius}px ${MessagesMetrics.bubbleRadius}px ${MessagesMetrics.tailCornerRadius}px ${MessagesMetrics.bubbleRadius}px`
      }
    : {
        'margin-left': `${TailReach}px`,
        'border-radius': `${MessagesMetrics.bubbleRadius}px ${MessagesMetrics.bubbleRadius}px ${MessagesMetrics.bubbleRadius}px ${MessagesMetrics.tailCornerRadius}px`
      }

const Tail = (props: { outgoing: boolean; id: string }) => (
  <svg
    class="pointer-events-none absolute"
    viewBox={`0 0 ${TailBox.width} ${TailBox.height}`}
    style={{
      bottom: '0',
      width: `${MessagesMetrics.tailWidth}px`,
      height: `${MessagesMetrics.tailHeight}px`,
      ...tailPlacement(props.outgoing)
    }}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id={props.id} x1="0" y1="0" x2="0" y2="1">
        <stop
          offset="0"
          stop-color={props.outgoing ? MessagesPalette.outgoingHem : MessagesPalette.incomingHem}
        />
        <stop
          offset="1"
          stop-color={props.outgoing ? MessagesPalette.outgoingTail : MessagesPalette.incomingTail}
        />
      </linearGradient>
    </defs>
    <path d={TailFill} fill={`url(#${props.id})`} />
    <path
      d={TailEdge}
      fill="none"
      stroke={props.outgoing ? MessagesPalette.outgoingStroke : MessagesPalette.incomingStroke}
      stroke-width="1"
    />
  </svg>
)

export const MessageBubble = (props: {
  text: string
  outgoing: boolean
  width: number
  tailId: string
}) => (
  <div
    class="flex w-full"
    style={{
      'justify-content': props.outgoing ? 'flex-end' : 'flex-start',
      padding: `0 ${MessagesMetrics.bubbleInsetX}px`,
      'margin-top': `${MessagesMetrics.bubbleGap}px`
    }}
  >
    <div
      class="relative"
      style={{
        'max-width': `${props.width * MessagesMetrics.bubbleWidthRatio}px`,
        padding: `${MessagesMetrics.bubblePaddingY}px ${MessagesMetrics.bubblePaddingX}px`,
        background: props.outgoing ? MessagesPalette.outgoingFace : MessagesPalette.incomingFace,
        border: `1px solid ${props.outgoing ? MessagesPalette.outgoingStroke : MessagesPalette.incomingStroke}`,
        'box-shadow': '0 1px 1px rgba(0,0,0,0.13)',
        'font-family': HelveticaNeue,
        'font-size': `${MessagesMetrics.bubbleFontSize}px`,
        'line-height': `${MessagesMetrics.bubbleLineHeight}`,
        color: props.outgoing ? MessagesPalette.outgoingText : MessagesPalette.incomingText,
        'white-space': 'pre-wrap',
        'word-break': 'break-word',
        ...bubbleGeometry(props.outgoing)
      }}
    >
      {props.text}
      <Tail outgoing={props.outgoing} id={props.tailId} />
    </div>
  </div>
)
