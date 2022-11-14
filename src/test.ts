import {
  createEntity,
  updateEntity,
  ComponentName,
  hasComponent,
  getComponent,
  clearFlags,
  hasNewComponent,
  query,
  reset,
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

  const entity1 = createEntity()
  const entity2 = createEntity()
  const entity3 = createEntity()

  updateEntity(entity1, {
    [ComponentName.SIZE]: new Vec2(),
    [ComponentName.PHYSICS]: true,
  })

  updateEntity(entity2, {
    [ComponentName.SIZE]: new Vec2(),
    [ComponentName.VELOCITY]: new Vec2(),
  })

  updateEntity(entity3, {
    [ComponentName.SIZE]: new Vec2(),
    [ComponentName.PHYSICS]: true,
  })

  assert.deepEqual(query([ComponentName.SIZE, ComponentName.PHYSICS]), [
    entity1,
    entity3,
  ])

  reset()
  console.log('PASSED!')
}
