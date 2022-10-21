import { Trait } from '../Trait'
import {Level} from '../Level'

export class LevelEditor extends Trait {
  level: Level
  constructor(level: Level) {
    super()
    this.level = level
  }
  pauseLevel() {
    this.level.pause()
  }
  playLevel() {
    this.level.play()
  }
  isLevelPlaying() {
    return this.level.isPlaying
  }
}
