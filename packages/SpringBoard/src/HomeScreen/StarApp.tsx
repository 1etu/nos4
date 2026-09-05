import { assetURL } from 'CoreGraphics'
import { SpringBoardMetrics } from '../Support/SpringBoardMetrics'

export const StarApp = () => (
  <a
    href='https://github.com/1etu/nos4'
    target='_blank'
    rel='noopener noreferrer'
    aria-label='Star! Open source code on GitHub'
    class='relative flex flex-col items-center'
    style={{
      width: `${SpringBoardMetrics.cellWidth}px`,
      gap: `${SpringBoardMetrics.iconLabelSpacing}px`,
      'text-decoration': 'none'
    }}
  >
    <img src={assetURL('GitHubOriginal')} alt='' draggable={false} style={{
      width: `${SpringBoardMetrics.iconSize}px`,
      height: `${SpringBoardMetrics.iconSize}px`,
      'object-fit': 'contain',
      background: 'white',
      'border-radius': `${SpringBoardMetrics.iconPressedRadius}px`,
      'box-shadow': '0 2px 3px rgba(0,0,0,0.5)'
    }} />
    <span style={{
      color: 'white',
      'font-family': "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      'font-size': `${SpringBoardMetrics.labelFontSize}px`,
      'font-weight': '500',
      'text-shadow': `0 ${SpringBoardMetrics.labelShadowOffsetY}px ${SpringBoardMetrics.labelShadowBlur}px rgba(0,0,0,0.9)`,
      transform: `translateY(${SpringBoardMetrics.labelOffsetY}px)`
    }}>Star!</span>
  </a>
)
