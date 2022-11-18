import { Trait } from '../Trait'
import { World } from '../World'
import { Entity } from '../EntityFunctions'

export class Killable extends Trait {
  dead = false
  deadTime = 0
  hurtTime = 0
  removeAfter = 1.5
  kicked = false

  kill() {
    this.queue(() => {
      this.dead = true
    })
  }

  revive() {
    this.dead = false
    this.deadTime = 0
  }

  update(entity: Entity, world: World) {
    // if (this.dead) {
    //   this.deadTime += deltaTime
    //   if (this.deadTime > this.removeAfter) {
    //     this.queue(() => {
    //       level.entities.delete(entity)
    //     })
    //   }
    // }
  }
}
