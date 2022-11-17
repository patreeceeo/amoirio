import { Font } from '../loaders/font'
import {
  Entity,
  checkComponent,
  ComponentName,
  getComponent,
} from '../EntityFunctions'

export function createScoreboardLayer(font: Font, scoreKeeperEntity: Entity) {
  const line1 = font.size

  return function drawDashboard(context: CanvasRenderingContext2D) {
    checkComponent(scoreKeeperEntity, ComponentName.SCORE)
    const score = getComponent(scoreKeeperEntity, ComponentName.SCORE)
    font.print(
      `$${Math.floor(score.revenue - score.expenses)} profit`,
      context,
      2,
      line1,
    )
  }
}
