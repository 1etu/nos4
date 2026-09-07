import { Match, Show, Switch, createMemo, createSignal, onCleanup, onMount } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import type { CLPlacemark } from 'CoreLocation'
import {
  clLocation,
  clRequestWhenInUseAuthorization,
  clStartUpdatingLocation,
  clStopUpdatingLocation,
  type CLLocationCoordinate2D
} from 'CoreLocation'
import { UIStatusBar } from 'UIKit'
import { MapsCancelBar } from '../Chrome/MapsCancelBar'
import { MapsSearchBar } from '../Chrome/MapsSearchBar'
import { MapsToolBar } from '../Chrome/MapsToolBar'
import { MapsDirectionsBar } from '../Directions/MapsDirectionsBar'
import { MapsDirectionsFooter } from '../Directions/MapsDirectionsFooter'
import { MapsDirectionsModeBar } from '../Directions/MapsDirectionsModeBar'
import { MapsNavigationBar } from '../Directions/MapsNavigationBar'
import { MapsSuggestionList } from '../Chrome/MapsSuggestionList'
import { MKCurlView } from '../Map/MKCurlView'
import { mkRasteriseMap } from '../Map/MKMapRaster'
import { MKMapView, type MKMapRegion } from '../Map/MKMapView'
import { mkZoomForBounds } from '../Map/MKProjection'
import { MapsBackPanel } from '../Settings/MapsBackPanel'
import { MapsMetrics } from '../Support/MapsMetrics'
import {
  MKDirectionsDidCalculate,
  MKLocalSearchDidComplete,
  MKMapViewRegionDidChange,
  MapsIdentifier
} from '../Support/MapsNotifications'
import {
  mapsCalculateRoute,
  mapsSearchPlacemarks,
  mapsSuggestPlaces
} from '../Support/MapsService'
import {
  MapsEditingState,
  MapsPinTone,
  MapsSegment,
  MapsTransport,
  MapsType,
  type MapsAnnotation,
  type MapsEditingStateValue,
  type MapsRoute,
  type MapsRouteStep,
  type MapsSegmentValue,
  type MapsTransportValue,
  type MapsTypeValue
} from '../Support/MapsTypes'

const FallbackCentre: CLLocationCoordinate2D = { latitude: 37.331686, longitude: -122.030656 }

export const MapsApp = (props: { width: number; height: number }) => {
  const [segment, setSegment] = createSignal<MapsSegmentValue>(MapsSegment.search)
  const [editing, setEditing] = createSignal<MapsEditingStateValue>(MapsEditingState.none)
  const [searchText, setSearchText] = createSignal('')
  const [destinationText, setDestinationText] = createSignal('')
  const [searchPins, setSearchPins] = createSignal<readonly MapsAnnotation[]>([])
  const [routePins, setRoutePins] = createSignal<readonly MapsAnnotation[]>([])
  const [route, setRoute] = createSignal<MapsRoute | undefined>()
  const [transport, setTransport] = createSignal<MapsTransportValue>(MapsTransport.automobile)
  const [mapType, setMapType] = createSignal<MapsTypeValue>(MapsType.standard)
  const [traffic, setTraffic] = createSignal(false)
  const [curled, setCurled] = createSignal(false)
  const [curlSource, setCurlSource] = createSignal<HTMLCanvasElement | undefined>()
  const [tracking, setTracking] = createSignal(false)
  const [selected, setSelected] = createSignal<string | undefined>()
  const [routed, setRouted] = createSignal(false)
  const [navigating, setNavigating] = createSignal(false)
  const [stepIndex, setStepIndex] = createSignal(0)
  const [suggestions, setSuggestions] = createSignal<readonly CLPlacemark[]>([])
  const [searching, setSearching] = createSignal(false)
  const [region, setRegion] = createSignal<MKMapRegion>({
    centre: FallbackCentre,
    zoom: MapsMetrics.defaultZoom
  })

  let reveal: ReturnType<typeof setTimeout> | undefined
  let lookup: ReturnType<typeof setTimeout> | undefined
  let lookupToken = 0

  const clearReveal = () => {
    clearTimeout(reveal)
    reveal = undefined
  }

  const clearLookup = () => {
    lookupToken += 1
    clearTimeout(lookup)
    lookup = undefined
    setSearching(false)
  }

  onMount(() => {
    clRequestWhenInUseAuthorization()
    clStartUpdatingLocation()
  })

  onCleanup(() => {
    clStopUpdatingLocation()
    clearReveal()
    clearLookup()
  })

  const here = (): CLLocationCoordinate2D => clLocation()?.coordinate ?? region().centre

  const mapHeight = createMemo(
    () =>
      props.height -
      MapsMetrics.statusBarHeight -
      MapsMetrics.titleBarHeight -
      MapsMetrics.toolBarHeight
  )

  const annotations = createMemo(() =>
    segment() === MapsSegment.search ? searchPins() : routePins()
  )

  const moveTo = (centre: CLLocationCoordinate2D, zoom: number) => {
    setRegion({ centre, zoom })
    NSNotificationCenter.post(MKMapViewRegionDidChange, MapsIdentifier, { centre, zoom })
  }

  const suggest = (query: string) => {
    clearTimeout(lookup)
    const trimmed = query.trim()
    if (trimmed.length < MapsMetrics.suggestionMinimumLength) {
      lookupToken += 1
      setSuggestions([])
      setSearching(false)
      return
    }
    setSearching(true)
    lookup = setTimeout(() => {
      lookup = undefined
      lookupToken += 1
      const token = lookupToken
      void mapsSuggestPlaces(trimmed, here()).then((places) => {
        if (token !== lookupToken) return
        setSuggestions(places)
        setSearching(false)
      })
    }, MapsMetrics.suggestionDebounceMilliseconds)
  }

  const showPlace = (place: CLPlacemark) => {
    const pin: MapsAnnotation = {
      id: 'search-0',
      title: place.name,
      subtitle: place.locality,
      coordinate: place.coordinate,
      tone: MapsPinTone.destination
    }
    setSearchPins([pin])
    setSelected(undefined)
    setTracking(false)
    moveTo(place.coordinate, MapsMetrics.defaultZoom)
    clearReveal()
    reveal = setTimeout(() => {
      reveal = undefined
      setSelected(pin.id)
    }, MapsMetrics.calloutRevealMilliseconds)
  }

  const chooseSuggestion = (place: CLPlacemark) => {
    clearLookup()
    setSuggestions([])
    setEditing(MapsEditingState.none)
    if (segment() === MapsSegment.directions) {
      setDestinationText(place.name)
      void runDirections(transport(), place)
      return
    }
    setSearchText(place.name)
    showPlace(place)
  }

  const runSearch = async () => {
    const query = searchText().trim()
    if (query.length === 0) return
    const places = await mapsSearchPlacemarks(query, here())
    NSNotificationCenter.post(MKLocalSearchDidComplete, MapsIdentifier, {
      query,
      matches: places.length
    })
    const pins = places.map((place, index) => ({
      id: `search-${index}`,
      title: place.name,
      subtitle: place.locality,
      coordinate: place.coordinate,
      tone: MapsPinTone.destination
    }))
    setSearchPins(pins)
    setSelected(undefined)
    const first = pins[0]
    if (!first) return
    setTracking(false)
    moveTo(first.coordinate, MapsMetrics.defaultZoom)
    clearReveal()
    reveal = setTimeout(() => {
      reveal = undefined
      setSelected(first.id)
    }, MapsMetrics.calloutRevealMilliseconds)
  }

  const runDirections = async (mode: MapsTransportValue, place?: CLPlacemark) => {
    const query = destinationText().trim()
    if (!place && query.length === 0) return
    const origin = here()
    const target = place ?? (await mapsSearchPlacemarks(query, origin))[0]
    if (!target) return
    const found = await mapsCalculateRoute(origin, target.coordinate, mode)
    if (!found) return
    setRoute(found)
    setRoutePins([
      {
        id: 'route-origin',
        title: 'Current Location',
        subtitle: '',
        coordinate: origin,
        tone: MapsPinTone.origin
      },
      {
        id: 'route-destination',
        title: target.name,
        subtitle: target.locality,
        coordinate: target.coordinate,
        tone: MapsPinTone.destination
      }
    ])
    setRouted(true)
    setNavigating(false)
    setStepIndex(0)
    setSelected(undefined)
    setTracking(false)
    const bounds = mkZoomForBounds(found.path, props.width, mapHeight())
    if (bounds) moveTo(bounds.centre, bounds.zoom)
    NSNotificationCenter.post(MKDirectionsDidCalculate, MapsIdentifier, {
      transport: mode,
      route: found
    })
  }

  const steps = (): readonly MapsRouteStep[] => route()?.steps ?? []

  const goToStep = (next: number) => {
    const list = steps()
    const clamped = Math.min(Math.max(next, 0), Math.max(list.length - 1, 0))
    setStepIndex(clamped)
    const step = list[clamped]
    if (step) moveTo(step.coordinate, MapsMetrics.navStepZoom)
  }

  const startNavigation = () => {
    if (steps().length === 0) {
      setSelected('route-destination')
      return
    }
    setNavigating(true)
    setSelected(undefined)
    setTracking(false)
    goToStep(0)
  }

  const endNavigation = () => {
    setNavigating(false)
    const found = route()
    if (!found) return
    const bounds = mkZoomForBounds(found.path, props.width, mapHeight())
    if (bounds) moveTo(bounds.centre, bounds.zoom)
  }

  const onTracking = () => {
    const next = !tracking()
    setTracking(next)
    if (!next) return
    clRequestWhenInUseAuthorization()
    moveTo(here(), MapsMetrics.defaultZoom)
  }

  const dropPin = () => {
    setCurled(false)
    setSegment(MapsSegment.search)
    const centre = region().centre
    const pin: MapsAnnotation = {
      id: `dropped-${Date.now()}`,
      title: 'Dropped Pin',
      subtitle: '',
      coordinate: centre,
      tone: MapsPinTone.dropped
    }
    setSearchPins([...searchPins(), pin])
    setSelected(pin.id)
  }

  const changeTransport = (mode: MapsTransportValue) => {
    setTransport(mode)
    void runDirections(mode)
  }

  const suggesting = () =>
    editingActive() && searchTextFor().trim().length >= MapsMetrics.suggestionMinimumLength

  const searchTextFor = () =>
    segment() === MapsSegment.directions ? destinationText() : searchText()

  const toggleCurl = async () => {
    if (curled()) {
      setCurled(false)
      return
    }
    const sheet = await mkRasteriseMap({
      width: props.width,
      height: mapHeight(),
      centre: region().centre,
      zoom: region().zoom,
      type: mapType(),
      annotations: annotations(),
      route: segment() === MapsSegment.directions ? route() : undefined
    })
    if (!sheet) return
    setCurlSource(sheet)
    setCurled(true)
  }

  const onCurlSettled = (open: boolean) => {
    if (open) return
    setCurlSource(undefined)
  }

  const editingActive = () => editing() !== MapsEditingState.none

  const beginEditing = (value: string) =>
    setEditing(value.length > 0 ? MapsEditingState.active : MapsEditingState.activeEmpty)

  return (
    <div
      class="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: 'black' }}
    >
      <UIStatusBar />
      <div class="shrink-0" style={{ height: `${MapsMetrics.titleBarHeight}px` }} />

      <div
        class="absolute left-0 right-0"
        style={{ top: `${MapsMetrics.statusBarHeight}px`, 'z-index': '3' }}
      >
      <Switch>
        <Match when={segment() === MapsSegment.search}>
          <MapsCancelBar
            open={editingActive()}
            title="Search"
            onClear={() => setSearchText('')}
            onCancel={() => setEditing(MapsEditingState.none)}
          />
          <MapsSearchBar
            value={searchText()}
            editing={editing()}
            onInput={(value) => {
              setSearchText(value)
              suggest(value)
              if (editingActive()) beginEditing(value)
            }}
            onFocus={() => {
              beginEditing(searchText())
              suggest(searchText())
            }}
            onBlur={() => setEditing(MapsEditingState.none)}
            onSubmit={() => {
              clearLookup()
              void runSearch()
            }}
          />
        </Match>
        <Match when={routed() && navigating()}>
          <MapsNavigationBar
            step={steps()[stepIndex()]}
            index={stepIndex()}
            total={steps().length}
            onPrevious={() => goToStep(stepIndex() - 1)}
            onNext={() => goToStep(stepIndex() + 1)}
            onEnd={endNavigation}
          />
        </Match>
        <Match when={routed()}>
          <MapsDirectionsModeBar
            transport={transport()}
            onTransport={changeTransport}
            onEdit={() => {
              setRouted(false)
              setNavigating(false)
            }}
            onStart={startNavigation}
          />
          <MapsDirectionsFooter
            distance={route()?.distance ?? ''}
            duration={route()?.duration ?? ''}
          />
        </Match>
        <Match when={segment() === MapsSegment.directions}>
          <MapsCancelBar
            open={editingActive()}
            title="Directions"
            onClear={() => setDestinationText('')}
            onCancel={() => setEditing(MapsEditingState.none)}
          />
          <MapsDirectionsBar
            origin="Current Location"
            destination={destinationText()}
            editing={editing()}
            onDestination={(value) => {
              setDestinationText(value)
              suggest(value)
              if (editingActive()) beginEditing(value)
            }}
            onFocus={() => {
              beginEditing(destinationText())
              suggest(destinationText())
            }}
            onBlur={() => setEditing(MapsEditingState.none)}
            onSubmit={() => {
              clearLookup()
              void runDirections(transport())
            }}
            onSwap={() => setDestinationText('')}
          />
        </Match>
      </Switch>

      <Show when={suggesting()}>
        <MapsSuggestionList
          height={Math.min(mapHeight(), MapsMetrics.suggestionRowHeight * 6)}
          suggestions={suggestions()}
          searching={searching()}
          query={searchTextFor()}
          onSelect={chooseSuggestion}
        />
      </Show>
      </div>

      <div class="relative shrink-0" style={{ height: `${mapHeight()}px` }}>
        <MapsBackPanel
          width={props.width}
          height={mapHeight()}
          type={mapType()}
          traffic={traffic()}
          onType={setMapType}
          onDropPin={dropPin}
          onTraffic={() => setTraffic(!traffic())}
        />
        <div
          class="absolute left-0 top-0"
          style={{
            width: `${props.width}px`,
            height: `${mapHeight()}px`,
            visibility: curlSource() ? 'hidden' : 'visible'
          }}
        >
          <MKMapView
            width={props.width}
            height={mapHeight()}
            type={mapType()}
            region={region()}
            annotations={annotations()}
            route={segment() === MapsSegment.directions ? route() : undefined}
            userLocation={clLocation()}
            selected={selected()}
            onRegionChange={(next) => {
              setRegion(next)
              setTracking(false)
            }}
            onSelect={setSelected}
          />
        </div>
        <Show when={curlSource()}>
          {(sheet) => (
            <MKCurlView
              width={props.width}
              height={mapHeight()}
              source={sheet()}
              curled={curled()}
              onSettled={onCurlSettled}
            />
          )}
        </Show>
      </div>

      <div
        class="absolute left-0 right-0 bottom-0"
        style={{
          top: `${MapsMetrics.statusBarHeight}px`,
          background: 'black',
          opacity: editingActive() ? MapsMetrics.editingOverlayOpacity : 0,
          'pointer-events': editingActive() ? 'auto' : 'none',
          transition: `opacity ${MapsMetrics.editingMilliseconds}ms ease-in-out`,
          'z-index': '2'
        }}
        onClick={() => setEditing(MapsEditingState.none)}
      />

      <MapsToolBar
        segment={segment()}
        tracking={tracking()}
        curled={curled()}
        onSegment={(next) => {
          setSegment(next)
          setSelected(undefined)
          setEditing(MapsEditingState.none)
        }}
        onTracking={onTracking}
        onCurl={() => void toggleCurl()}
      />
    </div>
  )
}
