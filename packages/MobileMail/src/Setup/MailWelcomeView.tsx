import { For } from 'solid-js'
import { CGImage, type AssetName } from 'CoreGraphics'
import { UIScrollView } from 'UIKit'
import { MailMetrics, MailPalette } from '../Support/MailMetrics'
import { MailProvider, type MailProviderValue } from '../Support/MailTypes'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"
const LogoHeight = 34

interface ProviderSpec {
  readonly value: MailProviderValue
  readonly logo?: AssetName
  readonly label?: string
}

const Providers: readonly ProviderSpec[] = [
  { value: MailProvider.exchange, logo: 'exchange' },
  { value: MailProvider.mobileme, logo: 'mobileme' },
  { value: MailProvider.gmail, logo: 'gmail' },
  { value: MailProvider.yahoo, logo: 'yahoo' },
  { value: MailProvider.aol, logo: 'aol' },
  { value: MailProvider.other, label: 'Other' }
]

export const MailWelcomeView = (props: { onSelect: (provider: MailProviderValue) => void }) => (
  <div class="h-full w-full" style={{ background: MailPalette.settingsBackdrop }}>
    <UIScrollView class="h-full w-full">
      <div style={{ 'padding-top': `${MailMetrics.listTopSpacing}px` }}>
        <div style={{ padding: `0 ${MailMetrics.cardInsetX}px` }}>
          <div
            class="overflow-hidden"
            style={{
              background: 'white',
              'border-radius': `${MailMetrics.cardRadius}px`,
              border: `${MailMetrics.cardStroke}px solid ${MailPalette.cardStroke}`
            }}
          >
            <For each={Providers}>
              {(provider, at) => (
                <button
                  type="button"
                  class="flex w-full items-center justify-center"
                  style={{
                    height: `${MailMetrics.providerRowHeight}px`,
                    'border-bottom':
                      at() < Providers.length - 1
                        ? `${MailMetrics.cardStroke}px solid ${MailPalette.cardStroke}`
                        : 'none'
                  }}
                  onClick={() => props.onSelect(provider.value)}
                >
                  {provider.logo ? (
                    <CGImage
                      name={provider.logo}
                      style={{ height: `${LogoHeight}px`, width: 'auto' }}
                    />
                  ) : (
                    <span
                      style={{
                        'font-family': HelveticaNeue,
                        'font-size': '24px',
                        'font-weight': '700',
                        color: 'black'
                      }}
                    >
                      {provider.label}
                    </span>
                  )}
                </button>
              )}
            </For>
          </div>
        </div>
      </div>
    </UIScrollView>
  </div>
)
