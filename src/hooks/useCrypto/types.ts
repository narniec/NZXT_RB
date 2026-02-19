export interface ICryptoData {
  btcPrice: number | null
  btcChange24h: number | null
  btcHistory: number[]
  usdRub: number | null
  btcStale: boolean
  fxStale: boolean
}
