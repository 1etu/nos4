import { ContactsMetrics, ContactsPalette } from '../Support/ContactsMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"
const HeaderHeight = 22

export const ContactsSectionHeader = (props: { letter: string }) => (
  <div
    class="relative flex w-full items-center"
    style={{
      height: `${HeaderHeight}px`,
      background: ContactsPalette.sectionHeader
    }}
  >
    <div
      class="pointer-events-none absolute inset-x-0 top-0"
      style={{
        height: `${ContactsMetrics.headerTopBorderOuter}px`,
        background: ContactsPalette.sectionHeaderTopOuter
      }}
    />
    <div
      class="pointer-events-none absolute inset-x-0 top-0"
      style={{
        height: `${ContactsMetrics.headerTopBorderInner}px`,
        background: ContactsPalette.sectionHeaderTopInner
      }}
    />
    <span
      class="relative"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${ContactsMetrics.headerFontSize}px`,
        'font-weight': '700',
        'line-height': `${HeaderHeight}px`,
        color: 'white',
        'text-shadow': ContactsPalette.headerTextShadow,
        'padding-left': `${ContactsMetrics.headerLetterInset}px`
      }}
    >
      {props.letter}
    </span>
  </div>
)
