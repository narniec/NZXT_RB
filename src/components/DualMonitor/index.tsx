import { Container } from './styles'

import { decToHex } from 'utils/utils'

import { useMonitoring, useCrypto } from 'hooks'
import { useKrakenStore } from 'store/kraken'

import { FiCpu as CpuIcon } from 'react-icons/fi'
import { BsGpuCard as GpuIcon } from 'react-icons/bs'
import { FaTemperatureLow as TempIcon } from 'react-icons/fa'
import { VscPulse as LoadIcon } from 'react-icons/vsc'

import { Progress } from 'components/Progress'
import { Sparkline } from 'components/Sparkline'

// ─── Formatting helpers ───────────────────────────────────────────────────────

function fmtBtc(price: number | null): string {
  if (price === null) return '—'
  return '$' + Math.round(price).toLocaleString('en-US')
}

function fmtRub(rate: number | null): string {
  if (rate === null) return '—'
  return rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtChange(pct: number | null): string | null {
  if (pct === null) return null
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

function changeDir(pct: number | null): 'up' | 'down' | 'flat' {
  if (pct === null) return 'flat'
  if (pct > 0.05) return 'up'
  if (pct < -0.05) return 'down'
  return 'flat'
}

// ─── Component ────────────────────────────────────────────────────────────────

export const DualMonitor = () => {
  const krakenStore = useKrakenStore()
  const { cpu, gpu } = useMonitoring()
  const crypto = useCrypto()

  // ── CPU panel ──────────────────────────────────────────────────────────────
  const Cpu = () => (
    <div className="info-container">
      <div className="info-title">
        <CpuIcon color={krakenStore.cpuIcon.color} opacity={krakenStore.cpuIcon.alpha} />
        <span
          style={{
            fontSize: `${1 * 5}vw`,
            color: krakenStore.cpuLabel.color,
            opacity: krakenStore.cpuLabel.alpha,
          }}
        >
          {cpu?.name?.replace(/(core|ryzen \d)/gi, '').trim() ?? 'CPU'}
        </span>
      </div>
      <div
        className="info-data"
        style={{ fontSize: `${16 * (krakenStore.text.size ?? 1)}vw` }}
      >
        <div className="info-icon temperature">
          <TempIcon
            color={krakenStore.temperatureIcon.color}
            opacity={krakenStore.temperatureIcon.alpha}
          />
        </div>
        <div className="data">{cpu?.temperature ?? '—'}°</div>
      </div>
      <div
        className="info-data"
        style={{ fontSize: `${16 * (krakenStore.text.size ?? 1)}vw` }}
      >
        <div className="info-icon load">
          <LoadIcon
            color={krakenStore.loadIcon.color}
            opacity={krakenStore.loadIcon.alpha}
          />
        </div>
        <div className="data">
          {cpu?.load ?? '—'}
          <span>%</span>
        </div>
      </div>
    </div>
  )

  // ── GPU panel ──────────────────────────────────────────────────────────────
  const Gpu = () => (
    <div className="info-container">
      <div className="info-title">
        <GpuIcon color={krakenStore.gpuIcon.color} opacity={krakenStore.gpuIcon.alpha} />
        <span
          style={{
            fontSize: `${1 * 5}vw`,
            color: krakenStore.gpuLabel.color,
            opacity: krakenStore.gpuLabel.alpha,
          }}
        >
          {gpu?.name
            ?.replace(/nvidia geforce/gi, '')
            .replace(/amd radeon/gi, '')
            .trim() ?? 'GPU'}
        </span>
      </div>
      <div
        className="info-data"
        style={{ fontSize: `${16 * (krakenStore.text.size ?? 1)}vw` }}
      >
        <div className="info-icon temperature">
          <TempIcon
            color={krakenStore.temperatureIcon.color}
            opacity={krakenStore.temperatureIcon.alpha}
          />
        </div>
        <div className="data">{gpu?.temperature ?? '—'}°</div>
      </div>
      <div
        className="info-data"
        style={{ fontSize: `${16 * (krakenStore.text.size ?? 1)}vw` }}
      >
        <div className="info-icon load">
          <LoadIcon
            color={krakenStore.loadIcon.color}
            opacity={krakenStore.loadIcon.alpha}
          />
        </div>
        <div className="data">
          {gpu?.load ?? '—'}
          <span>%</span>
        </div>
      </div>
    </div>
  )

  // ── Crypto panel (BTC + sparkline + USD/RUB) ───────────────────────────────
  const btcChangeStr = fmtChange(crypto.btcChange24h)
  const btcDir = changeDir(crypto.btcChange24h)
  // Use the right-ring accent colour for the sparkline so it matches the theme
  const sparkColor = krakenStore.rightCircleStart.color

  const Crypto = () => (
    <>
      {/* Thin divider between hardware section and crypto section */}
      <div
        className="crypto-divider"
        style={{ background: krakenStore.separator.color }}
      />

      <div
        className="crypto-info"
        style={{
          color: krakenStore.text.color + decToHex(krakenStore.text.alpha * 100),
          fontFamily: krakenStore.text.font,
        }}
      >
        {/* BTC row */}
        <div className="crypto-row">
          <span className="crypto-icon">₿</span>
          <span className="crypto-value">{fmtBtc(crypto.btcPrice)}</span>
          {btcChangeStr && (
            <span className={`crypto-change ${btcDir}`}>{btcChangeStr}</span>
          )}
          {crypto.btcStale && <span className="stale-dot" title="Cached" />}
        </div>

        {/* Sparkline */}
        {crypto.btcHistory.length >= 2 && (
          <Sparkline
            prices={crypto.btcHistory}
            color={sparkColor}
            width={196}
            height={22}
          />
        )}

        {/* USD/RUB row */}
        <div className="crypto-row">
          <span className="crypto-icon">₽</span>
          <span className="crypto-value">{fmtRub(crypto.usdRub)}</span>
          {crypto.fxStale && <span className="stale-dot" title="Cached" />}
        </div>
      </div>
    </>
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Container
      style={{
        fontFamily: krakenStore.text.font,
        backgroundColor:
          krakenStore.background.color + decToHex(krakenStore.background.alpha * 100),
      }}
    >
      {/* Background video / GIF */}
      <video
        autoPlay
        loop
        muted
        src={krakenStore.gif.url}
        poster={krakenStore.gif.url}
        width={`${(krakenStore.gif.size ?? 1) * 500}%`}
        style={{
          mixBlendMode: krakenStore.gif.blend,
          filter: `blur(${(krakenStore.gif.blur ?? 1) * 10}px) opacity(${
            krakenStore.gif.alpha
          }) brightness(${(krakenStore.gif.brightness ?? 1) * 2}) contrast(${
            (krakenStore.gif.contrast ?? 1) * 2
          })`,
        }}
      />

      {/* Ring progress + inner content */}
      <Progress
        leftValue={cpu?.temperature}
        rightValue={gpu?.temperature}
        leftCircleStart={krakenStore.leftCircleStart}
        leftCircleEnd={krakenStore.leftCircleEnd}
        rightCircleStart={krakenStore.rightCircleStart}
        rightCircleEnd={krakenStore.rightCircleEnd}
        background={krakenStore.circleBackground}
      >
        {/* CPU / GPU monitoring */}
        <div
          className="monitoring"
          style={{
            color: krakenStore.text.color + decToHex(krakenStore.text.alpha * 100),
          }}
        >
          <Cpu />
          <div
            className="info-separator"
            style={{
              borderColor: krakenStore.separator.color,
              opacity: krakenStore.separator.alpha,
            }}
          />
          <Gpu />
        </div>

        {/* BTC + Sparkline + USD/RUB */}
        <Crypto />
      </Progress>
    </Container>
  )
}
