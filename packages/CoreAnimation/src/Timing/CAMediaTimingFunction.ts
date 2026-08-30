export const CAMediaTimingFunction = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
  easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)'
} as const

export type CATimingFunction = (typeof CAMediaTimingFunction)[keyof typeof CAMediaTimingFunction]
