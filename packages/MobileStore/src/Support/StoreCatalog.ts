import type { StoreItem, StoreTrack } from './StoreService'

const track = (
  number: number,
  title: string,
  seconds: number,
  price: number,
  explicit: boolean
): StoreTrack => ({ number, title, seconds, price, explicit })

export const CatalogAlbums: readonly StoreItem[] = [
  {
    id: 'kw-mbdtf',
    title: 'My Beautiful Dark Twisted Fantasy',
    artist: 'Kanye West',
    artwork:
      'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/d1/74/da/d174dacf-5782-dfe2-19f7-ce037dcd0237/00602527584935.rgb.jpg/300x300bb.jpg',
    kind: 'album',
    genre: 'Hip-Hop/Rap',
    released: '2010-11-22',
    price: 10.99,
    copyright: '℗ 2010 Roc-A-Fella Records, LLC',
    tracks: [
      track(1, 'Dark Fantasy', 280, 1.29, true),
      track(2, 'Gorgeous', 337, 1.29, true),
      track(3, 'Power', 292, 1.29, true),
      track(4, 'All of the Lights (Interlude)', 62, 0.99, false),
      track(5, 'All of the Lights', 300, 1.29, true),
      track(6, 'Monster', 373, 1.29, true),
      track(7, 'So Appalled', 238, 1.29, true),
      track(8, 'Devil in a New Dress', 351, 1.29, true),
      track(9, 'Runaway', 548, 1.29, true),
      track(10, 'Hell of a Life', 327, 1.29, true),
      track(11, 'Blame Game', 464, 1.29, true),
      track(12, 'Lost in the World', 252, 1.29, true),
      track(13, 'Who Will Survive in America', 98, 0.99, true)
    ]
  },
  {
    id: 'kw-graduation',
    title: 'Graduation',
    artist: 'Kanye West',
    artwork:
      'https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/39/25/2d/39252d65-2d50-b991-0962-f7a98a761271/00602517483507.rgb.jpg/300x300bb.jpg',
    kind: 'album',
    genre: 'Hip-Hop/Rap',
    released: '2007-09-11',
    price: 9.99,
    copyright: '℗ 2007 Roc-A-Fella Records, LLC',
    tracks: [
      track(1, 'Good Morning', 195, 1.29, false),
      track(2, 'Champion', 167, 1.29, true),
      track(3, 'Stronger', 311, 1.29, true),
      track(4, 'I Wonder', 243, 1.29, true),
      track(5, 'Good Life', 207, 1.29, true),
      track(6, "Can't Tell Me Nothing", 271, 1.29, true),
      track(7, 'Barry Bonds', 203, 1.29, true),
      track(8, 'Drunk and Hot Girls', 313, 1.29, true),
      track(9, 'Flashing Lights', 237, 1.29, true),
      track(10, 'Everything I Am', 227, 1.29, true),
      track(11, 'The Glory', 213, 1.29, true),
      track(12, 'Homecoming', 203, 1.29, true),
      track(13, 'Big Brother', 287, 1.29, true)
    ]
  },
  {
    id: 'kw-late-registration',
    title: 'Late Registration',
    artist: 'Kanye West',
    artwork:
      'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/0e/90/3c/0e903c43-9d81-f91b-90f1-727a58f7fb2c/00602498824030.rgb.jpg/300x300bb.jpg',
    kind: 'album',
    genre: 'Hip-Hop/Rap',
    released: '2005-08-30',
    price: 9.99,
    copyright: '℗ 2005 Roc-A-Fella Records, LLC',
    tracks: [
      track(1, 'Heard ‘Em Say', 203, 1.29, true),
      track(2, 'Touch the Sky', 236, 1.29, true),
      track(3, 'Gold Digger', 207, 1.29, true),
      track(4, 'Drive Slow', 267, 1.29, true),
      track(5, 'My Way Home', 103, 0.99, true),
      track(6, 'Crack Music', 250, 1.29, true),
      track(7, 'Roses', 240, 1.29, true),
      track(8, 'Bring Me Down', 197, 1.29, true),
      track(9, 'Addiction', 268, 1.29, true),
      track(10, 'Diamonds from Sierra Leone', 234, 1.29, true),
      track(11, 'We Major', 468, 1.29, true),
      track(12, 'Hey Mama', 305, 1.29, false),
      track(13, 'Gone', 373, 1.29, true)
    ]
  }
]
