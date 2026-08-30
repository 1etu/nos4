import { For } from 'solid-js'
import { ClockPalette } from '../Support/ClockMetrics'
import type { ClockReading } from '../Support/ClockTime'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const FaceUnits = 100
const Centre = FaceUnits / 2
const NumeralRadius = 37.5
const NumeralFontSize = 12.4
const HourLength = 20
const HourHalfWidth = 3
const MinuteLength = 32.5
const MinuteHalfWidth = 2.6
const HandTail = 3
const SecondLength = 39
const SecondHalfWidth = 0.5
const SecondTail = 8
const HubRadius = 2.5
const Numerals = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

const Hand = (props: {
  angle: number
  length: number
  halfWidth: number
  tail: number
  fill: string
}) => (
  <polygon
    points={`0,${-props.length} ${props.halfWidth},${props.tail} ${-props.halfWidth},${props.tail}`}
    fill={props.fill}
    transform={`rotate(${props.angle})`}
  />
)

export const ClockFace = (props: { size: number; reading: ClockReading; night: boolean }) => {
  const hourAngle = () =>
    (props.reading.hours % 12) * 30 + props.reading.minutes * 0.5 + props.reading.seconds / 120
  const minuteAngle = () => props.reading.minutes * 6 + props.reading.seconds * 0.1
  const secondAngle = () => props.reading.seconds * 6
  const numeralColour = () => (props.night ? ClockPalette.nightNumeral : ClockPalette.dayNumeral)
  const handColour = () => (props.night ? ClockPalette.nightHand : ClockPalette.dayHand)

  return (
    <div
      class="relative shrink-0 overflow-hidden"
      style={{
        width: `${props.size}px`,
        height: `${props.size}px`,
        'border-radius': '50%',
        background: props.night ? ClockPalette.nightFace : ClockPalette.dayFace,
        'box-shadow': `${ClockPalette.faceShadow}, ${ClockPalette.faceRim}`
      }}
    >
      <svg
        class="absolute inset-0"
        width={props.size}
        height={props.size}
        viewBox={`0 0 ${FaceUnits} ${FaceUnits}`}
        aria-hidden="true"
      >
        <g transform={`translate(${Centre} ${Centre})`}>
          <For each={Numerals}>
            {(numeral) => (
              <text
                x={NumeralRadius * Math.sin((numeral * Math.PI) / 6)}
                y={-NumeralRadius * Math.cos((numeral * Math.PI) / 6)}
                fill={numeralColour()}
                font-family={HelveticaNeue}
                font-size={`${NumeralFontSize}`}
                text-anchor="middle"
                dominant-baseline="central"
              >
                {numeral}
              </text>
            )}
          </For>
          <Hand
            angle={hourAngle()}
            length={HourLength}
            halfWidth={HourHalfWidth}
            tail={HandTail}
            fill={handColour()}
          />
          <Hand
            angle={minuteAngle()}
            length={MinuteLength}
            halfWidth={MinuteHalfWidth}
            tail={HandTail}
            fill={handColour()}
          />
          <rect
            x={-SecondHalfWidth}
            y={-SecondLength}
            width={SecondHalfWidth * 2}
            height={SecondLength + SecondTail}
            fill={ClockPalette.secondHand}
            transform={`rotate(${secondAngle()})`}
          />
          <circle cx={0} cy={0} r={HubRadius} fill={ClockPalette.secondHand} />
        </g>
      </svg>
    </div>
  )
}
