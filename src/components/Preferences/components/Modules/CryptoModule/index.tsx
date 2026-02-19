import { useCryptoStore } from 'store/crypto'
import { TCoinId } from 'store/crypto/types'

const COINS: { id: TCoinId; label: string }[] = [
  { id: 'BTC', label: '₿ Bitcoin' },
  { id: 'ETH', label: 'Ξ Ethereum' },
  { id: 'SOL', label: '◎ Solana' },
  { id: 'BNB', label: 'BNB' },
  { id: 'XRP', label: '✕ XRP' },
]

const PRICE_INTERVALS: { label: string; value: number }[] = [
  { label: '15 сек', value: 15_000 },
  { label: '30 сек', value: 30_000 },
  { label: '1 мин',  value: 60_000 },
  { label: '2 мин',  value: 120_000 },
]

const SLOW_INTERVALS: { label: string; value: number }[] = [
  { label: '1 мин',  value: 60_000 },
  { label: '5 мин',  value: 300_000 },
  { label: '10 мин', value: 600_000 },
  { label: '15 мин', value: 900_000 },
]

export const CryptoModule = () => {
  const store = useCryptoStore()

  return (
    <div className="module-segmentList">
      <div className="module">
        <div className="selectContainer">
          <div className="label">Монета</div>
          <select
            value={store.coin}
            onChange={e => store.updateSettings({ coin: e.target.value as TCoinId })}
          >
            {COINS.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="selectContainer">
          <div className="label">Цена</div>
          <select
            value={store.priceIntervalMs}
            onChange={e => store.updateSettings({ priceIntervalMs: Number(e.target.value) })}
          >
            {PRICE_INTERVALS.map(i => (
              <option key={i.value} value={i.value}>{i.label}</option>
            ))}
          </select>
        </div>

        <div className="selectContainer">
          <div className="label">График</div>
          <select
            value={store.historyIntervalMs}
            onChange={e => store.updateSettings({ historyIntervalMs: Number(e.target.value) })}
          >
            {SLOW_INTERVALS.map(i => (
              <option key={i.value} value={i.value}>{i.label}</option>
            ))}
          </select>
        </div>

        <div className="selectContainer">
          <div className="label">USD/RUB</div>
          <select
            value={store.fxIntervalMs}
            onChange={e => store.updateSettings({ fxIntervalMs: Number(e.target.value) })}
          >
            {SLOW_INTERVALS.map(i => (
              <option key={i.value} value={i.value}>{i.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
