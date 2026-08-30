import { Match, Switch } from 'solid-js'
import { UIBarButton, UINavigationBar, UINavigationBarMetrics, UISegmentedControl } from 'UIKit'
import { PhoneMetrics } from '../Support/PhoneMetrics'
import { phFavorites } from '../Support/FavoritesStore'
import { phRecentCalls } from '../Support/RecentsStore'
import { PhoneBackButton } from './PhoneBackButton'
import { PhonePlusButton } from './PhonePlusButton'
import type { PhoneTab } from './PhoneTabs'

const RecentSegments = ['All', 'Missed'] as const

export const PhoneTitleBar = (props: {
  tab: PhoneTab
  title: string
  viewingInfo: boolean
  editing: boolean
  segment: number
  onSegment: (index: number) => void
  onEdit: () => void
  onEditContact: () => void
  onPlus: () => void
  onBack: () => void
}) => (
  <UINavigationBar
    title={props.title}
    titleView={
      props.tab === 'Recents' ? (
        <UISegmentedControl
          segments={RecentSegments}
          selected={props.segment}
          width={PhoneMetrics.segmentWidth}
          onSelect={props.onSegment}
        />
      ) : undefined
    }
    leading={
      <Switch>
        <Match when={props.tab === 'Contacts' && props.viewingInfo}>
          <div
            style={{
              'margin-left': `${PhoneMetrics.backButtonLeading - UINavigationBarMetrics.itemInset}px`
            }}
          >
            <PhoneBackButton title="All Contacts" onPress={() => props.onBack()} />
          </div>
        </Match>
        <Match when={props.tab === 'Favorites' && phFavorites().length > 0}>
          <UIBarButton
            title={props.editing ? 'Done' : ' Edit '}
            tone={props.editing ? 'blue' : 'blueGray'}
            onClick={() => props.onEdit()}
          />
        </Match>
      </Switch>
    }
    trailing={
      <Switch>
        <Match when={props.tab === 'Contacts' && props.viewingInfo}>
          <div
            style={{
              'margin-right': `${PhoneMetrics.infoEditTrailing - UINavigationBarMetrics.itemInset}px`
            }}
          >
            <UIBarButton title=" Edit " tone="blueGray" onClick={() => props.onEditContact()} />
          </div>
        </Match>
        <Match when={props.tab === 'Favorites' && !props.editing}>
          <PhonePlusButton onPress={() => props.onPlus()} />
        </Match>
        <Match when={props.tab === 'Recents' && phRecentCalls().length > 0}>
          <UIBarButton title="Clear" tone="blueGray" onClick={() => props.onEdit()} />
        </Match>
      </Switch>
    }
  />
)
