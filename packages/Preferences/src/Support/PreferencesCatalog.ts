import {
  PreferencesAccessory,
  PreferencesBinding,
  type PreferencesPageSpec,
  type PreferencesRowSpec,
  type PreferencesSectionSpec
} from './PreferencesTypes'

export const PreferencesPage = {
  root: 'Settings',
  wifi: 'Wi-Fi Networks',
  notifications: 'Notifications',
  location: 'Location Services',
  carrier: 'Carrier',
  sounds: 'Sounds',
  brightness: 'Brightness',
  wallpaper: 'Wallpaper',
  wallpaperSelect: 'Wallpaper_Select',
  wallpaperGrid: 'Wallpaper_Grid',
  wallpaperCameraRoll: 'Wallpaper_Grid_Camera_Roll',
  general: 'General',
  about: 'General_About',
  usage: 'General_Usage',
  network: 'General_Network',
  bluetooth: 'General_Bluetooth',
  autoLock: 'General_Autolock',
  dateTime: 'General_Date',
  keyboard: 'General_Keyboard',
  international: 'General_International',
  accessibility: 'General_Accessibility',
  mail: 'Mail, Contacts, Calendars',
  phone: 'Phone',
  safari: 'Safari',
  messages: 'Messages',
  ipod: 'iPod',
  photos: 'Photos',
  notes: 'Notes',
  store: 'Store'
} as const

const chevron = (
  id: string,
  title: string,
  destination?: string,
  value?: string
): PreferencesRowSpec => ({
  id,
  title,
  accessory: PreferencesAccessory.chevron,
  ...(destination ? { destination } : {}),
  ...(value ? { value } : {})
})

const detail = (id: string, title: string, value: string): PreferencesRowSpec => ({
  id,
  title,
  value,
  accessory: PreferencesAccessory.none
})

const toggle = (
  id: string,
  title: string,
  defaultOn: boolean,
  extra?: Partial<PreferencesRowSpec>
): PreferencesRowSpec => ({
  id,
  title,
  accessory: PreferencesAccessory.toggle,
  defaultsKey: id,
  defaultOn,
  ...extra
})

const section = (
  id: string,
  rows: readonly PreferencesRowSpec[],
  extra?: { header?: string; footnote?: string }
): PreferencesSectionSpec => ({ id, rows, ...extra })

const page = (
  id: string,
  title: string,
  sections: readonly PreferencesSectionSpec[]
): PreferencesPageSpec => ({ id, title, sections })

const rootSections: readonly PreferencesSectionSpec[] = [
  section('usage', [
    {
      id: 'airplane',
      title: 'Airplane Mode',
      icon: 'Settings_Airplane_Mode',
      accessory: PreferencesAccessory.toggle,
      binding: PreferencesBinding.airplaneMode,
      tone: 'orange'
    },
    {
      id: 'wifi',
      title: 'Wi-Fi',
      icon: 'Settings_Wifi',
      accessory: PreferencesAccessory.chevron,
      destination: PreferencesPage.wifi
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'Settings_Notifications',
      accessory: PreferencesAccessory.chevron,
      destination: PreferencesPage.notifications,
      value: 'On'
    },
    {
      id: 'location',
      title: 'Location Services',
      icon: 'Settings_Location',
      accessory: PreferencesAccessory.chevron,
      destination: PreferencesPage.location,
      value: 'On'
    },
    {
      id: 'carrier',
      title: 'Carrier',
      icon: 'Settings_Carrier',
      accessory: PreferencesAccessory.chevron,
      destination: PreferencesPage.carrier
    }
  ]),
  section('display', [
    {
      id: 'sounds',
      title: 'Sounds',
      icon: 'Settings_Sound',
      accessory: PreferencesAccessory.chevron,
      destination: PreferencesPage.sounds
    },
    {
      id: 'brightness',
      title: 'Brightness',
      icon: 'Settings_Brightness',
      accessory: PreferencesAccessory.chevron,
      destination: PreferencesPage.brightness
    },
    {
      id: 'wallpaper',
      title: 'Wallpaper',
      icon: 'Settings_Wallpaper',
      accessory: PreferencesAccessory.chevron,
      destination: PreferencesPage.wallpaper
    }
  ]),
  section('apps', [
    {
      id: 'general',
      title: 'General',
      icon: 'Settings_General',
      accessory: PreferencesAccessory.chevron,
      destination: PreferencesPage.general
    },
    {
      id: 'mail',
      title: 'Mail, Contacts, Calendars',
      icon: 'Settings_MCC',
      accessory: PreferencesAccessory.chevron,
      destination: PreferencesPage.mail
    },
    {
      id: 'phone',
      title: 'Phone',
      icon: 'Settings_Phone',
      accessory: PreferencesAccessory.chevron,
      destination: PreferencesPage.phone
    },
    {
      id: 'safari',
      title: 'Safari',
      icon: 'Settings_Safari',
      accessory: PreferencesAccessory.chevron,
      destination: PreferencesPage.safari
    },
    {
      id: 'messages',
      title: 'Messages',
      icon: 'Settings_Messages',
      accessory: PreferencesAccessory.chevron,
      destination: PreferencesPage.messages
    },
    {
      id: 'ipod',
      title: 'iPod',
      icon: 'Settings_iPod',
      accessory: PreferencesAccessory.chevron,
      destination: PreferencesPage.ipod
    },
    {
      id: 'photos',
      title: 'Photos',
      icon: 'Settings_Photos',
      accessory: PreferencesAccessory.chevron,
      destination: PreferencesPage.photos
    },
    {
      id: 'notes',
      title: 'Notes',
      icon: 'Settings_Notes',
      accessory: PreferencesAccessory.chevron,
      destination: PreferencesPage.notes
    },
    {
      id: 'store',
      title: 'Store',
      icon: 'Settings_App_Store',
      accessory: PreferencesAccessory.chevron,
      destination: PreferencesPage.store
    }
  ])
]

export const PreferencesRootPage = page(PreferencesPage.root, 'Settings', rootSections)

export const PreferencesPages: readonly PreferencesPageSpec[] = [
  PreferencesRootPage,

  page(PreferencesPage.notifications, 'Notifications', [
    section('top', [toggle('notificationsOn', 'Notifications', true)])
  ]),

  page(PreferencesPage.location, 'Location Services', [
    section('top', [toggle('locationOn', 'Location Services', true)]),
    section('apps', [
      toggle('locationCamera', 'Camera', true, { icon: 'Settings_Camera' })
    ])
  ]),

  page(PreferencesPage.carrier, 'Carrier', [
    section('carriers', [
      {
        id: 'carrierAutomatic',
        title: 'Automatic',
        accessory: PreferencesAccessory.checkmark,
        selected: true
      }
    ], { header: 'Carriers' })
  ]),

  page(PreferencesPage.general, 'General', [
    section('info', [
      chevron('about', 'About', PreferencesPage.about),
      chevron('usage', 'Usage', PreferencesPage.usage)
    ]),
    section('connectivity', [
      chevron('network', 'Network', PreferencesPage.network),
      chevron('bluetooth', 'Bluetooth', PreferencesPage.bluetooth)
    ]),
    section('spotlight', [chevron('spotlight', 'Spotlight Search')]),
    section('lock', [chevron('autolock', 'Auto-Lock', PreferencesPage.autoLock)]),
    section('input', [
      chevron('date', 'Date & Time', PreferencesPage.dateTime),
      chevron('keyboard', 'Keyboard', PreferencesPage.keyboard),
      chevron('international', 'International', PreferencesPage.international),
      chevron('accessibility', 'Accessibility', PreferencesPage.accessibility)
    ])
  ]),

  page(PreferencesPage.usage, 'Usage', [
    section('battery', [toggle('batteryPercentage', 'Battery Percentage', true)]),
    section(
      'time',
      [detail('usageTime', 'Usage', '0 bytes'), detail('standby', 'Standby', '0 bytes')],
      { header: 'Time since last full charge' }
    ),
    section(
      'calls',
      [
        detail('callCurrent', 'Current Period', '0 bytes'),
        detail('callLifetime', 'Lifetime', '0 bytes')
      ],
      { header: 'Call Time' }
    ),
    section(
      'data',
      [detail('dataSent', 'Sent', '0 bytes'), detail('dataReceived', 'Recieved', '0 bytes')],
      { header: 'Cellular Network Data' }
    )
  ]),

  page(PreferencesPage.network, 'Network', [
    section('threeG', [toggle('enable3G', 'Enable 3G', true)], {
      footnote: 'Using 3G loads data faster, but may\n decrease battery life.'
    }),
    section('cellular', [
      toggle('cellularData', 'Cellular Data', true, {
        binding: PreferencesBinding.cellularData
      })
    ]),
    section('cellularNetwork', [chevron('cellularNetwork', 'Cellular Data Network')]),
    section(
      'roaming',
      [
        toggle('dataRoaming', 'Data Roaming', false, {
          binding: PreferencesBinding.dataRoaming
        })
      ],
      {
        footnote:
          'Turn data roaming off when abroad\n to avoid susbtantial roaming charges\n when using email, web browsing, and\n other data services.'
      }
    ),
    section('vpn', [chevron('vpn', 'VPN')]),
    section('wifi', [chevron('networkWifi', 'Wi-Fi', PreferencesPage.wifi)])
  ]),

  page(PreferencesPage.bluetooth, 'Bluetooth', [
    section('power', [
      toggle('bluetoothOn', 'Bluetooth', false, { binding: PreferencesBinding.bluetooth })
    ]),
    section(
      'devices',
      [
        {
          id: 'searching',
          title: 'Searching...',
          accessory: PreferencesAccessory.spinner
        }
      ],
      { header: 'Devices' }
    )
  ]),

  page(PreferencesPage.autoLock, 'Autolock', [
    section('intervals', [
      { id: 'lock1', title: '1 Minute', accessory: PreferencesAccessory.none },
      { id: 'lock2', title: '2 Minutes', accessory: PreferencesAccessory.none },
      { id: 'lock3', title: '3 Minutes', accessory: PreferencesAccessory.none },
      { id: 'lock4', title: '4 Minutes', accessory: PreferencesAccessory.none },
      { id: 'lock5', title: '5 Minutes', accessory: PreferencesAccessory.none },
      {
        id: 'lockNever',
        title: 'Never',
        accessory: PreferencesAccessory.checkmark,
        selected: true
      }
    ])
  ]),

  page(PreferencesPage.dateTime, 'Date', [
    section('hour', [toggle('twentyFourHour', '24-Hour Time', false)]),
    section('automatic', [toggle('setAutomatically', 'Set Automatically', true)])
  ]),

  page(PreferencesPage.keyboard, 'Keyboard', [
    section(
      'typing',
      [
        toggle('autoCapitalization', 'Auto-Capitalization', true),
        toggle('autoCorrection', 'Auto-Correction', true),
        toggle('checkSpelling', 'Check Spelling', true),
        toggle('capsLock', 'Enable Caps Lock', true),
        toggle('periodShortcut', '"." Shortcut', true)
      ],
      { footnote: 'Double tapping the space bar will\n insert a period followed by a space.' }
    )
  ]),

  page(PreferencesPage.international, 'International', [
    section('language', [
      chevron('language', 'Language', undefined, 'English'),
      chevron('voiceControl', 'Voice Control', undefined, 'English'),
      chevron('keyboards', 'Keyboards', undefined, '1')
    ]),
    section('region', [
      chevron('regionFormat', 'Region Format', undefined, 'United States'),
      chevron('calendar', 'Calendar', undefined, 'Gregorian')
    ])
  ]),

  page(PreferencesPage.accessibility, 'Accessibility', [
    section('vision', [
      chevron('voiceOver', 'VoiceOver', undefined, 'Off'),
      chevron('zoom', 'Zoom', undefined, 'Off'),
      chevron('largeText', 'Large Text', undefined, 'Off'),
      toggle('whiteOnBlack', 'White on Black', false)
    ]),
    section(
      'hearing',
      [
        toggle('monoAudio', 'Mono audio', false),
        toggle('speakAutoText', 'Speak Auto-text', false)
      ],
      { footnote: 'Automatically speak auto-corrections\n and auto-capitalizations.' }
    ),
    section('home', [chevron('tripleClick', 'Triple-click Home', undefined, 'Off')])
  ]),

  page(PreferencesPage.mail, 'Mail, Contacts, Calendars', [
    section('accounts', [chevron('addAccount', 'Add Account...')], { header: 'Accounts' }),
    section('fetch', [chevron('fetchNewData', 'Fetch New Data', undefined, 'Push')]),
    section(
      'mail',
      [
        chevron('mailShow', 'Show', undefined, '50 Recent Messages'),
        chevron('mailPreview', 'Preview', undefined, '2 Lines'),
        chevron('mailFontSize', 'Minimum Font Size', undefined, 'Medium'),
        toggle('showToCc', 'Show to/Cc Label', false),
        toggle('askBeforeDeleting', 'Ask Before Deleting', false),
        toggle('loadRemoteImages', 'Load Remote Images', true),
        toggle('organizeByThread', 'Organize by Thread', true)
      ],
      { header: 'Mail' }
    ),
    section('signature', [
      toggle('alwaysBcc', 'Always Bcc Myself', false),
      chevron('signature', 'Signature', undefined, 'Sent from my iPhone')
    ]),
    section(
      'contacts',
      [
        chevron('sortOrder', 'Sort Order', undefined, 'Last, First'),
        chevron('displayOrder', 'Display Order', undefined, 'First, Last')
      ],
      { header: 'Contacts' }
    ),
    section(
      'calendars',
      [
        toggle('invitationAlerts', 'New Invitation Alerts', true),
        chevron('timeZoneSupport', 'Time Zone Support')
      ],
      { header: 'Calendars' }
    )
  ]),

  page(PreferencesPage.phone, 'Phone', [
    section('number', [detail('myNumber', 'My Number', 'Unknown')]),
    section('facetime', [toggle('faceTime', 'FaceTime', true)]),
    section(
      'calls',
      [
        chevron('callForwarding', 'Call Forwarding'),
        chevron('callWaiting', 'Call Waiting'),
        chevron('callerId', 'Show My Caller ID'),
        toggle('tty', 'TTY', false)
      ],
      { header: 'Calls' }
    ),
    section('international', [toggle('internationalAssist', 'International Assist', true)], {
      footnote:
        'International Assist automatically\n adds the correct prefix to US\n numbers when dialing from abroad.'
    }),
    section('sim', [chevron('simPin', 'SIM PIN')])
  ]),

  page(PreferencesPage.safari, 'Safari', [
    section(
      'timeTravel',
      [
        toggle('timeTravel', 'Time Travel', true, {
          binding: PreferencesBinding.webTimeTravel
        })
      ],
      {
        header: 'Time Travel',
        footnote: 'Show websites as they looked in 2011,\n courtesy of the Internet Archive.'
      }
    ),
    section('search', [chevron('searchEngine', 'Search Engine', undefined, 'Google')], {
      header: 'General'
    }),
    section('autofill', [chevron('autoFill', 'AutoFill', undefined, 'Off')]),
    section('fraud', [toggle('fraudWarning', 'Fraud Warning', true)], {
      header: 'Security',
      footnote: 'Warn when visiting fradulent websites.'
    }),
    section('content', [
      toggle('javaScript', 'JavaScript', true),
      toggle('blockPopups', 'Block Pop-ups', true),
      chevron('acceptCookies', 'Accept Cookies', undefined, 'From visited')
    ])
  ]),

  page(PreferencesPage.messages, 'Messages', [
    section('preview', [toggle('showPreview', 'Show Preview', true)]),
    section('tone', [chevron('alertTone', 'Play Alert Tone', undefined, 'Twice')]),
    section('mms', [
      toggle('mmsMessaging', 'MMS Messaging', true),
      toggle('groupMessaging', 'Group Messaging', false),
      toggle('showSubject', 'Show Subject Field', false)
    ]),
    section('count', [toggle('characterCount', 'Character Count', false)])
  ]),

  page(PreferencesPage.ipod, 'iPod', [
    section(
      'music',
      [
        toggle('shakeToShuffle', 'Shake to Shuffle', false),
        toggle('soundCheck', 'Sound Check', false),
        chevron('equalizer', 'EQ', undefined, 'Off'),
        chevron('volumeLimit', 'Volume Limit', undefined, 'Off'),
        toggle('lyricsPodcast', 'Lyrics & Podcast Info', true)
      ],
      { header: 'Music' }
    ),
    section('video', [
      chevron('startPlaying', 'Start Playing', undefined, 'Where Left Off'),
      toggle('closedCaptioning', 'Closed Captioning', false)
    ]),
    section('tv', [
      toggle('widescreen', 'Widescreen', false),
      chevron('tvSignal', 'TV Signal', undefined, 'NTSC')
    ])
  ]),

  page(PreferencesPage.photos, 'Photos', [
    section(
      'slideshow',
      [
        chevron('slideDuration', 'Play Each Slide For', undefined, '3 Seconds'),
        toggle('slideRepeat', 'Repeat', false),
        toggle('slideShuffle', 'Shuffle', false)
      ],
      { header: 'Slideshow' }
    ),
    section('hdr', [toggle('keepNormalPhoto', 'Keep Normal Photo', true)], {
      header: 'HDR (High Dynamic Range)',
      footnote: 'Save the normal exposed photo in\n addition to the HDR version.'
    })
  ]),

  page(PreferencesPage.notes, 'Notes', [
    section(
      'font',
      [
        {
          id: 'fontNoteworthy',
          title: 'Noteworthy',
          accessory: PreferencesAccessory.checkmark,
          selected: true
        },
        { id: 'fontHelvetica', title: 'Helvetica', accessory: PreferencesAccessory.none },
        { id: 'fontMarkerFelt', title: 'Marker Felt', accessory: PreferencesAccessory.none }
      ],
      { header: 'Font' }
    )
  ]),

  page(PreferencesPage.store, 'Store', [
    section('account', [
      { id: 'signIn', title: 'Sign In', accessory: PreferencesAccessory.none }
    ])
  ])
]

export const preferencesPageFor = (id: string): PreferencesPageSpec | undefined =>
  PreferencesPages.find((entry) => entry.id === id)
