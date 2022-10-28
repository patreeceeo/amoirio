import { Trait } from '../Trait'
import { Level } from '../Level'
import { World } from '../World'
import { EventName } from '../EventEmitter'

export class LevelEditor extends Trait {
  constructor(private level: Level, private world: World) {
    super()
  }
  pauseLevel() {
    this.level.pause()
    this.world.events.emit(EventName.WORLD_PAUSE)
  }
  playLevel() {
    this.level.play()
    this.world.events.emit(EventName.WORLD_PLAY)
  }
  isLevelPlaying() {
    return this.level.isPlaying
  }
}
