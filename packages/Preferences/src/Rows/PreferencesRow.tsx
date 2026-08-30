import { Match, Show, Switch } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UISwitch, UITableMetrics, UITablePalette } from 'UIKit'
import { PreferencesMetrics, PreferencesPalette } from '../Support/PreferencesMetrics'
import { preferencesSetSwitch, preferencesSwitchValue } from '../Support/PreferencesDefaults'
import { PreferencesAccessory, type PreferencesRowSpec } from '../Support/PreferencesTypes'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const Spinner = () => (
  <div
    style={{
      width: `${PreferencesMetrics.checkmarkSize}px`,
      height: `${PreferencesMetrics.checkmarkSize}px`,
      'border-radius': '50%',
      border: '2px solid rgba(120,120,120,0.35)',
      'border-top-color': 'rgb(120,120,120)',
      animation: 'spin 0.9s linear infinite'
    }}
  />
)

export const PreferencesRow = (props: { row: PreferencesRowSpec; onOpen: (id: string) => void }) => {
  const interactive = () => props.row.destination !== undefined

  const body = () => (
    <div
      class="flex h-full w-full items-center"
      style={{ padding: `0 ${PreferencesMetrics.accessoryInset}px 0 0` }}
    >
      <Show when={props.row.icon}>
        {(icon) => (
          <CGImage
            name={icon()}
            style={{
              width: `${PreferencesMetrics.iconSize}px`,
              height: `${PreferencesMetrics.iconSize}px`,
              'margin-left': `${PreferencesMetrics.iconInset}px`,
              'flex-shrink': '0'
            }}
          />
        )}
      </Show>
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${UITableMetrics.rowFontSize}px`,
          'font-weight': '700',
          color: props.row.selected
            ? PreferencesPalette.selectedTitle
            : PreferencesPalette.rowTitle,
          'margin-left': `${PreferencesMetrics.iconInset}px`,
          'white-space': 'nowrap',
          overflow: 'hidden',
          'text-overflow': 'ellipsis'
        }}
      >
        {props.row.title}
      </span>

      <div class="ml-auto flex items-center" style={{ gap: '6px' }}>
        <Show when={props.row.value}>
          {(value) => (
            <span
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${PreferencesMetrics.valueFontSize}px`,
                color: UITablePalette.rowValue,
                'white-space': 'nowrap'
              }}
            >
              {value()}
            </span>
          )}
        </Show>

        <Switch>
          <Match when={props.row.accessory === PreferencesAccessory.chevron}>
            <CGImage name="UITableNext" />
          </Match>
          <Match when={props.row.accessory === PreferencesAccessory.checkmark}>
            <CGImage
              name="TWPickerTableCellChecked"
              style={{
                width: `${PreferencesMetrics.checkmarkSize}px`,
                height: `${PreferencesMetrics.checkmarkSize}px`
              }}
            />
          </Match>
          <Match when={props.row.accessory === PreferencesAccessory.spinner}>
            <Spinner />
          </Match>
          <Match when={props.row.accessory === PreferencesAccessory.toggle}>
            <UISwitch
              on={preferencesSwitchValue(
                props.row.binding,
                props.row.defaultsKey,
                props.row.defaultOn ?? false
              )}
              tone={props.row.tone ?? 'blue'}
              onChange={(next) =>
                preferencesSetSwitch(props.row.binding, props.row.defaultsKey, next)
              }
            />
          </Match>
        </Switch>
      </div>
    </div>
  )

  return (
    <Show when={interactive()} fallback={body()}>
      <button
        type="button"
        class="h-full w-full"
        onClick={() => props.onOpen(props.row.destination ?? '')}
      >
        {body()}
      </button>
    </Show>
  )
}
