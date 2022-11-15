import {
  Animation,
  AnimationCollectionName,
  AnimationName,
} from '../AnimationFunctions'
import { DeprecatedEntity } from '../Entity'
import { loadSpriteSheet } from '../loaders/sprite'
import { SpriteSheet } from '../SpriteSheet'
import { Trait } from '../Trait'
import { Killable } from '../traits/Killable'
import { PendulumMove } from '../traits/PendulumMove'
import { Physics } from '../traits/Physics'
import { Stomper } from '../traits/Stomper'
import {
  Entity,
  updateEntity,
  ComponentName,
  createNamedEntity,
} from '../EntityFunctions'
import { Solid } from '../traits/Solid'

class GoombaBehavior extends Trait {
  collides(us: DeprecatedEntity, them: DeprecatedEntity) {
    if (us.getTrait(Killable)?.dead) {
      return
    }

    const stomper = them.getTrait(Stomper)
    if (stomper) {
      if (them.vel.y > us.vel.y) {
        us.useTrait(PendulumMove, (pm) => (pm.speed = 0))
        us.useTrait(Killable, (k) => k.kill())
      } else {
        them.getTrait(Killable)?.kill()
      }
    }
  }
}

export class Goomba extends DeprecatedEntity {
  walk = this.addTrait(new PendulumMove())
  behavior = this.addTrait(new GoombaBehavior())
  killable = this.addTrait(new Killable())
  solid = this.addTrait(new Solid())
  physics = this.addTrait(new Physics())

  constructor(private sprites: SpriteSheet, private walkAnim: Animation) {
    super()
    this.size.set(16, 16)
  }

  draw(context: CanvasRenderingContext2D) {
    // this.sprites.draw(this.routeAnim(), context, 0, 0)
  }

  private routeAnim() {
    // if (this.killable.dead) {
    //   return 'flat'
    // }
    // return this.walkAnim(this.lifetime)
  }
}

export async function loadGoomba() {
  const sprites = await loadSpriteSheet('goomba')
  // const walkAnim = sprites.getAnimation('walk')
  const animations = sprites.getAnimationCollection(
    AnimationCollectionName.GOOMBA,
  )

  return function createGoomba(): [Entity, DeprecatedEntity] {
    const de = new Goomba(sprites, animations.default!)
    const entity = createNamedEntity('GOOMBA')
    updateEntity(entity, {
      [ComponentName.SIZE]: de.size,
      [ComponentName.VELOCITY]: de.vel,
      [ComponentName.SPRITE_SHEET]: sprites,
      [ComponentName.ANIMATION]: animations,
      [ComponentName.POSITION]: de.pos,
      [ComponentName.BOUNDING_BOX]: de.bounds,
      [ComponentName.PHYSICS]: true,
      [ComponentName.SOLID]: new Solid(),
    })
    return [entity, de]
  }
}
