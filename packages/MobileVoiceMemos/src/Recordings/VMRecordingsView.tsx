import { createSignal, For, Show } from 'solid-js'
import { assetURL } from 'CoreGraphics'
import { UIBarButton, UINavigationBar, UIScrollView } from 'UIKit'
import { VMDeleteSheet } from './VMDeleteSheet'
import { VMRecordingInfo } from './VMRecordingInfo'
import { VMRecordingsFooter } from './VMRecordingsFooter'
import { vmShortDuration, type VMRecordingItem } from '../Support/VMLibrary'
import { VMMetrics, VMPalette } from '../Support/VMMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const shortDate = (date: Date): string =>
  date.toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' })

export const VMRecordingsView = (props: {
  recordings: readonly VMRecordingItem[]
  selectedId: string | undefined
  playing: boolean
  currentTime: number
  duration: number
  speaker: boolean
  onSelect: (item: VMRecordingItem) => void
  onTogglePlay: () => void
  onSeek: (seconds: number) => void
  onToggleSpeaker: () => void
  onShare: () => void
  onDelete: () => void
  onDone: () => void
}) => {
  const [info, setInfo] = createSignal<VMRecordingItem | undefined>()
  const [confirming, setConfirming] = createSignal(false)

  return (
    <div class="relative h-full w-full" style={{ background: 'white', overflow: 'hidden' }}>
      <div class="flex h-full w-full flex-col">
        <Show
          when={info()}
          fallback={
            <UINavigationBar
              title="Voice Memos"
              leading={
                <UIBarButton
                  title="Speaker"
                  tone={props.speaker ? 'blue' : 'blueGray'}
                  onClick={props.onToggleSpeaker}
                />
              }
              trailing={<UIBarButton title="Done" tone="blue" onClick={props.onDone} />}
            />
          }
        >
          <UINavigationBar
            title="Info"
            leading={
              <UIBarButton title="Voice Memos" tone="blueGray" onClick={() => setInfo(undefined)} />
            }
          />
        </Show>

        <Show
          when={info()}
          fallback={
            <div class="relative flex-1" style={{ overflow: 'hidden' }}>
              <UIScrollView class="absolute inset-0">
                <For each={props.recordings}>
                  {(item) => {
                    const selected = () => item.id === props.selectedId
                    return (
                      <div
                        style={{
                          height: `${VMMetrics.rowHeight}px`,
                          background: selected() ? VMPalette.rowSelected : 'white',
                          'border-bottom': `${VMMetrics.rowSeparator}px solid ${VMPalette.rowSeparator}`,
                          display: 'flex',
                          'align-items': 'center',
                          'padding-left': `${VMMetrics.rowLeading}px`
                        }}
                        onClick={() => props.onSelect(item)}
                      >
                        <button
                          type="button"
                          style={{
                            width: `${VMMetrics.rowPlayWidth}px`,
                            height: `${VMMetrics.rowPlayHeight}px`,
                            'margin-right': `${VMMetrics.rowPlayTrailing}px`,
                            visibility: selected() ? 'visible' : 'hidden'
                          }}
                          onClick={(event) => {
                            event.stopPropagation()
                            props.onTogglePlay()
                          }}
                        >
                          <img
                            src={assetURL(props.playing ? 'button_pause' : 'button_play')}
                            alt=""
                            draggable={false}
                            class="h-full w-full"
                            style={{ 'object-fit': 'contain' }}
                          />
                        </button>

                        <div
                          class="flex flex-col"
                          style={{ gap: `${VMMetrics.rowTitleSpacing}px`, 'min-width': '0' }}
                        >
                          <span
                            style={{
                              'font-family': HelveticaNeue,
                              'font-size': `${VMMetrics.rowTitleFontSize}px`,
                              'font-weight': '700',
                              'line-height': '1.2',
                              color: selected() ? 'white' : 'black',
                              'white-space': 'nowrap'
                            }}
                          >
                            {item.title}
                          </span>
                          <span
                            style={{
                              'font-family': HelveticaNeue,
                              'font-size': `${VMMetrics.rowDateFontSize}px`,
                              'line-height': '1.2',
                              color: selected() ? 'white' : VMPalette.rowDate,
                              'white-space': 'nowrap'
                            }}
                          >
                            {shortDate(item.date)}
                          </span>
                        </div>

                        <div class="flex-1" />

                        <span
                          style={{
                            'font-family': HelveticaNeue,
                            'font-size': `${VMMetrics.rowDurationFontSize}px`,
                            color: selected() ? 'white' : VMPalette.rowDuration
                          }}
                        >
                          {vmShortDuration(item.duration)}
                        </span>
                        <button
                          type="button"
                          style={{ padding: `0 ${VMMetrics.rowChevronTrailing}px` }}
                          onClick={(event) => {
                            event.stopPropagation()
                            setInfo(item)
                          }}
                        >
                          <img src={assetURL('ABTableNextButton')} alt="" draggable={false} />
                        </button>
                      </div>
                    )
                  }}
                </For>
                <div style={{ height: `${VMMetrics.footerHeight}px` }} />
              </UIScrollView>

              <div class="absolute inset-x-0 bottom-0">
                <VMRecordingsFooter
                  currentTime={props.currentTime}
                  duration={props.duration}
                  onSeek={props.onSeek}
                  onShare={props.onShare}
                  onDelete={() => setConfirming(true)}
                />
              </div>
            </div>
          }
        >
          {(item) => (
            <div class="relative flex-1" style={{ overflow: 'hidden' }}>
              <VMRecordingInfo recording={item()} />
            </div>
          )}
        </Show>
      </div>

      <Show when={confirming()}>
        <div
          class="absolute inset-0"
          style={{ background: `rgba(0,0,0,${VMMetrics.deleteDimOpacity})` }}
        />
        <div class="absolute inset-x-0 bottom-0">
          <VMDeleteSheet
            onDelete={() => {
              setConfirming(false)
              props.onDelete()
            }}
            onCancel={() => setConfirming(false)}
          />
        </div>
      </Show>
    </div>
  )
}
