import { CGImage } from 'CoreGraphics'
import { MailMetrics } from '../Support/MailMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"
const FieldHeight = 31
const FieldInsetX = 10
const IconSize = 15

export const MailSearchField = (props: { value: string; onInput: (value: string) => void }) => (
  <div
    class="flex items-center"
    style={{
      height: `${MailMetrics.searchRowHeight}px`,
      padding: `0 ${FieldInsetX}px`
    }}
  >
    <div
      class="flex flex-1 items-center"
      style={{
        height: `${FieldHeight}px`,
        background: 'white',
        'border-radius': `${FieldHeight / 2}px`,
        border: '0.33px solid rgb(166,166,166)',
        'box-shadow': 'inset 0 1px 1.6px rgba(0,0,0,0.35)',
        padding: `0 ${FieldInsetX}px`,
        gap: '6px'
      }}
    >
      <CGImage
        name="search_icon"
        style={{ width: `${IconSize}px`, height: `${IconSize}px`, 'flex-shrink': '0' }}
      />
      <input
        type="text"
        value={props.value}
        placeholder="Search"
        class="min-w-0 flex-1 bg-transparent outline-none"
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${MailMetrics.detailFieldFontSize}px`,
          color: 'black'
        }}
        onInput={(event) => props.onInput(event.currentTarget.value)}
      />
    </div>
  </div>
)
