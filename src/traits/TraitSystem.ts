import { CreateSystemFunctionType } from '../types'
import { EventName } from '../EventEmitter'
import {
  queryAll,
  ComponentName,
  hasComponent,
  getComponent,
  checkComponent,
} from '../EntityFunctions'

export const TraitSystem: CreateSystemFunctionType = async (world) => {
  world.events.listen(EventName.WORLD_FIXED_STEP, () => {
    for (const entity of queryAll()) {
      if (hasComponent(entity, ComponentName.GO)) {
        const go = getComponent(entity, ComponentName.GO)

        checkComponent(entity, ComponentName.VELOCITY)
        const vel = getComponent(entity, ComponentName.VELOCITY)

        const absX = Math.abs(vel.x)

        if (go.dir !== 0) {
          vel.x += go.acceleration * go.dir * world.fixedDeltaSeconds
          console.log('vel.x', go.acceleration, go.dir, world.fixedDeltaSeconds)

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
    }
  })
}
