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
  checkComponent,
} from '../EntityFunctions'
import { createBackgroundLayer } from '../layers/background'
import { getCurrentSpriteNameForEntity } from '../EntityAnimationFunctions'
import { createScoreboardLayer } from '../layers/scoreboard'
import { loadFont } from '../loaders/font'
import { WorldState } from '../World'
import { isFacingLeft } from '../traits/Go'

let previousBigMomentTimer = 0

export const VideoSystem: CreateSystemFunctionType = async (world) => {
  const context = getVideoContext()!
  const compositor = new Compositor()
  const camera = new Camera()

  const font = await loadFont()

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

      if (hasComponent(entity, ComponentName.SCORE)) {
        const scoreLayer = createScoreboardLayer(font, entity)
        compositor.layers.push(scoreLayer)
      }
    }
    compositor.layers.push(drawSpriteLayer)
    compositor.layers.push(pauseStatusLayer)

    // Actually draw the layers added to the compositor
    compositor.draw(context, camera)
  })

  world.events.listen(EventName.WORLD_FIXED_STEP, () => {
    // draw one more frame before stopping
    // TODO use WORLD_PAUSE event
    if (world.bigMomentTimer > 0 && previousBigMomentTimer > 0) {
      return
    }
    previousBigMomentTimer = world.bigMomentTimer
    // Actually draw the layers added to the compositor
    compositor.draw(context, camera)
  })

  world.events.listen(EventName.WORLD_PAUSE, () => {
    compositor.draw(context, camera)
  })

  function pauseStatusLayer() {
    if (world.state === WorldState.PAUSE) {
      font.print('PAUSE', context, font.size * (16 - 2.5), font.size)
    }
  }

  function drawSpriteLayer() {
    for (const entity of queryAll()) {
      if (
        hasComponent(entity, ComponentName.SPRITE_SHEET) &&
        hasComponent(entity, ComponentName.SIZE) &&
        hasComponent(entity, ComponentName.POSITION)
      ) {
        const spriteName = getCurrentSpriteNameForEntity(
          entity,
          world.fixedElapsedSeconds,
        )
        const sprites = getComponent(entity, ComponentName.SPRITE_SHEET)
        checkComponent(entity, ComponentName.POSITION)
        const position = getComponent(entity, ComponentName.POSITION)

        sprites.draw(
          spriteName,
          context,
          position.x - camera.pos.x,
          position.y - camera.pos.y,
          isFacingLeft(entity),
        )
      }
    }
  }
}
