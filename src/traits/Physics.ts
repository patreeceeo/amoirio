import { Trait } from '../Trait'
import { Entity } from '../EntityFunctions'
import { World } from '../World'

export class Physics extends Trait {
  update(entity: Entity, world: World) {
    // entity.pos.x += entity.vel.x * gameContext.deltaTime
    // level.tileCollider.checkX(entity, gameContext, level)
    // entity.pos.y += entity.vel.y * gameContext.deltaTime
    // level.tileCollider.checkY(entity, gameContext, level)
    // entity.vel.y += level.gravity * gameContext.deltaTime
  }
}
