import { Font } from '../loaders/font'
import {
  Entity,
  checkComponent,
  ComponentName,
  getComponent,
} from '../EntityFunctions'

export function createScoreboardLayer(font: Font, scoreKeeperEntity: Entity) {
  const line1 = font.size
  const width = font.size * 32

  return function drawDashboard(context: CanvasRenderingContext2D) {
    checkComponent(scoreKeeperEntity, ComponentName.SCORE)
    const score = getComponent(scoreKeeperEntity, ComponentName.SCORE)
    const strRight = `${score.shroomForecast} >SHR`

    font.print(
      `$${Math.floor(score.revenue - score.expenses)} profit`,
      context,
      line1,
      line1,
    )

    font.print(
      strRight,
      context,
      width - line1 - strRight.length * line1,
      line1,
    )
  }
}
