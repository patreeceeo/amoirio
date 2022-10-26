import { Trait } from '../Trait'
import {Level} from '../Level'
import {World} from '../World'
import {EventTypes} from '../EventEmitter'

export class LevelEditor extends Trait {
  constructor(private level: Level, private world: World) {
    super()
  }
  pauseLevel() {
    this.level.pause()
    this.world.events.emit(EventTypes.WORLD_PAUSE_EVENT)

  }
  playLevel() {
    this.level.play()
    this.world.events.emit(EventTypes.WORLD_PLAY_EVENT)
  }
  isLevelPlaying() {
    return this.level.isPlaying
  }
}
