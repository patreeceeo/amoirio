import { SpriteName } from './SpriteSheet'
import { AnimationSpec } from './loaders/types'
import { raise } from './raise'

export enum AnimationName {
  GOOMBA_WALK = 'walk',
  KOOPA_WALK = 'walk',
  KOOPA_WAKE = 'wake',
  MARIO_RUN = 'run',
  MARIO_RUN_BIG = 'run-big',
  OVERWORLD_CHANCE = 'chance',
  OVERWORLD_COIN = 'coin',
  BULLET = 'bullet',
  BOWSER_IDLE = 'idle',
  BOWSER_RUN = 'run',
}

export enum AnimationCollectionName {
  MARIO = 'mario',
  MARIO_BIG = 'mario-big',
  KOOPA = 'koopa',
  GOOMBA = 'goomba',
  BULLET = 'bullet',
  CHANCE = 'chance',
  COIN = 'coin',
  BOWSER = 'bowser',
}

export interface Animation extends AnimationSpec {
  name: AnimationCollectionName
  frames: Array<SpriteName>
}

export type AnimationCollection = {
  name: AnimationCollectionName
  default: Animation
  animations: Map<AnimationName, Animation>
}

const animationCollections = {
  [AnimationCollectionName.MARIO]: [AnimationName.MARIO_RUN],
  [AnimationCollectionName.MARIO_BIG]: [AnimationName.MARIO_RUN_BIG],
  [AnimationCollectionName.KOOPA]: [
    AnimationName.KOOPA_WAKE,
    AnimationName.KOOPA_WALK,
  ],
  [AnimationCollectionName.GOOMBA]: [AnimationName.GOOMBA_WALK],
  [AnimationCollectionName.BULLET]: [AnimationName.BULLET],
  [AnimationCollectionName.COIN]: [AnimationName.OVERWORLD_COIN],
  [AnimationCollectionName.CHANCE]: [AnimationName.OVERWORLD_CHANCE],
  [AnimationCollectionName.BOWSER]: [AnimationName.BOWSER_RUN],
}
export function getAnimationNames(
  name: AnimationCollectionName,
): Readonly<Array<AnimationName>> {
  return animationCollections[name]
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
