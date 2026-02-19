import { IPreferenceModule } from 'store/preferences/types'

export const theme: IPreferenceModule = {
  leftCircleStart: { color: '#ffffff', alpha: 1, size: 1 },
  leftCircleEnd: { color: '#ffffff', alpha: 1 },
  rightCircleStart: { color: '#32ffe1', alpha: 1, size: 1 },
  rightCircleEnd: { color: '#22ffe1', alpha: 1 },
  circleBackground: { color: '#000000', alpha: 0.259, size: 1 },
  cpuIcon: { color: '#ffffff', alpha: 1 },
  gpuIcon: { color: '#ffffff', alpha: 1 },
  temperatureIcon: { color: '#00e5ff', alpha: 1 },
  loadIcon: { color: '#ffffff', alpha: 1 },
  text: { color: '#ffffff', alpha: 1, size: 0.63, font: 'Segoe UI' },
  background: { color: '#8c00ff', alpha: 1 },
  separator: { color: '#ffffff', alpha: 0 },
  cpuLabel: { color: '#ffffff', alpha: 1 },
  gpuLabel: { color: '#ffffff', alpha: 1 },
  gif: {
    alpha: 0.627,
    size: 0.197,
    brightness: 0.496,
    blend: 'luminosity',
    contrast: 0.504,
    blur: 0,
    url: '',
  },
}
