import { DeprecatedEntity } from '../Entity'
import { GameContext } from '../GameContext'
import { Level } from '../Level'
import { Trait } from '../Trait'

type TriggerCondition = (
  entity: DeprecatedEntity,
  touches: Set<DeprecatedEntity>,
  gameContext: GameContext,
  level: Level,
) => void

export class Trigger extends Trait {
  touches = new Set<DeprecatedEntity>()
  conditions: TriggerCondition[] = []

  collides(_: DeprecatedEntity, them: DeprecatedEntity) {
    this.touches.add(them)
  }

  update(entity: DeprecatedEntity, gameContext: GameContext, level: Level) {
    if (this.touches.size > 0) {
      for (const condition of this.conditions) {
        condition(entity, this.touches, gameContext, level)
      }
      this.touches.clear()
    }
  }
}
