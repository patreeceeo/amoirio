type Callback = (...args: any[]) => void
type Listener = { name: string | symbol; callback: Callback }

export enum EventTypes {
  WORLD_FIXED_STEP_EVENT = "world/fixed_step",
  WORLD_PAUSE_EVENT = "world/pause",
  WORLD_PLAY_EVENT = "world/play"
}

export class EventEmitter {
  private listeners: Listener[] = []

  // TODO use an enum instead of a string?
  listen(name: string | symbol, callback: Callback) {
    this.listeners.push({ name, callback })
  }

  emit(name: string | symbol, ...args: any[]) {
    this.listeners
      .filter(it => it.name === name)
      .forEach(it => it.callback(...args))
  }
}
