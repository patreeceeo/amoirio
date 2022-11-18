import { DeprecatedEntity } from '../Entity'
import { loadSpriteSheet } from '../loaders/sprite'
import { Go } from '../traits/Go'
import { Jump } from '../traits/Jump'
import { Killable } from '../traits/Killable'
import { Solid } from '../traits/Solid'
import {
  Entity,
  updateEntity,
  ComponentName,
  createNamedEntity,
} from '../EntityFunctions'
import { AnimationCollectionName } from '../AnimationFunctions'
import { Vec2 } from '../math'
import { BoundingBox } from '../BoundingBox'
import { Spawner } from '../Spawner'

export async function loadBowser(_audioContext: AudioContext) {
  const sprites = await loadSpriteSheet('bowser')
  const animations = sprites.getAnimationCollection(
    AnimationCollectionName.BOWSER,
  )

  return function createBowser(): [Entity, DeprecatedEntity] {
    const entity = createNamedEntity('BOWSER')

    const pos = new Vec2()
    const size = new Vec2(20, 32)
    const jump = new Jump()
    jump.velocity = 175
    jump.duration = 0.15
    const go = new Go()
    go.acceleration = 120
    go.deceleration = 70
    go.offsetLeft = 10
    updateEntity(entity, {
      [ComponentName.INPUT_RECEIVER]: true,
      [ComponentName.IS_B]: true,
      [ComponentName.SIZE]: size,
      [ComponentName.VELOCITY]: new Vec2(),
      [ComponentName.SPRITE_SHEET]: sprites,
      [ComponentName.ANIMATION]: animations,
      [ComponentName.POSITION]: pos,
      [ComponentName.JUMP]: jump,
      [ComponentName.GO]: go,
      [ComponentName.PHYSICS]: true,
      [ComponentName.BOUNDING_BOX]: new BoundingBox(pos, size, new Vec2()),
      [ComponentName.SOLID]: new Solid(),
      [ComponentName.KILLABLE]: new Killable(),
      [ComponentName.SPAWNER]: new Spawner('shroom', 0, [], 1),
    })

    return [entity, null!]
  }
}
