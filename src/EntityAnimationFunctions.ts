import { resolveFrame, AnimationCollectionName } from './AnimationFunctions'
import {
  Entity,
  ComponentName,
  getComponent,
  checkComponent,
} from './EntityFunctions'
import { SpriteName } from './SpriteSheet'
import { Dict } from './types'

type Animator = (entity: Entity, elapsedTime: number) => SpriteName

type AnimatorDict = Dict<Animator>

const _animators: AnimatorDict = Object.freeze({
  [AnimationCollectionName.MARIO]: (entity, _time) => {
    checkComponent(entity, ComponentName.JUMP)
    const jump = getComponent(entity, ComponentName.JUMP)

    checkComponent(entity, ComponentName.GO)
    const go = getComponent(entity, ComponentName.GO)

    checkComponent(entity, ComponentName.VELOCITY)
    const vel = getComponent(entity, ComponentName.VELOCITY)

    if (jump.falling) {
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
})

const defaultAnimator: Animator = (entity: Entity, timeOrDistance: number) => {
  const animation = getComponent(entity, ComponentName.ANIMATION)
  return resolveFrame(animation.default, timeOrDistance)
}
export function getCurrentSpriteNameForEntity(
  entity: Entity,
  elapsedTime: number,
): SpriteName {
  checkComponent(entity, ComponentName.ANIMATION)

  const animations = getComponent(entity, ComponentName.ANIMATION)
  const animator = _animators[animations.name] || defaultAnimator
  return animator(entity, elapsedTime)
}
