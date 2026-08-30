import { avOutputVolume, avSetOutputVolume } from 'AVFoundation'
import { CGImage } from 'CoreGraphics'
import { UIScrollView, UISlider, UITableGroup, UITableGroupHeader, UITableRow } from 'UIKit'
import { PreferencesMetrics } from '../Support/PreferencesMetrics'
import { PreferencesFootnote, PreferencesSection } from '../Rows/PreferencesSection'
import { PreferencesAccessory, type PreferencesSectionSpec } from '../Support/PreferencesTypes'

const silentSection: PreferencesSectionSpec = {
  id: 'silent',
  header: 'Silent',
  rows: [
    {
      id: 'silentVibrate',
      title: 'Vibrate',
      accessory: PreferencesAccessory.toggle,
      defaultsKey: 'silentVibrate',
      defaultOn: true
    }
  ]
}

const changeWithButtons: PreferencesSectionSpec = {
  id: 'changeWithButtons',
  rows: [
    {
      id: 'changeWithButtons',
      title: 'Change with Buttons',
      accessory: PreferencesAccessory.toggle,
      defaultsKey: 'changeWithButtons',
      defaultOn: true
    }
  ]
}

const toneRow = (id: string, title: string, value?: string): PreferencesSectionSpec['rows'][number] =>
  value
    ? { id, title, value, accessory: PreferencesAccessory.chevron }
    : {
        id,
        title,
        accessory: PreferencesAccessory.toggle,
        defaultsKey: id,
        defaultOn: true
      }

const tonesSection: PreferencesSectionSpec = {
  id: 'tones',
  rows: [
    toneRow('ringerVibrate', 'Vibrate'),
    toneRow('ringtone', 'Ringtone', 'Marimba'),
    toneRow('textTone', 'Text Tone', 'Tri-tone'),
    toneRow('newVoicemail', 'New Voicemail'),
    toneRow('newMail', 'New Mail'),
    toneRow('sentMail', 'Sent Mail'),
    toneRow('calendarAlerts', 'Calendar Alerts'),
    toneRow('lockSounds', 'Lock Sounds'),
    toneRow('keyboardClicks', 'Keyboard Clicks')
  ]
}

export const PreferencesSoundsPage = (props: { onOpen: (id: string) => void }) => (
  <UIScrollView class="h-full w-full">
    <div
      class="flex flex-col"
      style={{
        gap: `${PreferencesMetrics.sectionSpacing}px`,
        'padding-top': `${PreferencesMetrics.topSpacing}px`,
        'padding-bottom': `${PreferencesMetrics.bottomSpacing}px`
      }}
    >
      <PreferencesSection section={silentSection} onOpen={props.onOpen} />

      <div class="flex flex-col" style={{ gap: `${PreferencesMetrics.topSpacing / 2}px` }}>
        <UITableGroupHeader title="Ringer and Alerts" />
        <UITableGroup>
          <UITableRow separator>
            <div
              class="flex h-full w-full items-center"
              style={{ padding: `0 ${PreferencesMetrics.accessoryInset}px` }}
            >
              <UISlider
                value={avOutputVolume()}
                onInput={avSetOutputVolume}
                leading={<CGImage name="SpeakerMute" />}
                trailing={<CGImage name="SpeakerMax" />}
              />
            </div>
          </UITableRow>
        </UITableGroup>
        <PreferencesSection section={changeWithButtons} onOpen={props.onOpen} />
        <PreferencesFootnote text={'The volume of the ringer and alerts can\n be adjusted using the volume buttons.'} />
      </div>

      <PreferencesSection section={tonesSection} onOpen={props.onOpen} />
    </div>
  </UIScrollView>
)
