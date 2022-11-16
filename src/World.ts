import { EventEmitter } from './EventEmitter'
import { EntityFactoryDict } from './entities'

export enum WorldState {
  PLAY = 'play',
  PAUSE = 'pause',
}

export class World {
  fixedDeltaSeconds = 0
  fixedElapsedSeconds = 0
  events = new EventEmitter()
  prefabs?: EntityFactoryDict
  state = WorldState.PAUSE
  bigMomemtTimer = 0
}
