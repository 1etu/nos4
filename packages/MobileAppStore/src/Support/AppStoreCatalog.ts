export interface AppStoreCategory {
  readonly name: string
  readonly genreId: string
}

export const AppStoreCategories: readonly AppStoreCategory[] = [
  { name: 'Books', genreId: '6018' },
  { name: 'Business', genreId: '6000' },
  { name: 'Education', genreId: '6017' },
  { name: 'Entertainment', genreId: '6016' },
  { name: 'Finance', genreId: '6015' },
  { name: 'Food & Drink', genreId: '6023' },
  { name: 'Games', genreId: '6014' },
  { name: 'Health & Fitness', genreId: '6013' },
  { name: 'Kids', genreId: '7010' },
  { name: 'Lifestyle', genreId: '6012' },
  { name: 'Magazines & Newspapers', genreId: '6021' },
  { name: 'Medical', genreId: '6020' },
  { name: 'Music', genreId: '6011' },
  { name: 'Navigation', genreId: '6010' },
  { name: 'News', genreId: '6009' },
  { name: 'Photo & Video', genreId: '6008' },
  { name: 'Productivity', genreId: '6007' },
  { name: 'Reference', genreId: '6006' },
  { name: 'Shopping', genreId: '6024' },
  { name: 'Social Networking', genreId: '6005' },
  { name: 'Sports', genreId: '6004' },
  { name: 'Travel', genreId: '6003' },
  { name: 'Utilities', genreId: '6002' },
  { name: 'Weather', genreId: '6001' }
]
