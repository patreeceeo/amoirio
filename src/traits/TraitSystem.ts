import { CreateSystemFunctionType, Dict } from '../types'
import { EventName } from '../EventEmitter'
import {
  queryAll,
  ComponentName,
  hasComponent,
  getComponent,
  checkComponent,
  hasNewComponent,
  Entity,
} from '../EntityFunctions'
import { TileCollider, TileColliderHandler } from '../TileCollider'
import { coin as coinHandlers } from '../tiles/coin'
import { brick as brickHandlers } from '../tiles/brick'
import { ground as groundHandlers } from '../tiles/ground'
import { TileType } from '../loaders/types'
import { Side } from '../Entity'
import { TileResolverMatch } from '../TileResolver'

const tileCollider = new TileCollider()

const GRAVITY = 1500

const xCollisionHandlersByTileType: Dict<TileColliderHandler> = {
  [TileType.BRICK]: brickHandlers[0],
  [TileType.COIN]: coinHandlers[0],
  [TileType.GROUND]: groundHandlers[0],
}
const yCollisionHandlersByTileType: Dict<TileColliderHandler> = {
  [TileType.BRICK]: brickHandlers[1],
  [TileType.COIN]: coinHandlers[1],
  [TileType.GROUND]: groundHandlers[1],
}

export const TraitSystem: CreateSystemFunctionType = async (world) => {
  world.events.listen(EventName.WORLD_FIXED_STEP, () => {
    for (const entity of queryAll()) {
      if (hasNewComponent(entity, ComponentName.TILE_MATRIX)) {
        const matrix = getComponent(entity, ComponentName.TILE_MATRIX)
        tileCollider.addGrid(matrix)
      }

      if (hasComponent(entity, ComponentName.PHYSICS)) {
        checkComponent(entity, ComponentName.POSITION)
        const pos = getComponent(entity, ComponentName.POSITION)

        checkComponent(entity, ComponentName.VELOCITY)
        const vel = getComponent(entity, ComponentName.VELOCITY)

        pos.x += vel.x * world.fixedDeltaSeconds

        for (const match of tileCollider.checkX(entity)) {
          const handler = xCollisionHandlersByTileType[match.tile.type]
          if (handler) {
            handler(entity, match, world)
          }
        }

        pos.y += vel.y * world.fixedDeltaSeconds

        for (const match of tileCollider.checkY(entity)) {
          const handler = yCollisionHandlersByTileType[match.tile.type]
          if (handler) {
            handler!(entity, match, world)
          }
        }

        vel.y += GRAVITY * world.fixedDeltaSeconds
      }

      if (hasComponent(entity, ComponentName.GO)) {
        const go = getComponent(entity, ComponentName.GO)

        checkComponent(entity, ComponentName.VELOCITY)
        const vel = getComponent(entity, ComponentName.VELOCITY)

        const absX = Math.abs(vel.x)

        if (go.dir !== 0) {
          vel.x += go.acceleration * go.dir * world.fixedDeltaSeconds

          if (hasComponent(entity, ComponentName.JUMP)) {
            const jump = getComponent(entity, ComponentName.JUMP)
            if (jump.falling === false) {
              go.heading = go.dir
            }
          } else {
            go.heading = go.dir
          }
        } else if (vel.x !== 0) {
          const decel = Math.min(
            absX,
            go.deceleration * world.fixedDeltaSeconds,
          )
          vel.x += -Math.sign(vel.x) * decel
        } else {
          go.distance = 0
        }
        const drag = go.dragFactor * vel.x * absX
        vel.x -= drag

        go.distance += absX * world.fixedDeltaSeconds
      }

      if (hasComponent(entity, ComponentName.PENDULUM_MOVE)) {
        const move = getComponent(entity, ComponentName.PENDULUM_MOVE)

        checkComponent(entity, ComponentName.VELOCITY)
        const vel = getComponent(entity, ComponentName.VELOCITY)

        if (move.enabled) {
          vel.x = move.speed
        }
      }
    }
  })

  world.events.listen(
    EventName.OBSTRUCT,
    (entity: Entity, side: Side, match: TileResolverMatch) => {
      if (hasComponent(entity, ComponentName.SOLID)) {
        const solid = getComponent(entity, ComponentName.SOLID)

        checkComponent(entity, ComponentName.BOUNDING_BOX)
        const bounds = getComponent(entity, ComponentName.BOUNDING_BOX)

        checkComponent(entity, ComponentName.VELOCITY)
        const vel = getComponent(entity, ComponentName.VELOCITY)

        if (solid.obstructs) {
          if (side === Side.bottom) {
            bounds.bottom = match.y1
            vel.y = 0
          } else if (side === Side.top) {
            bounds.top = match.y2
            vel.y = 0
          } else if (side === Side.right) {
            bounds.right = match.x1
            vel.x = 0
          } else if (side === Side.left) {
            bounds.left = match.x2
            vel.x = 0
          }
        }
      }

      if (hasComponent(entity, ComponentName.JUMP)) {
        const jump = getComponent(entity, ComponentName.JUMP)
        if (side === Side.bottom) {
          jump.ready = 1
        } else if (side === Side.top) {
          jump.engageTime = 0
          jump.requestTime = 0
        }
      }

      if (hasComponent(entity, ComponentName.PENDULUM_MOVE)) {
        const move = getComponent(entity, ComponentName.PENDULUM_MOVE)
        if (side === Side.left) {
          move.speed = Math.abs(move.speed)
        } else if (side === Side.right) {
          move.speed = -Math.abs(move.speed)
        }
      }
    },
  )
}
