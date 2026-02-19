/**
 * Sparkline — lightweight SVG price chart.
 * No dependencies. Renders a smooth bezier curve with gradient fill + end dot.
 * Designed to fit inside Bruno's circular ring at small sizes (width ~200, height ~22).
 */

interface SparklineProps {
  prices: number[]
  color?: string
  width?: number
  height?: number
}

const PAD = 2

export const Sparkline = ({
  prices,
  color = '#00bbff',
  width = 200,
  height = 22,
}: SparklineProps) => {
  if (prices.length < 2) return null

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1

  const W = width - PAD * 2
  const H = height - PAD * 2
  const step = W / (prices.length - 1)

  const pts = prices.map((p, i) => ({
    x: PAD + i * step,
    y: PAD + (1 - (p - min) / range) * H,
  }))

  // Smooth cubic bezier path
  let linePath = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`
  for (let i = 1; i < pts.length; i++) {
    const cpX = ((pts[i - 1].x + pts[i].x) / 2).toFixed(2)
    linePath += ` C${cpX},${pts[i - 1].y.toFixed(2)} ${cpX},${pts[i].y.toFixed(2)} ${pts[i].x.toFixed(2)},${pts[i].y.toFixed(2)}`
  }

  const last = pts[pts.length - 1]
  const areaPath = `${linePath} L${last.x.toFixed(2)},${height} L${PAD},${height} Z`
  const gradId = `sg-${color.replace('#', '')}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Filled area */}
      <path d={areaPath} fill={`url(#${gradId})`} />

      {/* Price line */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* End-of-line dot */}
      <circle cx={last.x.toFixed(2)} cy={last.y.toFixed(2)} r={2.8} fill={color} />
    </svg>
  )
}
