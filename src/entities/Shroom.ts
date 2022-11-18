import { DeprecatedEntity } from '../Entity'
import { loadSpriteSheet } from '../loaders/sprite'
import { Solid } from '../traits/Solid'
import {
  Entity,
  updateEntity,
  ComponentName,
  createNamedEntity,
} from '../EntityFunctions'
import { Vec2 } from '../math'
import { BoundingBox } from '../BoundingBox'
import { PendulumMove } from '../traits/PendulumMove'
import { SpriteName } from '../SpriteSheet'
import { Collectable, CollectableType } from '../Collectable'

export enum ShroomState {
  DEATH,
  BLUE,
  RED,
  GREEN,
}

export const ShroomStateSprite = [
  SpriteName.SHROOM_DEATH,
  SpriteName.SHROOM_BLUE,
  SpriteName.SHROOM_RED,
  SpriteName.SHROOM_GREEN,
]
export const ShroomStateValue = [0, 50, 100, 200]

export async function loadShroom(_audioContext: AudioContext) {
  const sprites = await loadSpriteSheet('shrooms')

  return function createShroom(): [Entity, DeprecatedEntity] {
    const entity = createNamedEntity('SHROOM')

    const pos = new Vec2()
    const size = new Vec2(15, 16)
    const move = new PendulumMove()
    move.speed = 45
    updateEntity(entity, {
      [ComponentName.SIZE]: size,
      [ComponentName.VELOCITY]: new Vec2(),
      [ComponentName.SPRITE_SHEET]: sprites,
      [ComponentName.SPRITE]: SpriteName.SHROOM_DEATH,
      [ComponentName.SHROOM]: ShroomState.DEATH,
      [ComponentName.POSITION]: pos,
      [ComponentName.PHYSICS]: true,
      [ComponentName.BOUNDING_BOX]: new BoundingBox(pos, size, new Vec2()),
      [ComponentName.SOLID]: new Solid(),
      [ComponentName.PENDULUM_MOVE]: move,
      [ComponentName.COLLECTABLE]: new Collectable(0, CollectableType.SHROOM),
    })

    return [entity, null!]
  }
}
