export interface ICryptoData {
  coinPrice: number | null
  coinChange24h: number | null
  coinHistory: number[]
  coinSymbol: string
  coinName: string
  usdRub: number | null
  coinStale: boolean
  fxStale: boolean
}
