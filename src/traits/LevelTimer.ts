import { DeprecatedEntity } from '../Entity'
import { GameContext } from '../GameContext'
import { Level } from '../Level'
import { Trait } from '../Trait'
import { EventName } from '../EventEmitter'

export class LevelTimer extends Trait {
  totalTime = 300
  currentTime = this.totalTime
  hurryTime = 100
  hurryEmitted?: boolean

  update(
    entity: DeprecatedEntity,
    { deltaTime, world }: GameContext,
    level: Level,
  ) {
    this.currentTime -= deltaTime * 2

    if (this.hurryEmitted !== true && this.currentTime < this.hurryTime) {
      world.events.emit(EventName.TIMER_HURRY)
      this.hurryEmitted = true
    }

    if (this.hurryEmitted !== false && this.currentTime > this.hurryTime) {
      world.events.emit(EventName.TIMER_OK)
      this.hurryEmitted = false
    }
  }
}
