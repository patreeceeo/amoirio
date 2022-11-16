import { CreateSystemFunctionType, Dict } from '../types'
import { EventName, EventEmitter } from '../EventEmitter'
import {
  queryAll,
  ComponentName,
  hasComponent,
  getComponent,
  checkComponent,
  hasNewComponent,
  Entity,
  updateEntity,
  deleteEntity,
} from '../EntityFunctions'
import { TileCollider, TileColliderHandler } from '../TileCollider'
// TODO reorganize/refactor handlers
import { coin as coinHandlers } from '../tiles/coin'
import { brick as brickHandlers } from '../tiles/brick'
import { ground as groundHandlers } from '../tiles/ground'
import { TileType } from '../loaders/types'
import { Side } from '../Entity'
import { TileResolverMatch } from '../TileResolver'
import { ControlSignalState, ControlSignalType } from '../input/InputSystem'

// TODO this should probably broken up into multiple more focused systems

const tileCollider = new TileCollider()

const GRAVITY = 1500

const SCREEN_WIDTH = 256

let leftState = 0
let rightState = 0

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

function setSpawnInfo(entity: Entity, spawnTime: number) {
  if (!hasComponent(entity, ComponentName.SPAWN)) {
    updateEntity(entity, {
      [ComponentName.SPAWN]: { spawnTime },
    })
  }
}

export const TraitSystem: CreateSystemFunctionType = async (world) => {
  world.events.listen(EventName.WORLD_INIT, () => {
    for (const entity of queryAll()) {
      setSpawnInfo(entity, world.fixedElapsedSeconds)
    }
  })

  world.events.listen(EventName.WORLD_FIXED_STEP, () => {
    for (const entity of queryAll()) {
      setSpawnInfo(entity, world.fixedElapsedSeconds)
      if (hasNewComponent(entity, ComponentName.TILE_MATRIX)) {
        const matrix = getComponent(entity, ComponentName.TILE_MATRIX)
        tileCollider.addGrid(matrix)
      }

      if (hasComponent(entity, ComponentName.PHYSICS)) {
        checkComponent(entity, ComponentName.POSITION)
        const pos = getComponent(entity, ComponentName.POSITION)

        checkComponent(entity, ComponentName.VELOCITY)
        const vel = getComponent(entity, ComponentName.VELOCITY)

        checkComponent(entity, ComponentName.BOUNDING_BOX)
        const bounds = getComponent(entity, ComponentName.BOUNDING_BOX)

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

        // Wrap around donut-shaped world
        if (pos.x > SCREEN_WIDTH + bounds.size.x && vel.x > 0) {
          pos.x = -bounds.size.x
        }

        if (pos.x < -bounds.size.x && vel.x < 0) {
          pos.x = SCREEN_WIDTH + bounds.size.x
        }
      }

      if (
        hasComponent(entity, ComponentName.GO) &&
        !getComponent(entity, ComponentName.KILLABLE)?.dead
      ) {
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

      if (hasComponent(entity, ComponentName.JUMP)) {
        const jump = getComponent(entity, ComponentName.JUMP)

        checkComponent(entity, ComponentName.VELOCITY)
        const vel = getComponent(entity, ComponentName.VELOCITY)

        if (jump.requestTime > 0) {
          if (jump.ready > 0) {
            // TODO queue sounds, maybe using events? world.soundfx?
            // entity.sounds.add('jump')
            jump.engageTime = jump.duration
            jump.requestTime = 0
          }
          jump.requestTime -= world.fixedDeltaSeconds
        }
        if (jump.engageTime > 0) {
          vel.y = -(jump.velocity + Math.abs(vel.x) * jump.speedBoost)
          jump.engageTime -= world.fixedDeltaSeconds
        }
        jump.ready -= 1
      }

      if (hasComponent(entity, ComponentName.PENDULUM_MOVE)) {
        const move = getComponent(entity, ComponentName.PENDULUM_MOVE)

        checkComponent(entity, ComponentName.VELOCITY)
        const vel = getComponent(entity, ComponentName.VELOCITY)

        if (move.enabled) {
          vel.x = move.speed
        }
      }

      if (hasComponent(entity, ComponentName.KOOPA_BEHAV)) {
        getComponent(entity, ComponentName.KOOPA_BEHAV).update(entity, world)
      }

      if (
        hasComponent(entity, ComponentName.BOUNDING_BOX) &&
        hasComponent(entity, ComponentName.VELOCITY)
      ) {
        for (const candidate of queryAll()) {
          if (hasComponent(candidate, ComponentName.BOUNDING_BOX)) {
            if (entity === candidate) continue

            const bounds = getComponent(entity, ComponentName.BOUNDING_BOX)
            const candidateBounds = getComponent(
              candidate,
              ComponentName.BOUNDING_BOX,
            )

            if (bounds.overlaps(candidateBounds)) {
              world.events.emit(EventName.COLLIDE, entity, candidate)
            }
          }
        }
      }

      if (hasComponent(entity, ComponentName.KILLABLE)) {
        const killable = getComponent(entity, ComponentName.KILLABLE)
        if (killable.dead) {
          killable.deadTime += world.fixedDeltaSeconds
          if (killable.deadTime > killable.removeAfter) {
            console.log(`KILLED ${getComponent(entity, ComponentName.NAME)}`)
            deleteEntity(entity)
          }
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

  world.events.listen(EventName.COLLIDE, (us, them) => {
    if (hasComponent(us, ComponentName.KOOPA_BEHAV)) {
      const behavior = getComponent(us, ComponentName.KOOPA_BEHAV)
      behavior.collides(us, them, world)
    }
  })

  // handle input

  world.events.listen(
    EventName.INPUT,
    (
      receivers: Array<Entity>,
      signalType: ControlSignalType,
      signalState: ControlSignalState,
    ) => {
      for (let entity of receivers) {
        const go = getComponent(entity, ComponentName.GO)
        switch (signalType) {
          case ControlSignalType.GO_LEFT:
            leftState = signalState === ControlSignalState.STARTED ? 1 : 0
            go.dir = rightState - leftState
            break
          case ControlSignalType.GO_RIGHT:
            rightState = signalState === ControlSignalState.STARTED ? 1 : 0
            go.dir = rightState - leftState
            break
          case ControlSignalType.JUMP:
            const jump = getComponent(entity, ComponentName.JUMP)
            if (signalState === ControlSignalState.STARTED) {
              jump.requestTime = jump.gracePeriod
            } else {
              jump.engageTime = 0
              jump.requestTime = 0
            }
            break
          // case ControlSignalType.TURBO: TODO?
        }
      }
    },
  )
}
