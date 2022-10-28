import { Level } from '../Level'
import { LevelTimer } from '../traits/LevelTimer'
import { Font } from '../loaders/font'

function getTimerTrait(level: Level) {
  for (const entity of level.entities) {
    const trait = entity.getTrait(LevelTimer)
    if (trait) return trait
  }
}

export function createEditorLayer(font: Font, level: Level) {
  const line1 = font.size
  const line2 = font.size * 2

  return function drawDashboard(context: CanvasRenderingContext2D) {
    font.print(`EDITOR`, context, 0, line1)
    font.print(level.name, context, 0, line2)

    const timer = getTimerTrait(level)
    if (timer) {
      font.print('TIME', context, 208, line1)
      font.print(
        String(Math.floor(timer.currentTime)).padStart(3, '0'),
        context,
        216,
        line2,
      )
    }
  }
}
