import { createSignal } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UIKeyboardCredential, UIKeyboardStandard, UIKeyboardView } from 'TextInput'
import {
  GameCenterFonts,
  GameCenterMetrics,
  GameCenterPalette
} from '../Support/GameCenterMetrics'
import { GKField } from '../Common/GKField'
import { GKRibbonButton } from '../Common/GKRibbonButton'

type WelcomeField = 'nickname' | 'password'

const Intro =
  'Start using Game Center with a nickname and play games online with your friends, wherever they are.'

export const GKWelcomeView = (props: {
  width: number
  submitting: boolean
  onSignIn: (nickname: string, password: string) => void
  onCreate: (nickname: string, password: string) => void
}) => {
  const [nickname, setNickname] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [field, setField] = createSignal<WelcomeField | undefined>()

  const current = () => (field() === 'password' ? password() : nickname())
  const write = (next: string) => {
    if (field() === 'password') setPassword(next)
    if (field() === 'nickname') setNickname(next)
  }

  const submit = (send: (nickname: string, password: string) => void) => {
    if (props.submitting) return
    if (nickname().trim() === '' || password() === '') return
    setField(undefined)
    send(nickname().trim(), password())
  }

  return (
    <div class="flex h-full w-full flex-col overflow-hidden">
      <div
        class="flex shrink-0"
        style={{
          margin: `${GameCenterMetrics.panelInset}px`,
          padding: `${GameCenterMetrics.panelPadding}px`,
          gap: `${GameCenterMetrics.panelPadding}px`,
          'border-radius': `${GameCenterMetrics.panelRadius}px`,
          background: GameCenterPalette.panel,
          border: `${GameCenterMetrics.fieldBorder}px solid ${GameCenterPalette.fieldBorder}`
        }}
      >
        <div class="flex min-w-0 flex-1 flex-col" style={{ gap: `${GameCenterMetrics.panelGap}px` }}>
          <span
            style={{
              color: GameCenterPalette.white,
              'font-family': GameCenterFonts.phosphate,
              'font-size': `${GameCenterMetrics.panelTitleFontSize}px`,
              'line-height': '1',
              'white-space': 'nowrap'
            }}
          >
            GAME CENTER
          </span>
          <span
            style={{
              'font-family': GameCenterFonts.clarendon,
              'font-size': `${GameCenterMetrics.panelBodyFontSize}px`,
              'line-height': '1.25',
              color: GameCenterPalette.white
            }}
          >
            {Intro}
          </span>
        </div>
        <CGImage
          name="Game_Center"
          class="shrink-0"
          style={{
            width: `${GameCenterMetrics.panelIconSize}px`,
            height: `${GameCenterMetrics.panelIconSize}px`
          }}
        />
      </div>

      <GKField
        value={nickname()}
        placeholder="Nickname"
        focused={field() === 'nickname'}
        onFocus={() => setField('nickname')}
      />
      <div style={{ height: `${GameCenterMetrics.fieldGap}px` }} />
      <GKField
        value={password().replace(/./g, '•')}
        placeholder="Password"
        focused={field() === 'password'}
        onFocus={() => setField('password')}
      />

      <div style={{ height: `${GameCenterMetrics.panelInset}px` }} />

      <div class="flex justify-center">
        <GKRibbonButton
          width={props.width}
          text={props.submitting ? 'Signing In' : 'Sign In'}
          onPress={() => submit(props.onSignIn)}
        />
      </div>

      <div style={{ height: `${GameCenterMetrics.panelInset}px` }} />

      <div class="flex justify-center">
        <GKRibbonButton
          width={props.width}
          text="Create New Account"
          onPress={() => submit(props.onCreate)}
        />
      </div>

      <div class="flex-1" />

      <UIKeyboardView
        visible={field() !== undefined}
        width={props.width}
        configuration={field() === 'password' ? UIKeyboardCredential : UIKeyboardStandard}
        onInsert={(text) => write(current() + text)}
        onDelete={() => write(current().slice(0, -1))}
        onReturn={() => setField(field() === 'nickname' ? 'password' : undefined)}
      />
    </div>
  )
}
