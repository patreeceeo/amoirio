import { CreateSystemFunctionType } from '../types'
import { EventName } from '../EventEmitter'
import { getVideoContext } from './VideoFunctions'
import { Compositor } from './Compositor'
import { Camera } from './Camera'
import {
  queryAll,
  ComponentName,
  getComponent,
  hasComponent,
} from '../EntityFunctions'
import { createBackgroundLayer } from '../layers/background'
import { V2_0 } from '../math'
import { getCurrentSpriteNameForEntity } from '../EntityAnimationFunctions'
import { createEditorLayer } from '../layers/editor'
import { loadFont } from '../loaders/font'

export const VideoSystem: CreateSystemFunctionType = async (world) => {
  const context = getVideoContext()!
  const compositor = new Compositor()
  const camera = new Camera()

  const font = await loadFont()
  const editorLayer = createEditorLayer(font, '1-1')

  world.events.listen(EventName.WORLD_INIT, () => {
    // Shift camera to the right one tile to facilitate donut-shaped world
    camera.pos.x = 16
    for (const entity of queryAll()) {
      // TODO don't use compositor and just draw on the canvas here directly?
      if (
        hasComponent(entity, ComponentName.SPRITE_SHEET) &&
        hasComponent(entity, ComponentName.TILE_MATRIX)
      ) {
        const sprites = getComponent(entity, ComponentName.SPRITE_SHEET)
        const tiles = getComponent(entity, ComponentName.TILE_MATRIX)
        const layer = createBackgroundLayer(world, tiles, sprites)
        compositor.layers.push(layer)
      }
    }
    compositor.layers.push(drawSpriteLayer)
    compositor.layers.push(editorLayer)

    // Actually draw the layers added to the compositor
    compositor.draw(context, camera)
  })

  world.events.listen(EventName.WORLD_FIXED_STEP, () => {
    // Actually draw the layers added to the compositor
    compositor.draw(context, camera)
  })

  function drawSpriteLayer() {
    for (const entity of queryAll()) {
      if (
        hasComponent(entity, ComponentName.SPRITE_SHEET) &&
        hasComponent(entity, ComponentName.ANIMATION) &&
        hasComponent(entity, ComponentName.SIZE) &&
        hasComponent(entity, ComponentName.POSITION)
      ) {
        const spriteName = getCurrentSpriteNameForEntity(
          entity,
          world.fixedElapsedSeconds,
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
  }
}
