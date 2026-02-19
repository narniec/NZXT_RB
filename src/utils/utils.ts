export const clampValue = (
  v: number,
  a: number,
  b: number,
  c: number,
  d: number,
): number => {
  const f = v / Math.abs(b - a)
  return c + Math.abs(d - c) * f
}

export const decToHex = (number: number) => {
  const rgbAlpha = Math.round(clampValue(Math.round(number), 0, 100, 0, 255))
  const hexaAlpha = rgbAlpha.toString(16).toUpperCase()
  return hexaAlpha.padStart(2, '0')
}
