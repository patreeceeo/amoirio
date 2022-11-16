export type KeyListener = (keyCode: string, keyState: number) => boolean

export class Keyboard {
  private constructor(private target: EventTarget) {
    const keyEvents = ['keydown', 'keyup']
    keyEvents.forEach((eventName) => {
      this.target.addEventListener(eventName, (event) => {
        this.handleEvent(event as KeyboardEvent)
      })
    })
  }
  /** current pressed state per key */
  private keyStates = new Map<string, number>()
  private listeners: Array<KeyListener> = []

  addListener(callback: KeyListener) {
    this.listeners.push(callback)
  }

  static listenTo(target: EventTarget) {
    return new Keyboard(target)
  }

  private handleEvent(event: KeyboardEvent) {
    if (event.repeat) return

    for (const listener of this.listeners) {
      const keyState = event.type === 'keydown' ? 1 : 0
      this.keyStates.set(event.code, keyState)
      if (listener(event.code, keyState)) {
        event.preventDefault()
      }
    }
  }
}
