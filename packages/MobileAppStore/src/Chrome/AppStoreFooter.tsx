import { Show } from 'solid-js'
import { AppStoreMetrics, AppStorePalette } from '../Support/AppStoreMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const RedeemTitle = 'Redeem'
const AccountTitle = 'Apple ID: nos4@mac.com'
const MediaTerms = 'Apple Media Services Terms and\nConditions...'
const StoreTerms = 'iTunes Store Terms and Conditions...'

const Pill = (props: { width: number; title: string; light: boolean }) => (
  <div
    class="flex shrink-0 items-center justify-center"
    style={{
      width: `${props.width - AppStoreMetrics.footerPillInset}px`,
      height: `${AppStoreMetrics.footerPillHeight}px`,
      'border-radius': `${AppStoreMetrics.footerPillRadius}px`,
      background: props.light ? AppStorePalette.footerPillLight : AppStorePalette.footerPillDark,
      border: `${AppStoreMetrics.footerPillStroke}px solid ${AppStorePalette.footerPillStroke}`,
      'box-shadow': AppStorePalette.footerPillShadow
    }}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${AppStoreMetrics.footerPillFontSize}px`,
        'font-weight': '700',
        'line-height': '1',
        'white-space': 'nowrap',
        color: 'black',
        'text-shadow': AppStorePalette.rowTextShadow
      }}
    >
      {props.title}
    </span>
  </div>
)

export const AppStoreFooter = (props: { width: number; light: boolean }) => (
  <div class="flex w-full flex-col items-center">
    <div style={{ height: `${AppStoreMetrics.listBottomSpacer}px` }} />

    <Show when={props.light}>
      <Pill width={props.width} title={RedeemTitle} light={props.light} />
      <div style={{ height: `${AppStoreMetrics.footerPillGap}px` }} />
    </Show>

    <Pill width={props.width} title={AccountTitle} light={props.light} />

    <div style={{ height: `${AppStoreMetrics.footerTermsGap}px` }} />

    <span
      class="text-center"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${AppStoreMetrics.footerTermsFontSize}px`,
        'font-weight': '700',
        'line-height': '1.2',
        'white-space': 'pre-line',
        color: props.light ? AppStorePalette.footerTermsLight : AppStorePalette.footerTermsDark,
        'text-shadow': '0 0.9px 0 rgba(255,255,255,0.7)',
        'padding-bottom': `${AppStoreMetrics.footerBottomInset}px`
      }}
    >
      {props.light ? MediaTerms : StoreTerms}
    </span>
  </div>
)
