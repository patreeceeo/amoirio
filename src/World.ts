import {EventEmitter} from "./EventEmitter"

export class World {
  fixedDeltaSeconds = 0
  fixedElapsedSeconds = 0
  events = new EventEmitter()
}
