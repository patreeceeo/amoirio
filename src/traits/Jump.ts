import { Side } from '../Entity'
import { Trait } from '../Trait'
import { World } from '../World'
import { Entity } from '../EntityFunctions'

export class Jump extends Trait {
  duration = 0.3
  velocity = 200
  engageTime = 0
  ready = 0
  requestTime = 0
  gracePeriod = 0.1
  speedBoost = 0.3

  start() {
    // this.requestTime = this.gracePeriod
  }

  cancel() {
    // this.engageTime = 0
    // this.requestTime = 0
  }

  update(entity: Entity, world: World) {
    // if (this.requestTime > 0) {
    //   if (this.ready > 0) {
    //     entity.sounds.add('jump')
    //     this.engageTime = this.duration
    //     this.requestTime = 0
    //   }
    //   this.requestTime -= deltaTime
    // }
    // if (this.engageTime > 0) {
    //   entity.vel.y = -(this.velocity + Math.abs(entity.vel.x) * this.speedBoost)
    //   this.engageTime -= deltaTime
    // }
    // this.ready -= 1
  }

  obstruct(entity: Entity, side: Side) {
    // if (side === Side.bottom) {
    //   this.ready = 1
    // } else if (side === Side.top) {
    //   this.cancel()
    // }
  }

  get falling() {
    return this.ready < 0
  }
}
