import { DeprecatedEntity } from '../Entity'
import { GameContext } from '../GameContext'
import { loadSpriteSheet } from '../loaders/sprite'
import { SpriteSheet } from '../SpriteSheet'
import { Trait } from '../Trait'
import { Killable } from '../traits/Killable'
import { PendulumMove } from '../traits/PendulumMove'
import { Physics } from '../traits/Physics'
import { Solid } from '../traits/Solid'
import {
  Entity,
  createNamedEntity,
  updateEntity,
  ComponentName,
  getComponent,
  checkComponent,
  hasComponent,
} from '../EntityFunctions'
import { AnimationCollectionName } from '../AnimationFunctions'
import { World } from '../World'

export enum KoopaState {
  walking,
  hiding,
  panic,
}

export class KoopaBehavior extends Trait {
  state = KoopaState.walking
  hideTime = 0
  hideDuration = 5
  panicSpeed = 300
  walkSpeed?: number

  collides(us: Entity, them: Entity) {
    checkComponent(us, ComponentName.KILLABLE)
    if (getComponent(us, ComponentName.KILLABLE).dead) {
      return
    }

    if (hasComponent(them, ComponentName.STOMPER)) {
      checkComponent(us, ComponentName.VELOCITY)
      const velUs = getComponent(us, ComponentName.VELOCITY)

      checkComponent(them, ComponentName.VELOCITY)
      const velThem = getComponent(them, ComponentName.VELOCITY)

      if (velThem.y > velUs.y) {
        this.handleStomp(us, them)
      } else {
        this.handleNudge(us, them)
      }
    }
  }

  handleStomp(us: Entity, them: Entity) {
    if (this.state === KoopaState.walking) {
      this.hide(us)
    } else if (this.state === KoopaState.hiding) {
      // us.useTrait(Killable, (it) => it.kill())
      checkComponent(us, ComponentName.KILLABLE)
      getComponent(us, ComponentName.KILLABLE).dead = true

      checkComponent(us, ComponentName.VELOCITY)
      const velUs = getComponent(us, ComponentName.VELOCITY)

      velUs.set(100, -200)
      getComponent(us, ComponentName.SOLID).obstructs = false
    } else if (this.state === KoopaState.panic) {
      this.hide(us)
    }
  }

  handleNudge(us: Entity, them: Entity) {
    const kill = () => {
      if (hasComponent(them, ComponentName.KILLABLE)) {
        getComponent(them, ComponentName.KILLABLE).dead = true
      }
    }

    if (this.state === KoopaState.walking) {
      kill()
    } else if (this.state === KoopaState.hiding) {
      this.panic(us, them)
    } else if (this.state === KoopaState.panic) {
      checkComponent(us, ComponentName.VELOCITY)
      const vel = getComponent(us, ComponentName.VELOCITY)

      checkComponent(us, ComponentName.POSITION)
      const posUs = getComponent(us, ComponentName.POSITION)

      checkComponent(them, ComponentName.POSITION)
      const posThem = getComponent(them, ComponentName.POSITION)

      const travelDir = Math.sign(vel.x)
      const impactDir = Math.sign(posUs.x - posThem.x)
      if (travelDir !== 0 && travelDir !== impactDir) {
        kill()
      }
    }
  }

  hide(us: Entity) {
    checkComponent(us, ComponentName.PENDULUM_MOVE)
    const walk = getComponent(us, ComponentName.PENDULUM_MOVE)

    checkComponent(us, ComponentName.VELOCITY)
    const vel = getComponent(us, ComponentName.VELOCITY)

    vel.x = 0
    walk.enabled = false

    if (!this.walkSpeed) {
      this.walkSpeed = walk.speed
    }

    this.state = KoopaState.hiding
    this.hideTime = 0
  }

  unhide(us: Entity) {
    checkComponent(us, ComponentName.PENDULUM_MOVE)
    const walk = getComponent(us, ComponentName.PENDULUM_MOVE)

    walk.enabled = true

    if (this.walkSpeed != null) walk.speed = this.walkSpeed

    this.state = KoopaState.walking
  }

  panic(us: Entity, them: Entity) {
    checkComponent(us, ComponentName.PENDULUM_MOVE)
    const walk = getComponent(us, ComponentName.PENDULUM_MOVE)

    checkComponent(them, ComponentName.VELOCITY)
    const themVel = getComponent(them, ComponentName.VELOCITY)

    walk.speed = this.panicSpeed * Math.sign(themVel.x)
    walk.enabled = true

    this.state = KoopaState.panic
  }

  update(us: Entity, world: World) {
    if (this.state === KoopaState.hiding) {
      this.hideTime += world.fixedDeltaSeconds

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
      [ComponentName.KOOPA_BEHAV]: de.behavior,
      [ComponentName.PENDULUM_MOVE]: new PendulumMove(),
    })

    return [entity, de]
  }
}
