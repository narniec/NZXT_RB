import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { produce } from 'immer'

import { ICryptoStore } from './types'

export const useCryptoStore = create<ICryptoStore>()(
  persist(
    set => ({
      coin: 'BTC',
      priceIntervalMs: 30_000,
      historyIntervalMs: 300_000,
      fxIntervalMs: 300_000,

      updateSettings: s => {
        set(produce((state: ICryptoStore) => Object.assign(state, s)))
      },
    }),
    { name: 'nzxt-crypto-settings', version: 1 },
  ),
)
