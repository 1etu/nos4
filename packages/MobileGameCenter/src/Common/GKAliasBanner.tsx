import {
  GameCenterFonts,
  GameCenterMetrics,
  GameCenterPalette
} from '../Support/GameCenterMetrics'
import { gkAliasFontSize } from '../Support/GKAliasFit'
import { gkTexturedText } from './GKTexture'

const bannerText = (size: number) =>
  ({
    'font-family': GameCenterFonts.phosphate,
    'font-size': `${size}px`,
    'line-height': '1',
    'white-space': 'nowrap'
  }) as const

export const GKAliasBanner = (props: { alias: string; width: number }) => {
  const size = () => gkAliasFontSize(props.alias, props.width)

  return (
    <div
      class="relative flex w-full items-center justify-center overflow-hidden"
      style={{ height: `${GameCenterMetrics.aliasHeight}px` }}
    >
      <span
        class="absolute"
        style={{
          ...bannerText(size()),
          ...gkTexturedText('GKAliasShadowTexture'),
          transform: `translate(${GameCenterMetrics.aliasShadowOffset}px, ${GameCenterMetrics.aliasShadowOffset}px)`,
          filter: GameCenterPalette.aliasShadow
        }}
      >
        {props.alias}
      </span>
      <span class="absolute" style={{ ...bannerText(size()), ...gkTexturedText('GKAliasTexture') }}>
        {props.alias}
      </span>
    </div>
  )
}
