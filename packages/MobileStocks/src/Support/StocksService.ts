import { createSignal } from 'solid-js'
import { NSUserDefaults } from 'NSUserDefaults'

const TickersKey = 'stocks'
const ModeKey = 'stock_mode'

export type StockMode = 'Price' | '%' | 'Mkt Cap'

export interface StockQuote {
  readonly symbol: string
  readonly name: string
  readonly currentPrice: number
  readonly open: number
  readonly high: number
  readonly low: number
  readonly change: number
  readonly percentChange: number
  readonly marketCap: number
  readonly peRatio: number
  readonly week52High: number
  readonly week52Low: number
  readonly volume: number
  readonly avgVolume: number
  readonly dividendYield: number
}

export interface StocksProvider {
  readonly quotes: () => readonly StockQuote[]
}

const quote = (
  symbol: string,
  name: string,
  currentPrice: number,
  open: number,
  high: number,
  low: number,
  change: number,
  marketCap: number,
  peRatio: number,
  week52High: number,
  week52Low: number,
  volume: number,
  avgVolume: number,
  dividendYield: number
): StockQuote => ({
  symbol,
  name,
  currentPrice,
  open,
  high,
  low,
  change,
  percentChange: change / (currentPrice - change),
  marketCap,
  peRatio,
  week52High,
  week52Low,
  volume,
  avgVolume,
  dividendYield
})

const seed: readonly StockQuote[] = [
  quote('AAPL', 'Apple Inc', 214.29, 212.1, 215.4, 211.8, 2.19, 3284000, 33.4, 237.49, 164.08, 48.2, 56.7, 0.0044),
  quote('GOOG', 'Alphabet Inc', 178.35, 180.02, 180.9, 177.4, -1.67, 2172000, 24.8, 193.31, 127.9, 16.4, 21.3, 0),
  quote('MSFT', 'Microsoft Corp', 424.58, 421.3, 426.1, 420.2, 3.28, 3155000, 36.1, 468.35, 362.9, 18.9, 22.4, 0.0071),
  quote('TSLA', 'Tesla Inc', 248.5, 254.9, 255.6, 246.1, -6.4, 792000, 61.2, 299.29, 138.8, 91.3, 104.6, 0),
  quote('AMZN', 'Amazon.com Inc', 186.44, 184.9, 187.2, 184.1, 1.54, 1943000, 42.7, 201.2, 118.35, 39.1, 44.8, 0)
]

const storedTickers = NSUserDefaults.object<string[]>(TickersKey)
const storedMode = NSUserDefaults.object<StockMode>(ModeKey)

const [quotes, setQuotes] = createSignal<readonly StockQuote[]>(seed)
const [tickers, setTickers] = createSignal<readonly string[]>(
  storedTickers ?? seed.map((entry) => entry.symbol)
)
const [mode, setMode] = createSignal<StockMode>(storedMode ?? 'Price')

export const stockMode = mode
export const stockTickers = tickers

export const stockQuotes = (): readonly StockQuote[] =>
  tickers()
    .map((symbol) => quotes().find((entry) => entry.symbol === symbol))
    .filter((entry): entry is StockQuote => entry !== undefined)

export const setStocksProvider = (provider: StocksProvider): void => {
  setQuotes(provider.quotes())
}

export const setStockMode = (next: StockMode): void => {
  setMode(next)
  NSUserDefaults.setObject(ModeKey, next)
}

const persistTickers = (next: readonly string[]): void => {
  setTickers(next)
  NSUserDefaults.setObject(TickersKey, [...next])
}

export const addTicker = (symbol: string): void => {
  const upper = symbol.toUpperCase()
  if (upper.length === 0 || tickers().includes(upper)) return
  if (!quotes().some((entry) => entry.symbol === upper)) return
  persistTickers([...tickers(), upper])
}

export const availableTickers = (): readonly string[] =>
  quotes()
    .map((entry) => entry.symbol)
    .filter((symbol) => !tickers().includes(symbol))

export const suffixNumber = (value: number): string => {
  const sign = value < 0 ? '-' : ''
  const magnitude = Math.abs(value)
  if (magnitude < 1000) return `${sign}${magnitude}`
  const exponent = Math.floor(Math.log10(magnitude) / 3)
  const units = ['K', 'M', 'B', 'T', 'P', 'E']
  const rounded = Math.round((10 * magnitude) / Math.pow(1000, exponent)) / 10
  return `${sign}${rounded}${units[exponent - 1] ?? ''}`
}

export const deltaLabel = (entry: StockQuote): string => {
  if (mode() === '%') return `${(entry.percentChange * 100).toFixed(2)}%`
  if (mode() === 'Mkt Cap') return suffixNumber(entry.marketCap * 1000000)
  return entry.change.toFixed(2)
}
