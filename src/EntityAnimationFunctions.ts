import { Animation, AnimationName, resolveFrame } from './AnimationFunctions'
import {
  Entity,
  hasComponent,
  ComponentName,
  getComponent,
  checkComponent,
} from './EntityFunctions'
import { SpriteName } from './SpriteSheet'
import { raise } from './raise'
import { Dict } from './types'

type Animator = (entity: Entity, elapsedTime: number) => SpriteName

type AnimatorDict = Dict<Animator>

const _animators: AnimatorDict = Object.freeze({
  [AnimationName.MARIO_RUN]: (entity, _time) => {
    checkComponent(entity, ComponentName.JUMP)
    const jump = getComponent(entity, ComponentName.JUMP)
    if (jump.falling) {
      return SpriteName.MARIO_JUMP
    }

    ///
    if (this.go.distance > 0) {
      if (
        (this.vel.x > 0 && this.go.dir < 0) ||
        (this.vel.x < 0 && this.go.dir > 0)
      ) {
        return SpriteName.MARIO_BRAKE
      }

      return defaultAnimator(entity, this.go.distance)
    }
    return SpriteName.MARIO_IDLE
  },
})

const defaultAnimator: Animator = (entity: Entity, timeOrDistance: number) => {
  const animation = getComponent(entity, ComponentName.ANIMATION)
  return resolveFrame(animation, timeOrDistance)
}
export function getCurrentSpriteNameForEntity(
  entity: Entity,
  elapsedTime: number,
): SpriteName {
  checkComponent(entity, ComponentName.ANIMATION)

  const animation = getComponent(entity, ComponentName.ANIMATION)
  const animator = _animators[animation.name] || defaultAnimator
  return animator(entity, elapsedTime)
}
