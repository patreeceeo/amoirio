import { CreateSystemFunctionType } from '../types'
import { loadMusicSheet } from './AudioFunctions'
import { MusicController } from './MusicController'
import { World } from '../World'
import { EventName } from '../EventEmitter'

export const AudioSystem: CreateSystemFunctionType = async (world) => {
  const player = await loadMusicSheet('overworld')
  const controller = new MusicController()

  controller.setPlayer(player)

  world.events.listen(EventName.TIMER_OK, () => {
    controller.playTheme()
  })

  world.events.listen(EventName.TIMER_HURRY, () => {
    controller.playHurryTheme()
  })

  world.events.listen(EventName.WORLD_PAUSE, () => {
    controller.pause()
  })

  world.events.listen(EventName.WORLD_PLAY, () => {
    // TODO play whatever was playing before
    controller.playTheme()
  })
}
