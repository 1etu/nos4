import { createSignal } from 'solid-js'
import { UIScrollView, UISwitch } from 'UIKit'
import { UIKeyboardStandard, UIKeyboardView } from 'TextInput'
import { gkAliasIsWellFormed } from 'GameKit'
import {
  GameCenterFonts,
  GameCenterMetrics,
  GameCenterPalette
} from '../Support/GameCenterMetrics'
import { GKField } from '../Common/GKField'

const IdentityBody =
  'Your nickname is how every other player will know you. It is publicly visible, it must be unique, and it is the name you sign in with.'
const SettingsBody =
  'If Allow Game Invites is turned on, other users will be able to invite you to a game. You will receive an alert when this happens.'

const Heading = (props: { text: string }) => (
  <span
    class="w-full"
    style={{
      'font-family': GameCenterFonts.clarendon,
      'font-size': `${GameCenterMetrics.headingFontSize}px`,
      'line-height': '1.2',
      color: GameCenterPalette.heading,
      'text-shadow': GameCenterPalette.whiteShadow
    }}
  >
    {props.text}
  </span>
)

const Body = (props: { text: string }) => (
  <span
    class="w-full"
    style={{
      'font-family': GameCenterFonts.clarendon,
      'font-size': `${GameCenterMetrics.bodyFontSize}px`,
      'line-height': '1.3',
      color: GameCenterPalette.greenText,
      'text-shadow': GameCenterPalette.greenTextShadow
    }}
  >
    {props.text}
  </span>
)

export const GKCreateProfileView = (props: {
  width: number
  nickname: string
  onNickname: (value: string) => void
  onDone: () => void
}) => {
  const [invites, setInvites] = createSignal(true)
  const [editing, setEditing] = createSignal(false)

  return (
    <div class="flex h-full w-full flex-col overflow-hidden">
      <UIScrollView class="min-h-0 flex-1">
        <div
          class="flex w-full flex-col"
          style={{
            padding: `${GameCenterMetrics.panelInset}px`,
            gap: `${GameCenterMetrics.panelGap}px`
          }}
        >
          <Heading text="Game Center Identity" />
          <Body text={IdentityBody} />
        </div>

        <GKField
          label="Nickname"
          value={props.nickname}
          placeholder="Required"
          focused={editing()}
          onFocus={() => setEditing(true)}
        />

        <div
          class="flex w-full flex-col"
          style={{
            padding: `${GameCenterMetrics.panelInset}px`,
            gap: `${GameCenterMetrics.panelGap}px`
          }}
        >
          <Heading text="Game Center Settings" />
          <Body text={SettingsBody} />
        </div>

        <div
          class="flex items-center justify-between"
          style={{
            height: `${GameCenterMetrics.fieldHeight}px`,
            margin: `0 ${GameCenterMetrics.fieldInsetX}px`,
            padding: `0 ${GameCenterMetrics.fieldPaddingX}px`,
            'border-radius': `${GameCenterMetrics.fieldRadius}px`,
            border: `${GameCenterMetrics.fieldBorder}px solid ${GameCenterPalette.fieldBorder}`
          }}
        >
          <span
            style={{
              'font-family': GameCenterFonts.clarendon,
              'font-size': `${GameCenterMetrics.fieldFontSize}px`,
              'line-height': '1',
              color: GameCenterPalette.white,
              'text-shadow': GameCenterPalette.whiteShadow
            }}
          >
            Allow Game Invites
          </span>
          <UISwitch on={invites()} onChange={setInvites} />
        </div>

      </UIScrollView>

      <UIKeyboardView
        visible={editing()}
        width={props.width}
        configuration={UIKeyboardStandard}
        onInsert={(text) => props.onNickname(props.nickname + text)}
        onDelete={() => props.onNickname(props.nickname.slice(0, -1))}
        onReturn={() => {
          setEditing(false)
          if (gkAliasIsWellFormed(props.nickname)) props.onDone()
        }}
      />
    </div>
  )
}
