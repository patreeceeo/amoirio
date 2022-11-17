import { CreateSystemFunctionType } from './types'
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
} from './EntityFunctions'

function countLivingEntities(ents: Array<Entity>) {
  return ents.filter(isEntity).length
}

export const SpawnSystem: CreateSystemFunctionType = async (world) => {
  world.events.listen(EventName.WORLD_FIXED_STEP, () => {
    for (const entity of queryAll()) {
      if (hasComponent(entity, ComponentName.SPAWNER)) {
        const spawner = getComponent(entity, ComponentName.SPAWNER)

        if (countLivingEntities(spawner.brood) < spawner.minCount) {
          spawner.timer += world.fixedDeltaSeconds

          if (spawner.timer >= spawner.respawnDelay) {
            spawner.timer = 0

            const createEntityPrefab = world.prefabs![spawner.prefab]
            if (!createEntityPrefab) {
              throw new Error(
                `Could not find factory function for entity "${name}"`,
              )
            }

            const [spawnedEntity] = createEntityPrefab()

            checkComponent(entity, ComponentName.POSITION)
            const spawnerPos = getComponent(entity, ComponentName.POSITION)

            getComponent(entity, ComponentName.SPAWNER).brood.push(
              spawnedEntity,
            )

            // TODO this is a bit of a gotcha. Must update existing position NOT create one, otherwise it will get out of sync with bounding box
            getComponent(spawnedEntity, ComponentName.POSITION).copy(spawnerPos)

            updateEntity(spawnedEntity, {
              // [ComponentName.POSITION]: new Vec2(pos.x, pos.y),
              [ComponentName.SPAWN]: { spawnTime: world.fixedElapsedSeconds },
            })
          }
        }
      }
    }
  })
}
