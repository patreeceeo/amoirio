import { Camera } from './video/Camera'
import { Compositor } from './video/Compositor'
import { EventEmitter } from './EventEmitter'
import { GameContext } from './GameContext'

export class Scene {
  static EVENT_COMPLETE = Symbol('scene complete')

  compositor = new Compositor()
  events = new EventEmitter()

  draw(gameContext: GameContext) {
    // the original code does not pass a new Camera() here,
    // but we need to pass one because our layers are typed
    // with the assumption that it'll always receive a camera.
    // hopefully this doesn't cause issues
    // (if anything this'll keep things from breaking)
    this.compositor.draw(gameContext.videoContext, new Camera())
  }

  update(gameContext: GameContext) {}

  pause() {}
}
