import { DeprecatedEntity } from '../Entity'
import { GameContext } from '../GameContext'
import { loadSpriteSheet } from '../loaders/sprite'
import { SpriteSheet } from '../SpriteSheet'
import { Trait } from '../Trait'
import { Killable } from '../traits/Killable'
import { PendulumMove } from '../traits/PendulumMove'
import { Physics } from '../traits/Physics'
import { Solid } from '../traits/Solid'
import { Stomper } from '../traits/Stomper'
import {
  Entity,
  createNamedEntity,
  updateEntity,
  ComponentName,
} from '../EntityFunctions'
import { AnimationCollectionName } from '../AnimationFunctions'

enum KoopaState {
  walking,
  hiding,
  panic,
}

class KoopaBehavior extends Trait {
  state = KoopaState.walking
  hideTime = 0
  hideDuration = 5
  panicSpeed = 300
  walkSpeed?: number

  collides(us: DeprecatedEntity, them: DeprecatedEntity) {
    if (us.getTrait(Killable)?.dead) {
      return
    }

    const stomper = them.getTrait(Stomper)
    if (stomper) {
      if (them.vel.y > us.vel.y) {
        this.handleStomp(us, them)
      } else {
        this.handleNudge(us, them)
      }
    }
  }

  handleStomp(us: DeprecatedEntity, them: DeprecatedEntity) {
    if (this.state === KoopaState.walking) {
      this.hide(us)
    } else if (this.state === KoopaState.hiding) {
      us.useTrait(Killable, (it) => it.kill())
      us.vel.set(100, -200)
      us.useTrait(Solid, (s) => (s.obstructs = false))
    } else if (this.state === KoopaState.panic) {
      this.hide(us)
    }
  }

  handleNudge(us: DeprecatedEntity, them: DeprecatedEntity) {
    const kill = () => {
      const killable = them.getTrait(Killable)
      if (killable) {
        killable.kill()
      }
    }

    if (this.state === KoopaState.walking) {
      kill()
    } else if (this.state === KoopaState.hiding) {
      this.panic(us, them)
    } else if (this.state === KoopaState.panic) {
      const travelDir = Math.sign(us.vel.x)
      const impactDir = Math.sign(us.pos.x - them.pos.x)
      if (travelDir !== 0 && travelDir !== impactDir) {
        kill()
      }
    }
  }

  hide(us: DeprecatedEntity) {
    us.useTrait(PendulumMove, (walk) => {
      us.vel.x = 0
      walk.enabled = false

      if (!this.walkSpeed) {
        this.walkSpeed = walk.speed
      }

      this.state = KoopaState.hiding
      this.hideTime = 0
    })
  }

  unhide(us: DeprecatedEntity) {
    us.useTrait(PendulumMove, (walk) => {
      walk.enabled = true
      if (this.walkSpeed != null) walk.speed = this.walkSpeed
      this.state = KoopaState.walking
    })
  }

  panic(us: DeprecatedEntity, them: DeprecatedEntity) {
    us.useTrait(PendulumMove, (pm) => {
      pm.speed = this.panicSpeed * Math.sign(them.vel.x)
      pm.enabled = true
    })
    this.state = KoopaState.panic
  }

  update(us: DeprecatedEntity, { deltaTime }: GameContext) {
    if (this.state === KoopaState.hiding) {
      this.hideTime += deltaTime

      if (this.hideTime > this.hideDuration) {
        this.unhide(us)
      }
    }
  }
}

export class Koopa extends DeprecatedEntity {
  walk = this.addTrait(new PendulumMove())
  behavior = this.addTrait(new KoopaBehavior())
  killable = this.addTrait(new Killable())
  solid = this.addTrait(new Solid())
  physics = this.addTrait(new Physics())

  walkAnim = this.sprites.getAnimation('walk')
  wakeAnim = this.sprites.getAnimation('wake')

  constructor(private sprites: SpriteSheet) {
    super()
    this.size.set(16, 16)
    this.offset.set(0, 8)
  }

  draw(context: CanvasRenderingContext2D) {
    this.sprites.draw(this.routeAnim(), context, 0, 0, this.vel.x < 0)
  }

  private routeAnim() {
    if (this.behavior.state === KoopaState.hiding) {
      if (this.behavior.hideTime > 3) {
        return this.wakeAnim(this.behavior.hideTime)
      }
      return 'hiding'
    }

    if (this.behavior.state === KoopaState.panic) {
      return 'hiding'
    }

    return this.walkAnim(this.lifetime)
  }
}

export async function loadKoopa() {
  const sprites = await loadSpriteSheet('koopa')

  const animations = sprites.getAnimationCollection(
    AnimationCollectionName.KOOPA,
  )

  return function createKoopa(): [Entity, DeprecatedEntity] {
    const de = new Koopa(sprites)
    const entity = createNamedEntity('KOOPA')

    updateEntity(entity, {
      [ComponentName.SIZE]: de.size,
      [ComponentName.VELOCITY]: de.vel,
      [ComponentName.SPRITE_SHEET]: sprites,
      [ComponentName.ANIMATION]: animations,
      [ComponentName.POSITION]: de.pos,
      [ComponentName.PHYSICS]: true,
      [ComponentName.BOUNDING_BOX]: de.bounds,
      [ComponentName.SOLID]: new Solid(),
    })

    return [entity, de]
  }
}
