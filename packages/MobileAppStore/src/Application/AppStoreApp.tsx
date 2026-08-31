import { createSignal, onCleanup, Show, Switch, Match, type JSX } from 'solid-js'
import { CAMediaTimingFunction, caAfter, caAnimation, caTransition, type CATransaction } from 'CoreAnimation'
import { UISearchField, UISegmentedControl, UIStatusBar } from 'UIKit'
import { UIKeyboardSearch, UIKeyboardView } from 'TextInput'
import { AppStoreMetrics, AppStorePalette } from '../Support/AppStoreMetrics'
import { AppStoreScreen, type AppStoreEditingState, type AppStoreTab } from '../Support/AppStoreTypes'
import type { AppStoreApplication } from '../Support/AppStoreTypes'
import type { AppStoreCategory } from '../Support/AppStoreCatalog'
import { appStoreSearch } from '../Support/AppStoreService'
import { AppStoreTitleBar, type AppStoreBackSpec } from '../Chrome/AppStoreTitleBar'
import { AppStoreTabBar } from '../Chrome/AppStoreTabBar'
import { AppStoreFeaturedView } from '../Featured/AppStoreFeaturedView'
import { AppStoreCategoriesView } from '../Categories/AppStoreCategoriesView'
import { AppStoreCategoryView } from '../Categories/AppStoreCategoryView'
import { AppStoreTop25View } from '../Top25/AppStoreTop25View'
import { AppStoreSearchView } from '../Search/AppStoreSearchView'
import { AppStoreUpdatesView } from '../Updates/AppStoreUpdatesView'
import { AppStoreDetailView } from '../Detail/AppStoreDetailView'

const slide = caAnimation(AppStoreMetrics.navDuration, CAMediaTimingFunction.linear)

const InfoTitle = 'Info'

const FeaturedSegments: readonly string[] = ['New', 'Genius']
const Top25Segments: readonly string[] = ['Paid', 'Free', 'Top Grossing']

const BackSpecs: Readonly<Record<string, AppStoreBackSpec>> = {
  [AppStoreScreen.featuredDetail]: {
    label: 'App Store',
    asset: 'Button_wp4',
    width: AppStoreMetrics.backButtonWideWidth,
    offsetX: 1
  },
  [AppStoreScreen.top25Detail]: {
    label: 'Top 25',
    asset: 'Button2',
    width: AppStoreMetrics.backButtonNarrowWidth,
    offsetX: 0
  },
  [AppStoreScreen.category]: {
    label: 'Categories',
    asset: 'Button_wp4',
    width: AppStoreMetrics.backButtonWideWidth,
    offsetX: 1
  },
  [AppStoreScreen.categoryDetail]: {
    label: 'Categories',
    asset: 'Button_wp4',
    width: AppStoreMetrics.backButtonWideWidth,
    offsetX: 1
  },
  [AppStoreScreen.searchDetail]: {
    label: 'Search',
    asset: 'Button2',
    width: AppStoreMetrics.backButtonNarrowWidth,
    offsetX: 0
  }
}

export const AppStoreApp = (props: { width: number; height: number }) => {
  const [tab, setTab] = createSignal<AppStoreTab>('Featured')
  const [view, setView] = createSignal<string>(AppStoreScreen.featured)
  const [outgoing, setOutgoing] = createSignal<string | undefined>()
  const [backward, setBackward] = createSignal(false)
  const [entering, setEntering] = createSignal(false)

  const [featuredScreen, setFeaturedScreen] = createSignal<string>(AppStoreScreen.featured)
  const [categoriesScreen, setCategoriesScreen] = createSignal<string>(AppStoreScreen.categories)
  const [top25Screen, setTop25Screen] = createSignal<string>(AppStoreScreen.top25)
  const [searchScreen, setSearchScreen] = createSignal<string>(AppStoreScreen.search)

  const [featuredSegment, setFeaturedSegment] = createSignal(0)
  const [top25Segment, setTop25Segment] = createSignal(0)

  const [featuredApp, setFeaturedApp] = createSignal<AppStoreApplication | undefined>()
  const [categoryApp, setCategoryApp] = createSignal<AppStoreApplication | undefined>()
  const [top25App, setTop25App] = createSignal<AppStoreApplication | undefined>()
  const [searchApp, setSearchApp] = createSignal<AppStoreApplication | undefined>()
  const [category, setCategory] = createSignal<AppStoreCategory | undefined>()

  const [query, setQuery] = createSignal('')
  const [editing, setEditing] = createSignal<AppStoreEditingState>('None')

  let settle: CATransaction | undefined

  onCleanup(() => settle?.cancel())

  const transition = (next: string, isBack: boolean) => {
    settle?.cancel()
    setBackward(isBack)
    setOutgoing(view())
    setView(next)
    setEntering(true)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setEntering(false)
        settle = caAfter(AppStoreMetrics.navDuration, () => setOutgoing(undefined))
      })
    )
  }

  const remember = (next: string) => {
    const current = tab()
    if (current === 'Featured') setFeaturedScreen(next)
    if (current === 'Categories') setCategoriesScreen(next)
    if (current === 'Top 25') setTop25Screen(next)
    if (current === 'Search') setSearchScreen(next)
  }

  const push = (next: string) => {
    remember(next)
    transition(next, false)
  }

  const screenForTab = (next: AppStoreTab): string => {
    if (next === 'Featured') return featuredScreen()
    if (next === 'Categories') return categoriesScreen()
    if (next === 'Top 25') return top25Screen()
    if (next === 'Search') return searchScreen()
    return AppStoreScreen.updates
  }

  const selectTab = (next: AppStoreTab) => {
    settle?.cancel()
    setEditing('None')
    setOutgoing(undefined)
    setEntering(false)
    setTab(next)
    setView(screenForTab(next))
  }

  const back = () => {
    const current = view()
    if (current === AppStoreScreen.categoryDetail) {
      setCategoriesScreen(AppStoreScreen.category)
      transition(AppStoreScreen.category, true)
      return
    }
    if (current === AppStoreScreen.category) {
      setCategoriesScreen(AppStoreScreen.categories)
      transition(AppStoreScreen.categories, true)
      return
    }
    if (current === AppStoreScreen.featuredDetail) {
      setFeaturedScreen(AppStoreScreen.featured)
      transition(AppStoreScreen.featured, true)
      return
    }
    if (current === AppStoreScreen.top25Detail) {
      setTop25Screen(AppStoreScreen.top25)
      transition(AppStoreScreen.top25, true)
      return
    }
    setSearchScreen(AppStoreScreen.search)
    transition(AppStoreScreen.search, true)
  }

  const openFeatured = (application: AppStoreApplication) => {
    setFeaturedApp(application)
    push(AppStoreScreen.featuredDetail)
  }

  const openTop25 = (application: AppStoreApplication) => {
    setTop25App(application)
    push(AppStoreScreen.top25Detail)
  }

  const openSearch = (application: AppStoreApplication) => {
    setSearchApp(application)
    push(AppStoreScreen.searchDetail)
  }

  const openCategoryApp = (application: AppStoreApplication) => {
    setCategoryApp(application)
    push(AppStoreScreen.categoryDetail)
  }

  const openCategory = (next: AppStoreCategory) => {
    setCategory(next)
    push(AppStoreScreen.category)
  }

  const typeQuery = (next: string) => {
    setQuery(next)
    setEditing(next.length === 0 ? 'ActiveEmpty' : 'Active')
  }

  const submitQuery = () => {
    setEditing('None')
    void appStoreSearch(query())
  }

  const contentHeight = () =>
    props.height -
    AppStoreMetrics.statusBarHeight -
    AppStoreMetrics.titleBarHeight -
    AppStoreMetrics.tabBarHeight

  const detail = (application: AppStoreApplication | undefined): JSX.Element => (
    <Show when={application}>
      {(ready) => (
        <AppStoreDetailView width={props.width} height={contentHeight()} application={ready()} />
      )}
    </Show>
  )

  const screenFor = (id: string): JSX.Element => (
    <Switch fallback={<AppStoreUpdatesView />}>
      <Match when={id === AppStoreScreen.featured}>
        <AppStoreFeaturedView
          width={props.width}
          segment={featuredSegment()}
          onOpen={openFeatured}
        />
      </Match>
      <Match when={id === AppStoreScreen.featuredDetail}>{detail(featuredApp())}</Match>
      <Match when={id === AppStoreScreen.categories}>
        <AppStoreCategoriesView width={props.width} onOpen={openCategory} />
      </Match>
      <Match when={id === AppStoreScreen.category}>
        <Show when={category()}>
          {(ready) => (
            <AppStoreCategoryView
              width={props.width}
              category={ready()}
              onOpen={openCategoryApp}
            />
          )}
        </Show>
      </Match>
      <Match when={id === AppStoreScreen.categoryDetail}>{detail(categoryApp())}</Match>
      <Match when={id === AppStoreScreen.top25}>
        <AppStoreTop25View width={props.width} segment={top25Segment()} onOpen={openTop25} />
      </Match>
      <Match when={id === AppStoreScreen.top25Detail}>{detail(top25App())}</Match>
      <Match when={id === AppStoreScreen.search}>
        <AppStoreSearchView editing={editing()} onOpen={openSearch} />
      </Match>
      <Match when={id === AppStoreScreen.searchDetail}>{detail(searchApp())}</Match>
    </Switch>
  )

  const title = (): string => {
    const current = view()
    if (current === AppStoreScreen.categories) return 'Categories'
    if (current === AppStoreScreen.category) return category()?.name ?? 'Categories'
    if (current === AppStoreScreen.updates) return 'Updates'
    return InfoTitle
  }

  const titleView = (): JSX.Element | undefined => {
    const current = view()
    if (current === AppStoreScreen.featured) {
      return (
        <UISegmentedControl
          segments={FeaturedSegments}
          selected={featuredSegment()}
          width={AppStoreMetrics.segmentDualWidth}
          onSelect={setFeaturedSegment}
        />
      )
    }
    if (current === AppStoreScreen.top25) {
      return (
        <UISegmentedControl
          segments={Top25Segments}
          selected={top25Segment()}
          width={props.width - AppStoreMetrics.segmentTriInset}
          onSelect={setTop25Segment}
        />
      )
    }
    if (current === AppStoreScreen.search) {
      return (
        <UISearchField
          value={query()}
          onInput={typeQuery}
          onFocus={() => setEditing(query().length === 0 ? 'ActiveEmpty' : 'Active')}
          onSubmit={submitQuery}
        />
      )
    }
    return undefined
  }

  const offscreen = () => (backward() ? -props.width : props.width)

  const stage = (id: string, shifted: boolean): JSX.Element => (
    <div
      class="absolute inset-0"
      style={{
        transform: entering()
          ? `translateX(${shifted ? offscreen() : 0}px)`
          : `translateX(${shifted ? 0 : -offscreen()}px)`,
        transition: entering() ? 'none' : caTransition(['transform'], slide)
      }}
    >
      {screenFor(id)}
    </div>
  )

  return (
    <div
      class="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: AppStorePalette.listBackground }}
    >
      <UIStatusBar style="inApp" />

      <AppStoreTitleBar
        title={title()}
        clampTitle={view() === AppStoreScreen.category}
        titleView={titleView()}
        back={BackSpecs[view()]}
        onBack={back}
      />

      <div class="relative min-h-0 flex-1 overflow-hidden">
        <Show when={outgoing()}>{(previous) => stage(previous(), false)}</Show>
        {stage(view(), true)}
      </div>

      <AppStoreTabBar width={props.width} selected={tab()} onSelect={selectTab} />

      <UIKeyboardView
        visible={tab() === 'Search' && editing() !== 'None'}
        width={props.width}
        configuration={UIKeyboardSearch(query().length > 0)}
        onInsert={(text) => typeQuery(query() + text)}
        onDelete={() => typeQuery(query().slice(0, -1))}
        onReturn={submitQuery}
      />
    </div>
  )
}
