import { CreateSystemFunctionType, Dict } from '../types'
import { Keyboard } from '../Keyboard'
import { EventName } from '../EventEmitter'
import { query, ComponentName } from '../EntityFunctions'

export enum ControlSignalType {
  MARIO_LEFT = 'mario-left',
  MARIO_RIGHT = 'mario-right',
  MARIO_JUMP = 'jump',
  BOWSER_LEFT = 'bowser-left',
  BOWSER_RIGHT = 'bowser-right',
  BOWSER_JUMP = 'bowser-jump',
  BOWSER_SHROOM = 'bowser-shroom',
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
  Numpad8: ControlSignalType.MARIO_JUMP,
  Numpad4: ControlSignalType.MARIO_LEFT,
  Numpad6: ControlSignalType.MARIO_RIGHT,
  KeyI: ControlSignalType.MARIO_JUMP,
  KeyJ: ControlSignalType.MARIO_LEFT,
  KeyL: ControlSignalType.MARIO_RIGHT,
  KeyA: ControlSignalType.BOWSER_LEFT,
  KeyD: ControlSignalType.BOWSER_RIGHT,
  KeyW: ControlSignalType.BOWSER_JUMP,
  KeyS: ControlSignalType.BOWSER_SHROOM,
})

export const InputSystem: CreateSystemFunctionType = async (world) => {
  const keyboard = Keyboard.listenTo(window)

  keyboard.addListener((code, pressed) => {
    const receivers = query([ComponentName.INPUT_RECEIVER])
    const signalType = KeyboardControlMap[code]
    const signalState = pressed
      ? ControlSignalState.STARTED
      : ControlSignalState.ENDED

    let handled = false

    if (receivers.length > 0 && signalType !== undefined) {
      world.events.emit(EventName.INPUT, receivers, signalType, signalState)
      handled = true
    } else if (signalType !== undefined) {
      console.warn('Zero input receivers')
    }
    return handled
  })
}
