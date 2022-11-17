// import { Animation } from '../animation'
import { AudioBoard } from '../AudioBoard'
import { DeprecatedEntity } from '../Entity'
import { loadAudioBoard } from '../loaders/audio'
import { loadSpriteSheet } from '../loaders/sprite'
import { SpriteSheet } from '../SpriteSheet'
import { Go } from '../traits/Go'
import { Jump } from '../traits/Jump'
import { Killable } from '../traits/Killable'
import { Physics } from '../traits/Physics'
import { Solid } from '../traits/Solid'
import { Stomper } from '../traits/Stomper'
import {
  Entity,
  updateEntity,
  ComponentName,
  createNamedEntity,
} from '../EntityFunctions'
import { AnimationCollectionName } from '../AnimationFunctions'
import { Vec2 } from '../math'
import { BoundingBox } from '../BoundingBox'

export async function loadBowser(audioContext: AudioContext) {
  const sprites = await loadSpriteSheet('bowser')
  const animations = sprites.getAnimationCollection(
    AnimationCollectionName.BOWSER,
  )

  return function createBowser(): [Entity, DeprecatedEntity] {
    const entity = createNamedEntity('BOWSER')

    const pos = new Vec2()
    const size = new Vec2(32, 32)
    const jump = new Jump()
    jump.velocity = 100
    jump.duration = 0.15
    updateEntity(entity, {
      [ComponentName.INPUT_RECEIVER]: true,
      [ComponentName.IS_B]: true,
      [ComponentName.SIZE]: size,
      [ComponentName.VELOCITY]: new Vec2(),
      [ComponentName.SPRITE_SHEET]: sprites,
      [ComponentName.ANIMATION]: animations,
      [ComponentName.POSITION]: pos,
      [ComponentName.JUMP]: jump,
      [ComponentName.GO]: new Go(),
      [ComponentName.PHYSICS]: true,
      [ComponentName.BOUNDING_BOX]: new BoundingBox(pos, size, new Vec2()),
      [ComponentName.SOLID]: new Solid(),
      [ComponentName.KILLABLE]: new Killable(),
    })

    return [entity, null!]
  }
}
