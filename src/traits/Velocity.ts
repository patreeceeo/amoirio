import { DeprecatedEntity } from '../Entity'
import { GameContext } from '../GameContext'
import { Trait } from '../Trait'

export class Velocity extends Trait {
  update(entity: DeprecatedEntity, { deltaTime }: GameContext) {
    entity.pos.x += entity.vel.x * deltaTime
    entity.pos.y += entity.vel.y * deltaTime
  }
}
