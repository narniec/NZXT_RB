/**
 * useCrypto — React hook that fetches and caches:
 *   • Coin/USD price + 24h change  (configurable interval, default 30s)
 *   • Coin 24h price history       (configurable interval, default 5min)
 *   • USD/RUB exchange rate        (configurable interval, default 5min)
 *
 * Coin selection and intervals are read from useCryptoStore (persisted).
 * Each data type has a 3-provider fallback chain (all CORS-safe, no API key needed).
 * Failed fetches fall back to localStorage cache; stale data is flagged.
 */

import React from 'react'
import { ICryptoData } from './types'
import { useCryptoStore } from 'store/crypto'
import { TCoinId } from 'store/crypto/types'

// ─── Coin metadata ─────────────────────────────────────────────────────────────

interface CoinMeta {
  cgId: string
  ccId: string
  symbol: string
  name: string
  hasBlockchain: boolean
}

const COINS: Record<TCoinId, CoinMeta> = {
  BTC: { cgId: 'bitcoin',     ccId: 'bitcoin',      symbol: '₿',   name: 'BTC', hasBlockchain: true  },
  ETH: { cgId: 'ethereum',    ccId: 'ethereum',     symbol: 'Ξ',   name: 'ETH', hasBlockchain: false },
  SOL: { cgId: 'solana',      ccId: 'solana',       symbol: '◎',   name: 'SOL', hasBlockchain: false },
  BNB: { cgId: 'binancecoin', ccId: 'binance-coin', symbol: 'BNB', name: 'BNB', hasBlockchain: false },
  XRP: { cgId: 'ripple',      ccId: 'xrp',          symbol: '✕',   name: 'XRP', hasBlockchain: false },
}

// ─── localStorage cache helpers ──────────────────────────────────────────────

const NS = 'nzxt_crypto_'

function saveCache(key: string, value: unknown): void {
  try {
    localStorage.setItem(NS + key, JSON.stringify({ v: value, t: Date.now() }))
  } catch {
    /* quota exceeded — ignore */
  }
}

function loadCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(NS + key)
    if (!raw) return null
    return (JSON.parse(raw) as { v: T }).v
  } catch {
    return null
  }
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function get(url: string, signal: AbortSignal): Promise<unknown> {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`)
  return res.json()
}

type PriceResult = { price: number; change24h: number | null }

async function fetchCoinPrice(meta: CoinMeta, signal: AbortSignal): Promise<PriceResult | null> {
  const providers: Array<() => Promise<PriceResult>> = [
    async () => {
      const j = (await get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${meta.cgId}&vs_currencies=usd&include_24hr_change=true`,
        signal,
      )) as Record<string, { usd: number; usd_24h_change: number }>
      const d = j[meta.cgId]
      return { price: d.usd, change24h: d.usd_24h_change ?? null }
    },
    async () => {
      const j = (await get(`https://api.coincap.io/v2/assets/${meta.ccId}`, signal)) as {
        data: { priceUsd: string; changePercent24Hr: string }
      }
      return {
        price: parseFloat(j.data.priceUsd),
        change24h: parseFloat(j.data.changePercent24Hr),
      }
    },
  ]

  if (meta.hasBlockchain) {
    providers.push(async () => {
      const j = (await get('https://blockchain.info/ticker', signal)) as { USD: { last: number } }
      return { price: j.USD.last, change24h: null }
    })
  }

  for (const fn of providers) {
    try {
      const r = await fn()
      if (r.price > 0) return r
    } catch {
      /* try next */
    }
  }
  return null
}

async function fetchCoinHistory(meta: CoinMeta, signal: AbortSignal): Promise<number[] | null> {
  const providers: Array<() => Promise<number[]>> = [
    async () => {
      const j = (await get(
        `https://api.coingecko.com/api/v3/coins/${meta.cgId}/market_chart?vs_currency=usd&days=1&interval=hourly`,
        signal,
      )) as { prices: [number, number][] }
      return j.prices.map(([, p]) => p)
    },
    async () => {
      const end = Date.now()
      const start = end - 86_400_000
      const j = (await get(
        `https://api.coincap.io/v2/assets/${meta.ccId}/history?interval=h1&start=${start}&end=${end}`,
        signal,
      )) as { data: { priceUsd: string }[] }
      return j.data.map(d => parseFloat(d.priceUsd))
    },
  ]

  for (const fn of providers) {
    try {
      const prices = await fn()
      if (prices.length >= 3) return prices
    } catch {
      /* try next */
    }
  }
  return null
}

async function fetchUsdRub(signal: AbortSignal): Promise<number | null> {
  const providers: Array<() => Promise<number>> = [
    async () => {
      const j = (await get(
        'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
        signal,
      )) as { usd: Record<string, number> }
      const r = j.usd?.rub
      if (!r) throw new Error('RUB missing')
      return r
    },
    async () => {
      const j = (await get('https://open.er-api.com/v6/latest/USD', signal)) as {
        rates: Record<string, number>
      }
      const r = j.rates?.RUB
      if (!r) throw new Error('RUB missing')
      return r
    },
    async () => {
      const j = (await get('https://api.exchangerate-api.com/v4/latest/USD', signal)) as {
        rates: Record<string, number>
      }
      const r = j.rates?.RUB
      if (!r) throw new Error('RUB missing')
      return r
    },
  ]

  for (const fn of providers) {
    try {
      const r = await fn()
      if (r > 0) return r
    } catch {
      /* try next */
    }
  }
  return null
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useCrypto = (): ICryptoData => {
  const { coin, priceIntervalMs, historyIntervalMs, fxIntervalMs } = useCryptoStore()

  const [data, setData] = React.useState<ICryptoData>(() => {
    const meta = COINS[coin]
    const priceKey = `${coin.toLowerCase()}_price`
    const historyKey = `${coin.toLowerCase()}_history`
    const price = loadCache<PriceResult>(priceKey)
    const hist  = loadCache<number[]>(historyKey)
    const rub   = loadCache<number>('usd_rub')
    return {
      coinPrice:    price?.price ?? null,
      coinChange24h: price?.change24h ?? null,
      coinHistory:  hist ?? [],
      coinSymbol:   meta.symbol,
      coinName:     meta.name,
      usdRub:       rub ?? null,
      coinStale:    price !== null,
      fxStale:      rub !== null,
    }
  })

  React.useEffect(() => {
    const ac = new AbortController()
    const { signal } = ac
    const meta = COINS[coin]
    const priceKey = `${coin.toLowerCase()}_price`
    const historyKey = `${coin.toLowerCase()}_history`

    // Load cached data for this coin immediately (covers coin-change transition)
    const cachedPrice = loadCache<PriceResult>(priceKey)
    const cachedHist  = loadCache<number[]>(historyKey)
    setData(s => ({
      ...s,
      coinPrice:     cachedPrice?.price ?? null,
      coinChange24h: cachedPrice?.change24h ?? null,
      coinHistory:   cachedHist ?? [],
      coinSymbol:    meta.symbol,
      coinName:      meta.name,
      coinStale:     cachedPrice !== null,
    }))

    async function refreshPrice() {
      const r = await fetchCoinPrice(meta, signal)
      if (signal.aborted) return
      if (r) {
        saveCache(priceKey, r)
        setData(s => ({ ...s, coinPrice: r.price, coinChange24h: r.change24h, coinStale: false }))
      } else {
        const cached = loadCache<PriceResult>(priceKey)
        if (cached) setData(s => ({ ...s, coinPrice: cached.price, coinChange24h: cached.change24h, coinStale: true }))
      }
    }

    async function refreshHistory() {
      const prices = await fetchCoinHistory(meta, signal)
      if (signal.aborted) return
      if (prices) {
        saveCache(historyKey, prices)
        setData(s => ({ ...s, coinHistory: prices }))
      } else {
        const cached = loadCache<number[]>(historyKey)
        if (cached) setData(s => ({ ...s, coinHistory: cached }))
      }
    }

    async function refreshFx() {
      const rate = await fetchUsdRub(signal)
      if (signal.aborted) return
      if (rate !== null) {
        saveCache('usd_rub', rate)
        setData(s => ({ ...s, usdRub: rate, fxStale: false }))
      } else {
        const cached = loadCache<number>('usd_rub')
        if (cached !== null) setData(s => ({ ...s, usdRub: cached, fxStale: true }))
      }
    }

    refreshPrice()
    refreshHistory()
    refreshFx()

    const t1 = setInterval(refreshPrice, priceIntervalMs)
    const t2 = setInterval(refreshHistory, historyIntervalMs)
    const t3 = setInterval(refreshFx, fxIntervalMs)

    return () => {
      ac.abort()
      clearInterval(t1)
      clearInterval(t2)
      clearInterval(t3)
    }
  }, [coin, priceIntervalMs, historyIntervalMs, fxIntervalMs])

  return data
}
