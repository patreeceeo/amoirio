import { Trait } from '../Trait'
import {
  Entity,
  hasComponent,
  ComponentName,
  checkComponent,
  getComponent,
} from '../EntityFunctions'
import { World } from '../World'
import { V2_0 } from '../math'

export class Go extends Trait {
  dir = 0
  acceleration = 400
  distance = 0
  heading = 1
  dragFactor = 1 / 5000
  deceleration = 300

  update(entity: Entity, world: World) {
    // const absX = Math.abs(entity.vel.x)
    // if (this.dir !== 0) {
    //   entity.vel.x += this.acceleration * this.dir * deltaTime
    //   const jump = entity.getTrait(Jump)
    //   if (jump) {
    //     if (jump.falling === false) {
    //       this.heading = this.dir
    //     }
    //   } else {
    //     this.heading = this.dir
    //   }
    // } else if (entity.vel.x !== 0) {
    //   const decel = Math.min(absX, this.deceleration * deltaTime)
    //   entity.vel.x += -Math.sign(entity.vel.x) * decel
    // } else {
    //   this.distance = 0
    // }
    // const drag = this.dragFactor * entity.vel.x * absX
    // entity.vel.x -= drag
    // this.distance += absX * deltaTime
  }
}

export function isFacingLeft(entity: Entity) {
  const hasVelocity = hasComponent(entity, ComponentName.VELOCITY)
  const velocity = hasVelocity
    ? getComponent(entity, ComponentName.VELOCITY)
    : V2_0
  checkComponent(entity, ComponentName.POSITION)
  const position = getComponent(entity, ComponentName.POSITION)

  return velocity.x === 0 ? position.x > 128 : velocity.x < 0
}
