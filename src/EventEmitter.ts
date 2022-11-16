import { Entity } from './EntityFunctions'
import { ControlSignalType, ControlSignalState } from './input/InputSystem'
import { Side } from './Entity'
import { TileResolverMatch } from './TileResolver'

export enum EventName {
  WORLD_INIT = 'world/init',
  WORLD_FIXED_STEP = 'world/fixed_step',
  WORLD_PAUSE = 'world/pause',
  WORLD_PLAY = 'world/play',
  /** TODO delete? */
  TIMER_HURRY = 'timer/hurry',
  /** TODO delete? */
  TIMER_OK = 'timer/ok',
  OBSTRUCT = 'obstruct',
  COLLIDE = 'collide',
  INPUT = 'input',
}

export type EventArgs = {
  [EventName.INPUT]: [Array<Entity>, ControlSignalType, ControlSignalState]
  [EventName.OBSTRUCT]: [Entity, Side, TileResolverMatch]
  [EventName.WORLD_INIT]: []
  [EventName.WORLD_FIXED_STEP]: []
  [EventName.WORLD_PAUSE]: []
  [EventName.WORLD_PLAY]: []
  [EventName.TIMER_OK]: []
  [EventName.TIMER_HURRY]: []
  [EventName.COLLIDE]: [Entity, Entity]
}

type Callback = (...args: any[]) => void
type Listener = { name: string | symbol; callback: Callback }

export class EventEmitter {
  private listeners: Listener[] = []

  listen(name: EventName, callback: Callback) {
    this.listeners.push({ name, callback })
  }

  emit<N extends EventName>(name: N, ...args: EventArgs[N]) {
    this.listeners
      .filter((it) => it.name === name)
      .forEach((it) => it.callback(...args))
  }
}
