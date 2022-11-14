import { CreateSystemFunctionType, Dict } from './types'
import { EventName } from './EventEmitter'
import { Entity } from './EntityFunctions'
import { ControlSignalType, ControlSignalState } from './input/InputSystem'
import { WorldState } from './World'
export const TimerSystem: CreateSystemFunctionType = async (world) => {
  world.events.listen(
    EventName.INPUT,
    (
      _receivers: Array<Entity>,
      signalType: ControlSignalType,
      signalState: ControlSignalState,
    ) => {
      switch (signalType) {
        case ControlSignalType.PLAY_PAUSE:
          if (signalState === ControlSignalState.STARTED) {
            if (world.state === WorldState.PLAY) {
              world.state = WorldState.PAUSE
              world.events.emit(EventName.WORLD_PAUSE)
            } else {
              world.state = WorldState.PLAY
              world.events.emit(EventName.WORLD_PLAY)
            }
          }
      }
    },
  )
}
