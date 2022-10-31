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
} from '../EntityFunctions'
import { createBackgroundLayer } from '../layers/background'

export const VidoeSystem: CreateSystemFunctionType = async (world) => {
  const context = getVideoContext()!
  const compositor = new Compositor()
  const camera = new Camera()

  world.events.listen(EventName.WORLD_FIXED_STEP, () => {
    for (const entity of queryAll()) {
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
    compositor.draw(context, camera)
  })
}
