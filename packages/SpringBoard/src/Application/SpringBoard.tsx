import { createSignal, Match, onCleanup, Show, Switch } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import {
  DeviceHomeButtonDoublePressed,
  DeviceHomeButtonPressed,
  DeviceIdentifier,
  DeviceLockButtonPressed,
  DeviceOrientation,
  DeviceOrientationDidChange,
  DeviceMetrics
} from 'Device'
import {
  CAMediaTimingFunction,
  CATransitionDuration,
  caAfter,
  caAnimation,
  caTransition,
  type CAAnimation
} from 'CoreAnimation'
import { CameraApp } from 'MobileCamera'
import { CalendarApp } from 'MobileCal'
import { CalculatorApp } from 'MobileCalculator'
import { ClockApp } from 'MobileTimer'
import { CompassApp } from 'MobileCompass'
import { GameCenterApp } from 'MobileGameCenter'
import { FlattyBirdApp } from 'GameFlattyBird'
import { DoomApp } from 'GameDoom'
import { MessagesApp } from 'MobileSMS'
import { PhoneApp } from 'MobilePhone'
import { NotesApp } from 'MobileNotes'
import { ContactsApp } from 'MobileAddressBook'
import { MailApp } from 'MobileMail'
import { MapsApp } from 'MobileMaps'
import { UIAlertView } from 'UIKit'
 import { ctNetworkReachable } from 'CoreTelephony'
import { PreferencesApp } from 'Preferences'
import { StocksApp } from 'MobileStocks'
import { StoreApp } from 'MobileStore'
import { MobileiPodApp } from 'MobileiPod'
import { MobileSafariApp } from 'MobileSafari'
import { MobileVoiceMemosApp } from 'MobileVoiceMemos'
import { PhotosApp } from 'MobileSlideShow'
import { WeatherApp } from 'MobileWeather'
import {
  TextInputIdentifier,
  UIKeyboardDidDelete,
  UIKeyboardDidInsert,
  UIKeyboardStandard,
  UIKeyboardView,
  UIKeyboardWillHide,
  UIKeyboardWillShow
} from 'TextInput'
import { HomeScreen, type SBHomeAction } from '../HomeScreen/HomeScreen'
import { LockScreen } from '../LockScreen/LockScreen'
import { MultitaskingTray, multitaskingTrayHeight } from '../Switcher/MultitaskingTray'
import { SBVolumeHUD } from '../HUD/SBVolumeHUD'
import { SpringBoardMetrics } from '../Support/SpringBoardMetrics'
import {
  CalendarBundleId,
  DockApplications,
  HomeScreenApplications,
  SearchApplications,
  type ApplicationRecord
} from '../Support/Bundles'
import { NSUserDefaults } from 'NSUserDefaults'
import {
  SBApplicationDidLaunch,
  SBApplicationDidTerminate,
  SBDidReturnToHomeScreen,
  SBDidUnlock,
  SpringBoardIdentifier
} from '../Support/SpringBoardNotifications'

const HomeScreenPage = 0
const RecentsKey = 'springboard_recents'
const PhotosBundleId = 'com.nos4.mobileslideshow'
const CameraBundleId = 'com.nos4.camera'
const WeatherBundleId = 'com.nos4.weather'
const SafariBundleId = 'com.nos4.mobilesafari'
const iPodBundleId = 'com.nos4.mobilemusicplayer'
const StocksBundleId = 'com.nos4.stocks'
const NotesBundleId = 'com.nos4.mobilenotes'
const StoreBundleId = 'com.nos4.mobilestore'
const VoiceMemosBundleId = 'com.nos4.voicememos'
const CalculatorBundleId = 'com.nos4.calculator'
const ClockBundleId = 'com.nos4.mobiletimer'
const CompassBundleId = 'com.nos4.compass'
const GameCenterBundleId = 'com.nos4.gamecenter'
const FlattyBirdBundleId = 'com.nos4.flattybird'
const DoomBundleId = 'com.nos4.doom'
const MessagesBundleId = 'com.nos4.mobilesms'
const PhoneBundleId = 'com.nos4.mobilephone'
const MapsBundleId = 'com.nos4.maps'
const PreferencesBundleId = 'com.nos4.preferences'
const MailBundleId = 'com.nos4.mobilemail'
const ContactsBundleId = 'com.nos4.mobileaddressbook'
const UnreachableTitle = 'Turn Off Airplane Mode or Use Wi-Fi to Access Data'
const UnreachableMessage = ''
const UnreachableSettings = 'Settings'
const UnreachableDismiss = 'OK'

const multitaskingAnimation = caAnimation(
  CATransitionDuration.multitaskingDismiss,
  CAMediaTimingFunction.easeInOut
)

const restingAnimation = caAnimation(CATransitionDuration.appLaunch, CAMediaTimingFunction.linear)

export const SpringBoard = () => {
  const [locked, setLocked] = createSignal(true)
  const [activeApp, setActiveApp] = createSignal<ApplicationRecord | undefined>()
  const [appsScale, setAppsScale] = createSignal(1)
  const [dockOffset, setDockOffset] = createSignal(0)
  const [outSlides, setOutSlides] = createSignal(0)
  const [animation, setAnimation] = createSignal<CAAnimation>(restingAnimation)
  const [appScale, setAppScale] = createSignal(0)
  const [appAnimation, setAppAnimation] = createSignal<CAAnimation>(restingAnimation)
  const [page, setPage] = createSignal(1)
  const [multitasking, setMultitasking] = createSignal(false)
  const [keyboardVisible, setKeyboardVisible] = createSignal(false)
  const [recents, setRecents] = createSignal<ApplicationRecord[]>(
    (NSUserDefaults.object<string[]>(RecentsKey) ?? [])
      .map((bundleId) => SearchApplications.find((entry) => entry.bundleId === bundleId))
      .filter((entry): entry is ApplicationRecord => entry !== undefined)
  )

  const rememberRecents = (next: readonly ApplicationRecord[]) => {
    setRecents([...next])
    NSUserDefaults.setObject(
      RecentsKey,
      next.map((entry) => entry.bundleId)
    )
  }
  const [jiggling, setJiggling] = createSignal(false)
  const [unreachable, setUnreachable] = createSignal(false)
  const [editing, setEditing] = createSignal(false)
  const homeAction: SBHomeAction = {}

  const pending: { current: (() => void)[] } = { current: [] }
  const schedule = (seconds: number, run: () => void) => {
    const transaction = caAfter(seconds, run)
    pending.current.push(transaction.cancel)
  }

  onCleanup(() => {
    for (const cancel of pending.current) cancel()
  })

  const launch = (app: ApplicationRecord, zoomGrid = true) => {
    if (app.requiresData === true && !ctNetworkReachable()) {
      setUnreachable(true)
      return
    }
    setKeyboardVisible(false)
    setMultitasking(false)
    setJiggling(false)
    setEditing(false)
    rememberRecents([app, ...recents().filter((entry) => entry.bundleId !== app.bundleId)])
    setAnimation(caAnimation(CATransitionDuration.appLaunch, CAMediaTimingFunction.linear))
    if (zoomGrid) {
      setAppsScale(SpringBoardMetrics.appsScaleMax)
      setDockOffset(SpringBoardMetrics.dockOffsetMax)
    }
    NSNotificationCenter.post(SBApplicationDidLaunch, SpringBoardIdentifier, {
      bundleId: app.bundleId
    })
    schedule(CATransitionDuration.appLaunchHandoff, () => {
      setAppAnimation(caAnimation(CATransitionDuration.appLaunch, CAMediaTimingFunction.linear))
      setAppScale(0)
      setActiveApp(app)
      NSNotificationCenter.post(DeviceOrientationDidChange, DeviceIdentifier, {
        orientation:
          app.bundleId === DoomBundleId
            ? DeviceOrientation.landscape
            : DeviceOrientation.portrait
      })
      requestAnimationFrame(() => requestAnimationFrame(() => setAppScale(1)))
    })
  }

  const quitApp = (app: ApplicationRecord) => {
    schedule(SpringBoardMetrics.multitaskingDismissDelay, () => {
      rememberRecents(recents().filter((entry) => entry.bundleId !== app.bundleId))
    })
    NSNotificationCenter.post(SBApplicationDidTerminate, SpringBoardIdentifier, {
      bundleId: app.bundleId
    })
  }

  const openiPod = () => {
    const record = DockApplications.find((entry) => entry.bundleId === iPodBundleId)
    if (!record) return
    if (activeApp()?.bundleId === iPodBundleId) {
      dismissMultitasking()
      return
    }
    launch(record)
  }

  const dismissMultitasking = () => {
    setMultitasking(false)
    setJiggling(false)
  }

  const returnHome = () => {
    const app = activeApp()
    if (!app) return
    setAppAnimation(caAnimation(CATransitionDuration.appExit, CAMediaTimingFunction.linear))
    setAppScale(0)
    NSNotificationCenter.post(DeviceOrientationDidChange, DeviceIdentifier, {
      orientation: DeviceOrientation.portrait
    })
    NSNotificationCenter.post(SBApplicationDidTerminate, SpringBoardIdentifier, {
      bundleId: app.bundleId
    })
    schedule(CATransitionDuration.appLaunchHandoff, () => {
      setAnimation(
        caAnimation(CATransitionDuration.appExitRestore, CAMediaTimingFunction.linear)
      )
      setAppsScale(1)
      setDockOffset(0)
    })
    schedule(CATransitionDuration.appExit, () => setActiveApp(undefined))
    NSNotificationCenter.post(SBDidReturnToHomeScreen, SpringBoardIdentifier, {
      page: HomeScreenPage
    })
  }

  const unlock = () => {
    setAnimation(caAnimation(CATransitionDuration.unlockSlide, CAMediaTimingFunction.easeIn))
    setOutSlides(SpringBoardMetrics.unlockSlideOffset)
    schedule(CATransitionDuration.unlockHandoff, () => {
      setAppsScale(SpringBoardMetrics.appsScaleMax)
      setDockOffset(SpringBoardMetrics.dockOffsetMax)
      setLocked(false)
      NSNotificationCenter.post(SBDidUnlock, SpringBoardIdentifier, { page: HomeScreenPage })
      schedule(CATransitionDuration.appLaunchHandoff, () => {
        setAnimation(
          caAnimation(CATransitionDuration.unlockZoom, CAMediaTimingFunction.easeInOut)
        )
        setAppsScale(1)
        setDockOffset(0)
      })
    })
  }

  onCleanup(
    NSNotificationCenter.addObserver(DeviceHomeButtonPressed, () => {
      if (keyboardVisible()) {
        setKeyboardVisible(false)
        return
      }
      if (multitasking()) {
        dismissMultitasking()
        return
      }
      if (activeApp()) {
        returnHome()
        return
      }
      if (homeAction.current?.()) return
      if (editing()) {
        setEditing(false)
        return
      }
      setPage(page() === 1 ? 0 : 1)
    })
  )

  onCleanup(NSNotificationCenter.addObserver(UIKeyboardWillShow, () => setKeyboardVisible(true)))

  onCleanup(NSNotificationCenter.addObserver(UIKeyboardWillHide, () => setKeyboardVisible(false)))

  onCleanup(
    NSNotificationCenter.addObserver(DeviceHomeButtonDoublePressed, () => {
      if (multitasking()) {
        dismissMultitasking()
        return
      }
      setMultitasking(true)
    })
  )

  onCleanup(
    NSNotificationCenter.addObserver(DeviceLockButtonPressed, (notification) => {
      if (!notification.userInfo.locked) return
      NSNotificationCenter.post(DeviceOrientationDidChange, DeviceIdentifier, {
        orientation: DeviceOrientation.portrait
      })
      setActiveApp(undefined)
      setAppsScale(1)
      setDockOffset(0)
      setOutSlides(0)
      setLocked(true)
    })
  )

  return (
    <div class="relative h-full w-full">
    <Show when={!locked()} fallback={<LockScreen outSlides={outSlides()} animation={animation()} onUnlock={unlock} />}>
      <div class="relative h-full w-full overflow-hidden" style={{ background: 'black' }}>
        <div
          class="absolute inset-0"
          style={{
            transform: `translateY(${multitasking() ? -multitaskingTrayHeight : 0}px)`,
            'box-shadow': multitasking()
              ? `0 ${SpringBoardMetrics.multitaskingShadowOffsetY}px ${SpringBoardMetrics.multitaskingShadowBlur * 2}px rgba(0,0,0,${SpringBoardMetrics.multitaskingShadowOpacity})`
              : 'none',
            transition: caTransition(['transform', 'box-shadow'], multitaskingAnimation)
          }}
        >
          <HomeScreen
            appsScale={appsScale()}
            dockOffset={dockOffset()}
            page={page()}
            animation={animation()}
            editing={editing()}
            homeAction={homeAction}
            onBeginEditing={() => setEditing(true)}
            onPageChange={setPage}
            onLaunch={launch}
            onFolderLaunch={(app) => launch(app, false)}
          />
        <Show when={activeApp()}>
          {(app) => (
            <div
              class="absolute inset-0"
              style={{
                transform: `scale(${appScale()})`,
                transition: caTransition(['transform'], appAnimation())
              }}
            >
              <Switch
                fallback={
                  <div class="flex h-full w-full items-center justify-center bg-white text-sm">
                    {app().bundleId}
                  </div>
                }
              >
                <Match when={app().bundleId === PhotosBundleId}>
                  <PhotosApp />
                </Match>
                <Match when={app().bundleId === StoreBundleId}>
                  <StoreApp width={DeviceMetrics.stageWidth} />
                </Match>
                <Match when={app().bundleId === ContactsBundleId}>
                  <ContactsApp width={DeviceMetrics.stageWidth} height={DeviceMetrics.stageHeight} />
                </Match>
                <Match when={app().bundleId === MailBundleId}>
                  <MailApp width={DeviceMetrics.stageWidth} height={DeviceMetrics.stageHeight} />
                </Match>
                <Match when={app().bundleId === PreferencesBundleId}>
                  <PreferencesApp
                    width={DeviceMetrics.stageWidth}
                    height={DeviceMetrics.stageHeight}
                  />
                </Match>
                <Match when={app().bundleId === MapsBundleId}>
                  <MapsApp width={DeviceMetrics.stageWidth} height={DeviceMetrics.stageHeight} />
                </Match>
                <Match when={app().bundleId === StocksBundleId}>
                  <StocksApp height={DeviceMetrics.stageHeight} />
                </Match>
                <Match when={app().bundleId === NotesBundleId}>
                  <NotesApp width={DeviceMetrics.stageWidth} height={DeviceMetrics.stageHeight} />
                </Match>
                <Match when={app().bundleId === MessagesBundleId}>
                  <MessagesApp width={DeviceMetrics.stageWidth} />
                </Match>
                <Match when={app().bundleId === PhoneBundleId}>
                  <PhoneApp width={DeviceMetrics.stageWidth} />
                </Match>
                <Match when={app().bundleId === GameCenterBundleId}>
                  <GameCenterApp
                    width={DeviceMetrics.stageWidth}
                    onOpenGame={(bundleId) => {
                      const game = SearchApplications.find((entry) => entry.bundleId === bundleId)
                      if (game) launch(game)
                    }}
                  />
                </Match>
                <Match when={app().bundleId === FlattyBirdBundleId}>
                  <FlattyBirdApp
                    width={DeviceMetrics.stageWidth}
                    height={DeviceMetrics.stageHeight}
                    onScores={() => {
                      const centre = SearchApplications.find(
                        (entry) => entry.bundleId === GameCenterBundleId
                      )
                      if (centre) launch(centre)
                    }}
                  />
                </Match>
                <Match when={app().bundleId === DoomBundleId}>
                  <DoomApp
                    width={DeviceMetrics.stageHeight}
                    height={DeviceMetrics.stageWidth}
                  />
                </Match>
                <Match when={app().bundleId === CompassBundleId}>
                  <CompassApp
                    width={DeviceMetrics.stageWidth}
                    height={DeviceMetrics.stageHeight}
                    onOpenMaps={() => {
                      const maps = HomeScreenApplications.find(
                        (entry) => entry.bundleId === MapsBundleId
                      )
                      if (maps) launch(maps)
                    }}
                  />
                </Match>
                <Match when={app().bundleId === ClockBundleId}>
                  <ClockApp width={DeviceMetrics.stageWidth} />
                </Match>
                <Match when={app().bundleId === CalculatorBundleId}>
                  <CalculatorApp
                    width={DeviceMetrics.stageWidth}
                    height={DeviceMetrics.stageHeight}
                  />
                </Match>
                <Match when={app().bundleId === CalendarBundleId}>
                  <CalendarApp width={DeviceMetrics.stageWidth} />
                </Match>
                <Match when={app().bundleId === iPodBundleId}>
                  <MobileiPodApp
                    width={DeviceMetrics.stageWidth}
                    height={DeviceMetrics.stageHeight}
                  />
                </Match>
                <Match when={app().bundleId === SafariBundleId}>
                  <MobileSafariApp
                    width={DeviceMetrics.stageWidth}
                    height={DeviceMetrics.stageHeight}
                  />
                </Match>
                <Match when={app().bundleId === WeatherBundleId}>
                  <WeatherApp height={DeviceMetrics.stageHeight} width={DeviceMetrics.stageWidth} />
                </Match>
                <Match when={app().bundleId === VoiceMemosBundleId}>
                  <MobileVoiceMemosApp
                    width={DeviceMetrics.stageWidth}
                    height={DeviceMetrics.stageHeight}
                  />
                </Match>
                <Match when={app().bundleId === CameraBundleId}>
                  <CameraApp
                    width={DeviceMetrics.stageWidth}
                    onOpenLibrary={() => {
                      const photos = HomeScreenApplications.find(
                        (entry) => entry.bundleId === PhotosBundleId
                      )
                      if (photos) launch(photos)
                    }}
                  />
                </Match>
              </Switch>
              </div>
            )}
          </Show>
        </div>

        <div
          class="absolute inset-x-0"
          style={{
            bottom: `${multitasking() ? 0 : -multitaskingTrayHeight}px`,
            transition: caTransition(['bottom'], multitaskingAnimation)
          }}
        >
          <MultitaskingTray
            recents={recents()}
            activeBundleId={activeApp()?.bundleId}
            jiggling={jiggling()}
            onLaunch={launch}
            onHold={() => setJiggling(true)}
            onQuit={quitApp}
            onOpeniPod={openiPod}
          />
        </div>

        <UIKeyboardView
          visible={keyboardVisible()}
          width={DeviceMetrics.stageWidth}
          configuration={UIKeyboardStandard}
          onInsert={(text) =>
            NSNotificationCenter.post(UIKeyboardDidInsert, TextInputIdentifier, { text })
          }
          onDelete={() =>
            NSNotificationCenter.post(UIKeyboardDidDelete, TextInputIdentifier, { count: 1 })
          }
          onReturn={() => setKeyboardVisible(false)}
        />
      </div>
    </Show>
    <SBVolumeHUD />
    <UIAlertView
      visible={unreachable()}
      title={UnreachableTitle}
      message={UnreachableMessage}
      alternateTitle={UnreachableSettings}
      buttonTitle={UnreachableDismiss}
      onAlternate={() => {
        setUnreachable(false)
        const settings = HomeScreenApplications.find(
          (entry) => entry.bundleId === PreferencesBundleId
        )
        if (settings) launch(settings)
      }}
      onDismiss={() => setUnreachable(false)}
    />
    </div>
  )
}
