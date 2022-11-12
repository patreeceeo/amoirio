import { SpriteName } from './SpriteSheet'
import { AnimationSpec } from './loaders/types'
import { raise } from './raise'

export enum AnimationName {
  GOOMBA_WALK = 'walk',
  KOOPA_WALK = 'walk',
  KOOPA_WAKE = 'wake',
  MARIO_RUN = 'run',
  OVERWORLD_CHANCE = 'chance',
  OVERWORLD_COIN = 'coin',
  BULLET = 'bullet',
}

export interface Animation extends AnimationSpec {
  name: AnimationName
  frames: Array<SpriteName>
}

export function resolveFrame(
  animation: Animation,
  timeOrDistance: number,
): SpriteName {
  const frameIndex = Math.floor(
    (timeOrDistance / animation.frameLength) % animation.frames.length,
  )
  return animation.frames[frameIndex]
}

export function createAnimation(spec: AnimationSpec): Animation {
  for (let sprite of spec.frames) {
    if (!Object.values(SpriteName).includes(sprite as SpriteName)) {
      raise('invalid sprite name ' + sprite)
    }
  }
  return spec as Animation
}
