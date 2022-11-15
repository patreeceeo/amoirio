import { CreateSystemFunctionType, Dict } from '../types'
import { Keyboard } from '../Keyboard'
import { EventName } from '../EventEmitter'
import { query, ComponentName } from '../EntityFunctions'

export enum ControlSignalType {
  GO_LEFT = 'go-left',
  GO_RIGHT = 'go-right',
  JUMP = 'jump',
  TURBO = 'turbo',
  PLAY_PAUSE = 'play/pause',
}

export enum ControlSignalState {
  STARTED = 'started',
  ENDED = 'ended',
}

const KeyboardControlMap: Dict<ControlSignalType> = Object.freeze({
  Space: ControlSignalType.PLAY_PAUSE,
  KeyX: ControlSignalType.TURBO,
  KeyZ: ControlSignalType.JUMP,
  ArrowLeft: ControlSignalType.GO_LEFT,
  ArrowRight: ControlSignalType.GO_RIGHT,
})

export const InputSystem: CreateSystemFunctionType = async (world) => {
  const keyboard = Keyboard.listenTo(window)

  keyboard.addListener((code, pressed) => {
    const receivers = query([ComponentName.INPUT_RECEIVER])
    const signalType = KeyboardControlMap[code]
    const signalState = pressed
      ? ControlSignalState.STARTED
      : ControlSignalState.ENDED

    if (receivers.length > 0 && signalType !== undefined) {
      world.events.emit(EventName.INPUT, receivers, signalType, signalState)
    } else if (signalType !== undefined) {
      console.warn('Zero input receivers')
    }
  })
}
