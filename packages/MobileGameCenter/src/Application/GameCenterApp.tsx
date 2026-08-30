import { createSignal, Match, onCleanup, onMount, Show, Switch } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import { UIAlertView, UIScrollView, UIStatusBar } from 'UIKit'
import {
  gkAliasIsWellFormed,
  gkAuthenticate,
  gkIsAuthenticated,
  gkLoadLeaderboard,
  gkLocalPlayer,
  gkSignIn,
  gkSignOut,
  gkSignUp,
  GKPlayerAuthenticationDidChange,
  GKScoreDidSubmit,
  type GKPlayer,
  type GKResult
} from 'GameKit'
import { GKTabBar, type GameCenterTab } from '../Chrome/GKTabBar'
import { GKTitleBar } from '../Chrome/GKTitleBar'
import { GKFriendDetail } from '../Friends/GKFriendDetail'
import { GKFriendsView } from '../Friends/GKFriendsView'
import { GKGamesView } from '../Games/GKGamesView'
import { GKMeView } from '../Me/GKMeView'
import { GKRequestsView } from '../Requests/GKRequestsView'
import { gkTile } from '../Common/GKTexture'
import { GameCenterCatalog } from '../Support/GameCenterCatalog'
import { gkErrorMessage } from '../Support/GameCenterFormat'
import { gameCenterFriends, type GameCenterFriend } from '../Support/GameCenterStore'
import { GKWelcomeView } from '../Welcome/GKWelcomeView'
import { GKCreateProfileView } from '../Welcome/GKCreateProfileView'

const FailureTitle = 'Game Center'
const WelcomeTitle = 'Welcome'
const CreateProfileTitle = 'Create Profile'
const SignOutTitle = 'Sign Out'
const SignOutMessage = 'Your scores stay on the leaderboards. You can sign back in at any time.'
const SignOutCancel = 'Cancel'

const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`

export const GameCenterApp = (props: {
  width: number
  onOpenGame?: (bundleId: string) => void
}) => {
  const [tab, setTab] = createSignal<GameCenterTab>('Me')
  const [friend, setFriend] = createSignal<GameCenterFriend | undefined>()
  const [nickname, setNickname] = createSignal('')
  const [chosenPassword, setChosenPassword] = createSignal('')
  const [creating, setCreating] = createSignal(false)
  const [submitting, setSubmitting] = createSignal(false)
  const [failure, setFailure] = createSignal('')
  const [confirmingSignOut, setConfirmingSignOut] = createSignal(false)

  const loadBoards = () => {
    for (const entry of GameCenterCatalog) void gkLoadLeaderboard(entry.leaderboardId)
  }

  onMount(() => {
    void gkAuthenticate()
    loadBoards()
    onCleanup(NSNotificationCenter.addObserver(GKScoreDidSubmit, loadBoards))
    onCleanup(NSNotificationCenter.addObserver(GKPlayerAuthenticationDidChange, loadBoards))
  })

  const attempt = async (work: () => Promise<GKResult<GKPlayer>>): Promise<boolean> => {
    setSubmitting(true)
    const reply = await work()
    setSubmitting(false)
    if (reply.ok) return true
    setFailure(gkErrorMessage(reply.error))
    return false
  }

  const leaveCreation = () => {
    setCreating(false)
    setNickname('')
    setChosenPassword('')
  }

  const register = async () => {
    if (await attempt(() => gkSignUp(nickname(), chosenPassword()))) leaveCreation()
  }

  const signOut = () => {
    setConfirmingSignOut(false)
    setTab('Me')
    gkSignOut()
  }

  const title = () => {
    const current = tab()
    if (current === 'Friends') {
      const open = friend()
      return open ? open.alias : plural(gameCenterFriends().length, 'Friend', 'Friends')
    }
    if (current === 'Games') return plural(GameCenterCatalog.length, 'Game', 'Games')
    if (current === 'Requests') return 'Friend Requests'
    return current
  }

  const showBack = () => tab() === 'Friends' && friend() !== undefined
  const showAdd = () => tab() === 'Friends' && friend() === undefined

  return (
    <div
      class="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: 'black' }}
    >
      <UIStatusBar />

      <Switch>
        <Match when={creating()}>
          <GKTitleBar
            title={CreateProfileTitle}
            onCancel={leaveCreation}
            onDone={gkAliasIsWellFormed(nickname()) ? () => void register() : undefined}
          />
          <div class="min-h-0 flex-1" style={{ background: gkTile('GKBackgroundPortrait') }}>
            <GKCreateProfileView
              width={props.width}
              nickname={nickname()}
              onNickname={setNickname}
              onDone={() => void register()}
            />
          </div>
        </Match>

        <Match when={!gkIsAuthenticated()}>
          <GKTitleBar title={WelcomeTitle} />
          <div class="min-h-0 flex-1" style={{ background: gkTile('GKBackgroundPortrait') }}>
            <GKWelcomeView
              width={props.width}
              submitting={submitting()}
              onSignIn={(handle, password) => void attempt(() => gkSignIn(handle, password))}
              onCreate={(handle, password) => {
                setNickname(handle)
                setChosenPassword(password)
                setCreating(true)
              }}
            />
          </div>
        </Match>

        <Match when={gkLocalPlayer()?.alias}>
          {(alias) => (
            <>
              <GKTitleBar
                title={title()}
                backTitle={showBack() ? 'Friends' : undefined}
                onBack={() => setFriend(undefined)}
                onAdd={showAdd() ? () => setFriend(undefined) : undefined}
              />

              <UIScrollView
                class="min-h-0 flex-1"
                style={{ background: gkTile('GKBackgroundPortrait') }}
              >
                <Switch>
                  <Match when={tab() === 'Me'}>
                    <GKMeView
                      width={props.width}
                      alias={alias()}
                      onEditStatus={() => setTab('Me')}
                      onSignOut={() => setConfirmingSignOut(true)}
                    />
                  </Match>
                  <Match when={tab() === 'Friends'}>
                    <Show
                      when={friend()}
                      fallback={
                        <GKFriendsView
                          width={props.width}
                          onOpen={setFriend}
                          onAdd={() => setFriend(undefined)}
                        />
                      }
                    >
                      {(open) => (
                        <GKFriendDetail
                          width={props.width}
                          friend={open()}
                          onOpenGame={() => setTab('Games')}
                        />
                      )}
                    </Show>
                  </Match>
                  <Match when={tab() === 'Games'}>
                    <GKGamesView
                      width={props.width}
                      onOpenGame={(bundleId) => props.onOpenGame?.(bundleId)}
                    />
                  </Match>
                  <Match when={tab() === 'Requests'}>
                    <GKRequestsView />
                  </Match>
                </Switch>
              </UIScrollView>

              <GKTabBar
                width={props.width}
                selected={tab()}
                onSelect={(next) => {
                  setFriend(undefined)
                  setTab(next)
                }}
              />
            </>
          )}
        </Match>

      </Switch>

      <UIAlertView
        visible={failure() !== ''}
        title={FailureTitle}
        message={failure()}
        onDismiss={() => setFailure('')}
      />

      <UIAlertView
        visible={confirmingSignOut()}
        title={SignOutTitle}
        message={SignOutMessage}
        buttonTitle={SignOutCancel}
        alternateTitle={SignOutTitle}
        onAlternate={signOut}
        onDismiss={() => setConfirmingSignOut(false)}
      />
    </div>
  )
}
