import {
  createEntity,
  updateEntity,
  ComponentName,
  hasComponent,
  getComponent,
  clearFlags,
  hasNewComponent,
} from './EntityFunctions'
import { Vec2 } from './math'
import assert from 'assert'

export function runTests() {
  const entity = createEntity()
  updateEntity(entity, {
    [ComponentName.POSITION]: new Vec2(55, 13),
  })

  assert(hasComponent(entity, ComponentName.POSITION))
  assert(!hasComponent(entity, ComponentName.SPRITE_SHEET))
  const v2 = getComponent(entity, ComponentName.POSITION)
  assert(v2.x === 55)
  assert(v2.y === 13)

  assert(hasNewComponent(entity, ComponentName.POSITION))
  clearFlags()
  assert(!hasNewComponent(entity, ComponentName.POSITION))

  updateEntity(entity, {}, [ComponentName.POSITION])
  assert(!hasComponent(entity, ComponentName.POSITION))

  updateEntity(-1, {
    [ComponentName.POSITION]: new Vec2(),
  })

  // Negative numbers are "null" entities
  assert(!hasComponent(-1, ComponentName.POSITION))

  console.log('PASSED!')
}
