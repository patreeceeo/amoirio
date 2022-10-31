import { raise } from '../raise'

export function getVideoContext() {
  const canvas = document.getElementById('screen')
  if (canvas instanceof HTMLCanvasElement) {
    const videoContext =
      canvas.getContext('2d') || raise('Canvas not supported')

    // turning this off lets us save a lot of Math.floor calls when rendering
    videoContext.imageSmoothingEnabled = false

    return videoContext
  } else {
    console.warn('Canvas not found')
  }
}
