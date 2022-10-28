import { CreateSystemFunctionType } from '../types'
import { loadMusicSheet } from './AudioFunctions'
import { MusicController } from './MusicController'
import { LevelTimer } from '../traits/LevelTimer'
import { World } from '../World'
import { EventTypes } from '../EventEmitter'

export const AudioSystem: CreateSystemFunctionType = async (world) => {
  const player = await loadMusicSheet('overworld')
  const controller = new MusicController()

  controller.setPlayer(player)

  world.events.listen(LevelTimer.EVENT_TIMER_OK, () => {
    controller.playTheme()
  })

  world.events.listen(LevelTimer.EVENT_TIMER_HURRY, () => {
    controller.playHurryTheme()
  })

  world.events.listen(EventTypes.WORLD_PAUSE_EVENT, () => {
    controller.pause()
  })

  world.events.listen(EventTypes.WORLD_PLAY_EVENT, () => {
    // TODO play whatever was playing before
    controller.playTheme()
  })
}
