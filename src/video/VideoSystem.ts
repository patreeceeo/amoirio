import { CreateSystemFunctionType } from '../types'
import { EventName } from '../EventEmitter'
import { getVideoContext } from './VideoFunctions'
import { Compositor } from './Compositor'
import { Camera } from './Camera'
import {
  queryAll,
  ComponentName,
  hasNewComponent,
  getComponent,
  hasComponent,
} from '../EntityFunctions'
import { createBackgroundLayer } from '../layers/background'
import { V2_0 } from '../math'
import { getCurrentSpriteNameForEntity } from '../EntityAnimationFunctions'

export const VideoSystem: CreateSystemFunctionType = async (world) => {
  const context = getVideoContext()!
  const compositor = new Compositor()
  const camera = new Camera()

  world.events.listen(EventName.WORLD_FIXED_STEP, () => {
    for (const entity of queryAll()) {
      // TODO Instead of using hasNewComponent, do this in an init event handler
      // or, don't use compositor layers and just draw on the canvas directly in this
      // loop <- This TBH
      if (
        hasNewComponent(entity, ComponentName.SPRITE_SHEET) &&
        hasNewComponent(entity, ComponentName.TILE_MATRIX)
      ) {
        const sprites = getComponent(entity, ComponentName.SPRITE_SHEET)
        const tiles = getComponent(entity, ComponentName.TILE_MATRIX)
        const layer = createBackgroundLayer(world, tiles, sprites)
        compositor.layers.push(layer)
      }
    }

    // Actually draw the layers added to the compositor
    compositor.draw(context, camera)

    for (const entity of queryAll()) {
      if (
        hasComponent(entity, ComponentName.SPRITE_SHEET) &&
        hasComponent(entity, ComponentName.ANIMATION) &&
        hasComponent(entity, ComponentName.SIZE) &&
        hasComponent(entity, ComponentName.POSITION)
      ) {
        const spriteName = getCurrentSpriteNameForEntity(
          entity,
          world.fixedDeltaSeconds,
        )
        const sprites = getComponent(entity, ComponentName.SPRITE_SHEET)
        const hasVelocity = hasComponent(entity, ComponentName.VELOCITY)
        const velocity = hasVelocity
          ? getComponent(entity, ComponentName.VELOCITY)
          : V2_0
        const position = getComponent(entity, ComponentName.POSITION)

        sprites.draw(
          spriteName,
          context,
          position.x - camera.pos.x,
          position.y - camera.pos.y,
          velocity.x < 0,
        )
      }
    }
  })
}
