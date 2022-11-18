import { CreateSystemFunctionType, Dict } from './types'
import { EventName } from './EventEmitter'
import {
  queryAll,
  hasComponent,
  ComponentName,
  updateEntity,
  Entity,
  getComponent,
  checkComponent,
  isEntity,
  query,
} from './EntityFunctions'
import { shuffle } from 'lodash'
import { isFacingLeft } from './traits/Go'

function countLivingEntities(ents: Array<Entity>) {
  return ents.filter(isEntity).length
}

const broods: Dict<Array<Entity>> = {}

export const SpawnSystem: CreateSystemFunctionType = async (world) => {
  world.events.listen(EventName.WORLD_FIXED_STEP, () => {
    for (const entity of shuffle(queryAll())) {
      if (hasComponent(entity, ComponentName.SPAWNER)) {
        const spawner = getComponent(entity, ComponentName.SPAWNER)

        if (
          countLivingEntities(broods[spawner.prefab] || []) < spawner.countLimit
        ) {
          spawner.timer += world.fixedDeltaSeconds

          if (
            spawner.timer >= spawner.throttle ||
            (spawner.leadingEdge && !spawner.hasSpawned)
          ) {
            spawner.timer = 0
            spawner.hasSpawned = true

            const createEntityPrefab = world.prefabs![spawner.prefab]
            if (!createEntityPrefab) {
              throw new Error(
                `Could not find factory function for entity "${spawner.prefab}"`,
              )
            }

            const [spawnedEntity] = createEntityPrefab()

            checkComponent(entity, ComponentName.POSITION)
            const spawnerPos = getComponent(entity, ComponentName.POSITION)

            broods[spawner.prefab] = broods[spawner.prefab] || []
            broods[spawner.prefab]!.push(spawnedEntity)

            // TODO this is a bit of a gotcha. Must update existing position NOT create one, otherwise it will get out of sync with bounding box
            checkComponent(spawnedEntity, ComponentName.POSITION)
            getComponent(spawnedEntity, ComponentName.POSITION).copy(spawnerPos)

            updateEntity(spawnedEntity, {
              // [ComponentName.POSITION]: new Vec2(pos.x, pos.y),
              [ComponentName.SPAWN]: { spawnTime: world.fixedElapsedSeconds },
            })

            // Update score
            if (spawner.prefab === 'shroom') {
              const scoreKeeper = query([ComponentName.SCORE])[0]
              const score = getComponent(scoreKeeper, ComponentName.SCORE)

              score.shroomForecast -= 1

              const bowser = query([ComponentName.IS_B])[0]

              getComponent(
                spawnedEntity,
                ComponentName.PENDULUM_MOVE,
              ).speed *= isFacingLeft(bowser) ? -1 : 1
            }
          }
        }
      }
    }
  })
}
