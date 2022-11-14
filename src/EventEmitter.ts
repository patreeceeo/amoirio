type Callback = (...args: any[]) => void
type Listener = { name: string | symbol; callback: Callback }

export enum EventName {
  WORLD_INIT = 'world/init',
  WORLD_FIXED_STEP = 'world/fixed_step',
  WORLD_PAUSE = 'world/pause',
  WORLD_PLAY = 'world/play',
  TIMER_HURRY = 'timer/hurry',
  TIMER_OK = 'timer/ok',
  OBSTRUCT = 'obstruct',
  INPUT = 'input',
}

export class EventEmitter {
  private listeners: Listener[] = []

  listen(name: EventName, callback: Callback) {
    this.listeners.push({ name, callback })
  }

  emit(name: string | symbol, ...args: any[]) {
    this.listeners
      .filter((it) => it.name === name)
      .forEach((it) => it.callback(...args))
  }
}
