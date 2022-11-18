import { CreateSystemFunctionType, Dict } from '../types'
import { EventName } from '../EventEmitter'
import {
  queryAll,
  ComponentName,
  hasComponent,
  getComponent,
  checkComponent,
  Entity,
  updateEntity,
  deleteEntity,
  query,
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
import { CollectableType } from '../Collectable'
import { getDir } from './Go'
import {
  ShroomState,
  ShroomStateSprite,
  ShroomStateValue,
} from '../entities/Shroom'

// TODO this should probably broken up into multiple more focused systems

const tileCollider = new TileCollider()

const GRAVITY = 1500

const SCREEN_SIZE = 256

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
  world.events.listen(EventName.WORLD_INIT, () => {
    for (const entity of queryAll()) {
      if (hasComponent(entity, ComponentName.TILE_MATRIX)) {
        const matrix = getComponent(entity, ComponentName.TILE_MATRIX)
        tileCollider.addGrid(matrix)
      }
    }
  })

  world.events.listen(EventName.WORLD_FIXED_STEP, () => {
    for (const entity of queryAll()) {
      if (hasComponent(entity, ComponentName.KILLABLE)) {
        const killable = getComponent(entity, ComponentName.KILLABLE)
        if (killable.dead) {
          if (killable.deadTime === 0) {
            world.bigMomemtTimer += killable.removeAfter / 2
            updateEntity(entity, {}, [ComponentName.PHYSICS])
          }
          if (
            killable.deadTime > killable.removeAfter / 2 &&
            !killable.kicked
          ) {
            killable.kicked = true
            updateEntity(entity, {
              [ComponentName.PHYSICS]: true,
            })
            getComponent(entity, ComponentName.SOLID).obstructs = false
            getComponent(entity, ComponentName.VELOCITY).set(0, -400)
          }

          killable.deadTime += world.fixedDeltaSeconds
          if (killable.deadTime >= killable.removeAfter) {
            console.log(`KILLED ${getComponent(entity, ComponentName.NAME)}`)
            deleteEntity(entity)
          }
        }
      }

      if (world.bigMomemtTimer > 0) {
        return
      }

      if (hasComponent(entity, ComponentName.PHYSICS)) {
        checkComponent(entity, ComponentName.POSITION)
        const pos = getComponent(entity, ComponentName.POSITION)

        checkComponent(entity, ComponentName.VELOCITY)
        const vel = getComponent(entity, ComponentName.VELOCITY)

        checkComponent(entity, ComponentName.BOUNDING_BOX)
        const bounds = getComponent(entity, ComponentName.BOUNDING_BOX)

        pos.x += vel.x * world.fixedDeltaSeconds

        // Wrap around donut-shaped world
        if (pos.x > SCREEN_SIZE + bounds.size.x && vel.x > 0) {
          pos.x = 0
        }

        if (pos.x <= 1 && vel.x < 0) {
          pos.x = SCREEN_SIZE + bounds.size.x
        }

        for (const match of tileCollider.checkX(entity)) {
          const handler = xCollisionHandlersByTileType[match.tile.type]
          if (handler) {
            handler(entity, match, world)
          }
        }

        pos.y += vel.y * world.fixedDeltaSeconds
        vel.y += GRAVITY * world.fixedDeltaSeconds

        if (
          pos.y > SCREEN_SIZE + bounds.size.x &&
          vel.y > 0 &&
          !getComponent(entity, ComponentName.KILLABLE)?.dead
        ) {
          pos.y = 0
        }

        if (pos.y <= 1 && vel.y < 0) {
          pos.y = SCREEN_SIZE + bounds.size.y
        }

        for (const match of tileCollider.checkY(entity)) {
          const handler = yCollisionHandlersByTileType[match.tile.type]
          if (handler) {
            handler!(entity, match, world)
          }
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

      // Prevent spawning more shrooms than the score allows for

      if (hasComponent(entity, ComponentName.IS_B)) {
        const scoreKeeper = query([ComponentName.SCORE])[0]
        const score = getComponent(scoreKeeper, ComponentName.SCORE)

        checkComponent(entity, ComponentName.SPAWNER)
        const spawner = getComponent(entity, ComponentName.SPAWNER)

        if (score.shroomForecast <= 0) {
          spawner.countLimit = 0
        }
      }
      if (hasComponent(entity, ComponentName.SHROOM)) {
        const spawnInfo = getComponent(entity, ComponentName.SPAWN)
        const shroom = getComponent(entity, ComponentName.SHROOM)
        if (shroom < ShroomState.RED) {
          const newState = Math.min(
            ShroomState.RED,
            Math.floor((world.fixedElapsedSeconds - spawnInfo.spawnTime) / 5),
          )
          updateEntity(entity, {
            [ComponentName.SHROOM]: newState,
            [ComponentName.SPRITE]: ShroomStateSprite[newState],
          })
          getComponent(entity, ComponentName.COLLECTABLE).value =
            ShroomStateValue[newState]
        }
      }
    }
  }) // WORLD_FIXED_STEP

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
          // TODO Why does mario only trigger obstruct every other frame when standing on the ground?
          jump.ready = 2
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
    const scoreKeeper = query([ComponentName.SCORE])[0]
    if (hasComponent(us, ComponentName.KOOPA_BEHAV)) {
      const behavior = getComponent(us, ComponentName.KOOPA_BEHAV)
      behavior.collides(us, them, world)
    }

    // TODO should bowser's mere touch be deadly?
    // if (
    //   hasComponent(us, ComponentName.IS_B) &&
    //   hasComponent(them, ComponentName.IS_A)
    // ) {
    //   checkComponent(them, ComponentName.KILLABLE)
    //   getComponent(them, ComponentName.KILLABLE).dead = true
    //   getComponent(scoreKeeper, ComponentName.SCORE).expenses += 200
    // }

    if (
      hasComponent(them, ComponentName.COLLECTABLE) &&
      !getComponent(us, ComponentName.KILLABLE)?.dead
    ) {
      const collectable = getComponent(them, ComponentName.COLLECTABLE)
      switch (collectable.type) {
        case CollectableType.SHROOM:
          if (hasComponent(us, ComponentName.IS_A)) {
            deleteEntity(them)
            getComponent(scoreKeeper, ComponentName.SCORE).revenue +=
              collectable.value
          }
          break
        case CollectableType.PLANT:
          if (hasComponent(us, ComponentName.IS_B)) {
            deleteEntity(them)
            getComponent(scoreKeeper, ComponentName.SCORE).shroomForecast +=
              collectable.value
          }
      }
    }

    if (
      hasComponent(them, ComponentName.SHROOM) &&
      getComponent(them, ComponentName.SHROOM) === ShroomState.DEATH &&
      getComponent(us, ComponentName.IS_A)
    ) {
      checkComponent(us, ComponentName.KILLABLE)
      getComponent(us, ComponentName.KILLABLE).dead = true
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
        let leftSignal, rightSignal, jumpSignal
        if (hasComponent(entity, ComponentName.IS_A)) {
          leftSignal = ControlSignalType.MARIO_LEFT
          rightSignal = ControlSignalType.MARIO_RIGHT
          jumpSignal = ControlSignalType.MARIO_JUMP
        }
        if (hasComponent(entity, ComponentName.IS_B)) {
          leftSignal = ControlSignalType.BOWSER_LEFT
          rightSignal = ControlSignalType.BOWSER_RIGHT
          jumpSignal = ControlSignalType.BOWSER_JUMP
        }
        switch (signalType) {
          case leftSignal:
            go.leftState = signalState
            go.dir = getDir(go)
            break
          case rightSignal:
            go.rightState = signalState
            go.dir = getDir(go)
            break
          case jumpSignal:
            const jump = getComponent(entity, ComponentName.JUMP)
            if (signalState === ControlSignalState.STARTED) {
              jump.requestTime = jump.gracePeriod
            } else {
              jump.engageTime = 0
              jump.requestTime = 0
            }
            break
          case ControlSignalType.BOWSER_SHROOM:
            if (hasComponent(entity, ComponentName.IS_B)) {
              const scoreKeeper = query([ComponentName.SCORE])[0]
              const score = getComponent(scoreKeeper, ComponentName.SCORE)
              checkComponent(entity, ComponentName.SPAWNER)
              const spawner = getComponent(entity, ComponentName.SPAWNER)

              if (
                signalState === ControlSignalState.STARTED &&
                score.shroomForecast > 0
              ) {
                spawner.countLimit = 8
              }
              if (signalState === ControlSignalState.ENDED) {
                spawner.countLimit = 0
                // make it spawn immediately again
                spawner.hasSpawned = false
              }
            }
        }
      }
    },
  )
}
