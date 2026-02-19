export type TCoinId = 'BTC' | 'ETH' | 'SOL' | 'BNB' | 'XRP'

export interface ICryptoSettings {
  coin: TCoinId
  priceIntervalMs: number
  historyIntervalMs: number
  fxIntervalMs: number
}

interface ICryptoSettingsActions {
  updateSettings: (s: Partial<ICryptoSettings>) => void
}

export interface ICryptoStore extends ICryptoSettings, ICryptoSettingsActions {}
