/**
 * useCrypto — React hook that fetches and caches:
 *   • BTC/USD price + 24h change  (refresh every 30s)
 *   • BTC 24h price history       (refresh every 5min, for sparkline)
 *   • USD/RUB exchange rate       (refresh every 5min)
 *
 * Each data type has a 3-provider fallback chain (all CORS-safe, no API key needed).
 * Failed fetches fall back to localStorage cache; stale data is flagged.
 */

import React from 'react'
import { ICryptoData } from './types'

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

async function fetchBtcPrice(signal: AbortSignal): Promise<PriceResult | null> {
  const providers: Array<() => Promise<PriceResult>> = [
    async () => {
      const j = (await get(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
        signal,
      )) as { bitcoin: { usd: number; usd_24h_change: number } }
      return { price: j.bitcoin.usd, change24h: j.bitcoin.usd_24h_change ?? null }
    },
    async () => {
      const j = (await get('https://api.coincap.io/v2/assets/bitcoin', signal)) as {
        data: { priceUsd: string; changePercent24Hr: string }
      }
      return {
        price: parseFloat(j.data.priceUsd),
        change24h: parseFloat(j.data.changePercent24Hr),
      }
    },
    async () => {
      const j = (await get('https://blockchain.info/ticker', signal)) as {
        USD: { last: number }
      }
      return { price: j.USD.last, change24h: null }
    },
  ]

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

async function fetchBtcHistory(signal: AbortSignal): Promise<number[] | null> {
  const providers: Array<() => Promise<number[]>> = [
    async () => {
      const j = (await get(
        'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1&interval=hourly',
        signal,
      )) as { prices: [number, number][] }
      return j.prices.map(([, p]) => p)
    },
    async () => {
      const end = Date.now()
      const start = end - 86_400_000
      const j = (await get(
        `https://api.coincap.io/v2/assets/bitcoin/history?interval=h1&start=${start}&end=${end}`,
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

// ─── Initial state from cache (shows instantly on mount) ─────────────────────

function initFromCache(): ICryptoData {
  const btc = loadCache<PriceResult>('btc_price')
  const hist = loadCache<number[]>('btc_history')
  const rub = loadCache<number>('usd_rub')
  return {
    btcPrice: btc?.price ?? null,
    btcChange24h: btc?.change24h ?? null,
    btcHistory: hist ?? [],
    usdRub: rub ?? null,
    // mark as stale if loaded from cache (fresh fetch will clear the flag)
    btcStale: btc !== null,
    fxStale: rub !== null,
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useCrypto = (): ICryptoData => {
  const [data, setData] = React.useState<ICryptoData>(initFromCache)

  React.useEffect(() => {
    const ac = new AbortController()
    const { signal } = ac

    // --- BTC price ---
    async function refreshPrice() {
      const r = await fetchBtcPrice(signal)
      if (signal.aborted) return
      if (r) {
        saveCache('btc_price', r)
        setData(s => ({ ...s, btcPrice: r.price, btcChange24h: r.change24h, btcStale: false }))
      } else {
        const cached = loadCache<PriceResult>('btc_price')
        if (cached) setData(s => ({ ...s, btcPrice: cached.price, btcChange24h: cached.change24h, btcStale: true }))
      }
    }

    // --- BTC sparkline history ---
    async function refreshHistory() {
      const prices = await fetchBtcHistory(signal)
      if (signal.aborted) return
      if (prices) {
        saveCache('btc_history', prices)
        setData(s => ({ ...s, btcHistory: prices }))
      } else {
        const cached = loadCache<number[]>('btc_history')
        if (cached) setData(s => ({ ...s, btcHistory: cached }))
      }
    }

    // --- USD/RUB ---
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

    // Fire immediately, then poll
    refreshPrice()
    refreshHistory()
    refreshFx()

    const t1 = setInterval(refreshPrice, 30_000)
    const t2 = setInterval(refreshHistory, 300_000)
    const t3 = setInterval(refreshFx, 300_000)

    return () => {
      ac.abort()
      clearInterval(t1)
      clearInterval(t2)
      clearInterval(t3)
    }
  }, [])

  return data
}
