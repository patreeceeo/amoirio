import { EventEmitter } from './EventEmitter'
import { EntityFactoryDict } from './entities'

export class World {
  fixedDeltaSeconds = 0
  fixedElapsedSeconds = 0
  events = new EventEmitter()
  prefabs?: EntityFactoryDict
}
