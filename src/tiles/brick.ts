import { Side } from '../Entity'
import { TileColliderHandler } from '../TileCollider'
import { getComponent, ComponentName } from '../EntityFunctions'
import { EventName } from '../EventEmitter'

const handleX: TileColliderHandler = (entity, match, world) => {
  const vel = getComponent(entity, ComponentName.VELOCITY)
  const bounds = getComponent(entity, ComponentName.BOUNDING_BOX)
  if (vel.y >= 1500 * world.fixedDeltaSeconds && bounds.bottom <= match.y1) {
    if (vel.x > 0) {
      if (bounds.right > match.x1) {
        world.events.emit(EventName.OBSTRUCT, entity, Side.right, match)
      }
    } else if (vel.x < 0) {
      if (bounds.left < match.x2) {
        world.events.emit(EventName.OBSTRUCT, entity, Side.left, match)
      }
    }
  }
}

const handleY: TileColliderHandler = (entity, match, world) => {
  const vel = getComponent(entity, ComponentName.VELOCITY)
  const bounds = getComponent(entity, ComponentName.BOUNDING_BOX)
  if (vel.y > 0) {
    if (bounds.bottom > match.y1) {
      world.events.emit(EventName.OBSTRUCT, entity, Side.bottom, match)
    }
  }
}

export const brick = [handleX, handleY]
