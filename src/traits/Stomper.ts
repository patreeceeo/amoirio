import { DeprecatedEntity } from '../Entity'
import { Trait } from '../Trait'
import { Killable } from './Killable'
import { Entity } from '../EntityFunctions'

export class Stomper extends Trait {
  static EVENT_STOMP = Symbol('stomp')

  bounceSpeed = 400

  bounce(us: DeprecatedEntity, them: DeprecatedEntity) {
    us.bounds.bottom = them.bounds.top
    us.vel.y = -this.bounceSpeed
  }

  collides(us: Entity, them: Entity) {
    // const killable = them.getTrait(Killable)
    // if (!killable || killable.dead) {
    //   return
    // }
    // if (us.vel.y > them.vel.y) {
    //   // using queue() fixes a race condition that can sometimes cause a stomper
    //   // to incorrectly get killed by a killable
    //   this.queue(() => this.bounce(us, them))
    //   us.sounds.add('stomp')
    //   us.events.emit(Stomper.EVENT_STOMP, us, them)
    // }
  }
}
