import { DeprecatedEntity } from '../Entity'
import { GameContext } from '../GameContext'
import { Level } from '../Level'
import { loadSpriteSheet } from '../loaders/sprite'
import { Trait } from '../Trait'
import { Gravity } from '../traits/Gravity'
import { Killable } from '../traits/Killable'
import { Stomper } from '../traits/Stomper'
import { Velocity } from '../traits/Velocity'
import {
  createEntity,
  updateEntity,
  ComponentName,
  Entity,
} from '../EntityFunctions'
import { Vec2 } from '../math'

// All traits can be replaced by components
class BulletBehavior extends Trait {
  gravity = new Gravity()

  collides(us: DeprecatedEntity, them: DeprecatedEntity) {
    if (us.getTrait(Killable)?.dead) {
      return
    }

    const stomper = them.getTrait(Stomper)
    if (stomper) {
      if (them.vel.y > us.vel.y) {
        us.getTrait(Killable)?.kill()
        us.vel.set(100, -200)
      } else {
        them.getTrait(Killable)?.kill()
      }
    }
  }

  update(entity: DeprecatedEntity, gameContext: GameContext, level: Level) {
    if (entity.getTrait(Killable)?.dead) {
      this.gravity.update(entity, gameContext, level)
    }
  }
}

// export async function loadBullet() {
//   const sprites = await loadSpriteSheet('bullet')

//   return function createBullet() {
//     const bullet = new DeprecatedEntity()

//     bullet.size.set(16, 14)
//     bullet.vel.set(80, 0)

//     bullet.addTrait(new BulletBehavior())
//     bullet.addTrait(new Killable())
//     bullet.addTrait(new Velocity())

//     bullet.draw = (context) => {
//       sprites.draw('bullet', context, 0, 0, bullet.vel.x < 0)
//     }

//     return bullet
//   }
// }
export async function loadBullet() {
  const sprites = await loadSpriteSheet('bullet')

  return function createBullet(): [Entity, DeprecatedEntity] {
    const de = new DeprecatedEntity()
    const entity = createEntity()

    de.size.set(16, 14)
    de.vel.set(80, 0)

    de.addTrait(new BulletBehavior())
    de.addTrait(new Killable())
    de.addTrait(new Velocity())

    updateEntity(entity, {
      [ComponentName.SIZE]: de.size,
      [ComponentName.VELOCITY]: de.vel,
      [ComponentName.SPRITE_SHEET]: sprites,
    })

    // de.draw = (context) => {
    //   sprites.draw('bullet', context, 0, 0, de.vel.x < 0)
    // }

    return [entity, de]
  }
}
