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
import { raise } from '../raise'
import { V2_0 } from '../math'
import { getCurrentSpriteNameForEntity } from '../EntityAnimationFunctions'

export const VideoSystem: CreateSystemFunctionType = async (world) => {
  const context = getVideoContext()!
  const compositor = new Compositor()
  const camera = new Camera()
  const spriteBuffer = document.createElement('canvas')
  spriteBuffer.width = 64
  spriteBuffer.height = 64

  // TODO combine with getVideoContext?
  const spriteBufferContext =
    spriteBuffer.getContext('2d') || raise('Canvas not supported')

  world.events.listen(EventName.WORLD_FIXED_STEP, () => {
    for (const entity of queryAll()) {
      // TODO Instead of using hasNewComponent, do this in an init event handler
      // or, don't use compositor layers and just draw on the canvas directly in this
      // loop
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
        const size = getComponent(entity, ComponentName.SIZE)
        const width = size.x
        const height = size.y
        const hasVelocity = hasComponent(entity, ComponentName.VELOCITY)
        const velocity = hasVelocity
          ? getComponent(entity, ComponentName.VELOCITY)
          : V2_0
        const position = getComponent(entity, ComponentName.POSITION)

        // TODO maybe there should be some global lookup for sprite sheets that take a sprite name and return the corresponding sheet
        spriteBufferContext.clearRect(0, 0, width, height)

        // TODO can we just draw directly on the canvas here?
        sprites.draw(spriteName, spriteBufferContext, 0, 0, velocity.x < 0)

        context.drawImage(
          spriteBuffer,
          position.x - camera.pos.x,
          position.y - camera.pos.y,
        )
      }
    }
  })
}
