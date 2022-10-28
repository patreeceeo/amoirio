import { EntityFactory } from './entities'
import { Dict } from './types'
import { World } from './World'

export type GameContext = {
  audioContext: AudioContext
  deltaTime: number
  entityFactory: Dict<EntityFactory>
  videoContext: CanvasRenderingContext2D
  world: World
}
