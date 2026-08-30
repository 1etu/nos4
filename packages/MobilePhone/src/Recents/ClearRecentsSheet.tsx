import { HelveticaNeue, PhoneMetrics, PhonePalette } from '../Support/PhoneMetrics'

const SheetButton = (props: {
  title: string
  face: string
  faceStroke: string
  shadow: string
  onPress: () => void
}) => (
  <button
    type="button"
    class="w-full"
    style={{
      padding: `0 ${PhoneMetrics.clearSheetButtonInsetX}px`,
      height: `${PhoneMetrics.clearSheetButtonHeight}px`
    }}
    onClick={() => props.onPress()}
  >
    <div
      class="flex h-full w-full items-center justify-center"
      style={{
        'border-radius': `${PhoneMetrics.clearSheetFrameRadius}px`,
        background: PhonePalette.sheetFrameStroke,
        padding: `${PhoneMetrics.clearSheetFrameStroke}px`,
        'box-shadow': 'inset 0 0.33px 1.67px rgba(0,0,0,1)'
      }}
    >
      <div
        class="flex h-full w-full items-center justify-center"
        style={{
          'border-radius': `${PhoneMetrics.clearSheetFrameRadius - PhoneMetrics.clearSheetFrameStroke}px`,
          background: PhonePalette.sheetFrameFill,
          padding: `${PhoneMetrics.clearSheetFacePadding}px`
        }}
      >
        <div
          class="flex h-full w-full items-center justify-center"
          style={{
            'border-radius': `${PhoneMetrics.clearSheetFaceRadius}px`,
            background: props.faceStroke,
            padding: `${PhoneMetrics.clearSheetFaceStroke}px`
          }}
        >
          <div
            class="flex h-full w-full items-center justify-center"
            style={{
              'border-radius': `${PhoneMetrics.clearSheetFaceRadius - PhoneMetrics.clearSheetFaceStroke}px`,
              background: props.face
            }}
          >
            <span
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${PhoneMetrics.clearSheetButtonFontSize}px`,
                'font-weight': '700',
                color: 'white',
                'text-shadow': props.shadow
              }}
            >
              {props.title}
            </span>
          </div>
        </div>
      </div>
    </div>
  </button>
)

export const ClearRecentsSheet = (props: { onClear: () => void; onCancel: () => void }) => (
  <div
    class="flex w-full flex-col"
    style={{
      height: `${PhoneMetrics.clearSheetRatio * 100}%`,
      background: PhonePalette.sheetBody
    }}
  >
    <div
      class="w-full shrink-0"
      style={{
        height: `${PhoneMetrics.clearSheetGripHeight}px`,
        background: `${PhonePalette.sheetGripHighlight} top / 100% ${PhoneMetrics.clearSheetGripHighlightHeight}px no-repeat, ${PhonePalette.sheetGrip}`,
        'border-top': '1px solid black'
      }}
    />

    <div
      class="flex min-h-0 flex-1 flex-col"
      style={{
        'padding-top': `${PhoneMetrics.clearSheetTopPadding}px`,
        'padding-bottom': `${PhoneMetrics.clearSheetBottomPadding}px`
      }}
    >
      <SheetButton
        title="Clear All Recents"
        face={PhonePalette.sheetDestructive}
        faceStroke={PhonePalette.sheetDestructiveStroke}
        shadow="0 -0.6px 0 rgba(0,0,0,0.6)"
        onPress={() => props.onClear()}
      />
      <div class="flex-1" style={{ 'min-height': `${PhoneMetrics.clearSheetGap}px` }} />
      <SheetButton
        title="Cancel"
        face={PhonePalette.sheetCancel}
        faceStroke={PhonePalette.sheetCancelStroke}
        shadow="0 -0.9px 0 rgba(0,0,0,0.9)"
        onPress={() => props.onCancel()}
      />
    </div>
  </div>
)
