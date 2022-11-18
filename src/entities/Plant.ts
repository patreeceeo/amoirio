import { DeprecatedEntity } from '../Entity'
import { loadSpriteSheet } from '../loaders/sprite'
import {
  Entity,
  updateEntity,
  ComponentName,
  createNamedEntity,
} from '../EntityFunctions'
import { Vec2 } from '../math'
import { BoundingBox } from '../BoundingBox'
import { SpriteName } from '../SpriteSheet'
import { CollectableType, Collectable } from '../Collectable'

export async function loadPlant(_audioContext: AudioContext) {
  const sprites = await loadSpriteSheet('plant')

  return function createPlant(): [Entity, DeprecatedEntity] {
    const entity = createNamedEntity('PLANT')

    const pos = new Vec2()
    const size = new Vec2(16, 16)
    updateEntity(entity, {
      [ComponentName.SIZE]: size,
      [ComponentName.SPRITE_SHEET]: sprites,
      [ComponentName.SPRITE]: SpriteName.PLANT,
      [ComponentName.POSITION]: pos,
      [ComponentName.BOUNDING_BOX]: new BoundingBox(pos, size, new Vec2()),
      [ComponentName.COLLECTABLE]: new Collectable(3, CollectableType.PLANT),
    })

    return [entity, null!]
  }
}
