export const GSHandPhase = {
  down: 'M_GS_HND_DOWN',
  dragged: 'M_GS_HND_DRAGGED',
  up: 'M_GS_HND_UP',
  canceled: 'M_GS_HND_CANCELED'
} as const

export type GSHandPhaseValue = (typeof GSHandPhase)[keyof typeof GSHandPhase]

export const GSScrollPhase = {
  idle: 'M_SCR_PHS_IDLE',
  tracking: 'M_SCR_PHS_TRACKING',
  dragging: 'M_SCR_PHS_DRAGGING',
  decelerating: 'M_SCR_PHS_DECELERATING',
  bouncing: 'M_SCR_PHS_BOUNCING'
} as const

export type GSScrollPhaseValue = (typeof GSScrollPhase)[keyof typeof GSScrollPhase]
