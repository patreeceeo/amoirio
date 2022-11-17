import {
  resolveFrame,
  AnimationCollectionName,
  AnimationName,
} from './AnimationFunctions'
import {
  Entity,
  ComponentName,
  getComponent,
  checkComponent,
  hasComponent,
} from './EntityFunctions'
import { SpriteName } from './SpriteSheet'
import { Dict } from './types'
import { KoopaState } from './entities/Koopa'

type Animator = (entity: Entity, timeOrDistance: number) => SpriteName

type AnimatorDict = Dict<Animator>

const _animators: AnimatorDict = Object.freeze({
  [AnimationCollectionName.MARIO]: (entity, _time) => {
    checkComponent(entity, ComponentName.JUMP)
    const jump = getComponent(entity, ComponentName.JUMP)

    checkComponent(entity, ComponentName.GO)
    const go = getComponent(entity, ComponentName.GO)

    checkComponent(entity, ComponentName.VELOCITY)
    const vel = getComponent(entity, ComponentName.VELOCITY)

    checkComponent(entity, ComponentName.KILLABLE)
    const killable = getComponent(entity, ComponentName.KILLABLE)

    if (killable.dead) {
      return SpriteName.MARIO_DEAD
    }

    if (jump.engageTime > 0 || jump.falling) {
      return SpriteName.MARIO_JUMP
    }

    if (go.distance > 0) {
      if ((vel.x > 0 && go.dir < 0) || (vel.x < 0 && go.dir > 0)) {
        return SpriteName.MARIO_BRAKE
      }

      return defaultAnimator(entity, go.distance)
    }

    return SpriteName.MARIO_IDLE
  },
  [AnimationCollectionName.BOWSER]: (entity, _time) => {
    checkComponent(entity, ComponentName.GO)
    const go = getComponent(entity, ComponentName.GO)

    checkComponent(entity, ComponentName.KILLABLE)
    const killable = getComponent(entity, ComponentName.KILLABLE)

    if (killable.dead) {
      return SpriteName.BOWSER_DEAD
    }

    if (go.distance > 0) {
      return defaultAnimator(entity, go.distance)
    }
    return SpriteName.BOWSER_IDLE
  },
  [AnimationCollectionName.KOOPA]: (entity, elapsedTime) => {
    checkComponent(entity, ComponentName.KOOPA_BEHAV)
    const behavior = getComponent(entity, ComponentName.KOOPA_BEHAV)

    const animations = getComponent(entity, ComponentName.ANIMATION).animations
    const walkAnim = animations.get(AnimationName.KOOPA_WALK)
    const wakeAnim = animations.get(AnimationName.KOOPA_WAKE)

    const spawnTime = getComponent(entity, ComponentName.SPAWN).spawnTime || 0

    if (behavior.state === KoopaState.hiding) {
      if (behavior.hideTime > 3) {
        if (!wakeAnim) {
          console.warn('Where Koopa wake animation tho?')
          return SpriteName.KOOPA_HIDING_WITH_LEGS
        }
        return resolveFrame(wakeAnim, behavior.hideTime)
      }
      return SpriteName.KOOPA_HIDING
    }

    if (behavior.state === KoopaState.panic) {
      return SpriteName.KOOPA_HIDING_WITH_LEGS
    }

    if (!walkAnim) {
      console.warn('Where Koopa walk animation tho?')
      return SpriteName.KOOPA_HIDING_WITH_LEGS
    }
    return resolveFrame(walkAnim, elapsedTime - spawnTime)
  },
})

const defaultAnimator: Animator = (entity: Entity, timeOrDistance: number) => {
  const animation = getComponent(entity, ComponentName.ANIMATION)
  return resolveFrame(animation.default, timeOrDistance)
}
export function getCurrentSpriteNameForEntity(
  entity: Entity,
  elapsedTime: number,
): SpriteName {
  if (hasComponent(entity, ComponentName.ANIMATION)) {
    const animations = getComponent(entity, ComponentName.ANIMATION)
    const animator = _animators[animations.name] || defaultAnimator
    return animator(entity, elapsedTime)
  } else {
    checkComponent(entity, ComponentName.SPRITE)
    return getComponent(entity, ComponentName.SPRITE)
  }
}
