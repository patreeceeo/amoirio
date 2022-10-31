import { DeprecatedEntity } from '../Entity'
import { GameContext } from '../GameContext'
import { Level } from '../Level'
import { Trait } from '../Trait'

export class Gravity extends Trait {
  update(entity: DeprecatedEntity, { deltaTime }: GameContext, level: Level) {
    entity.vel.y += level.gravity * deltaTime
  }
}
