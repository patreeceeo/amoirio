export class Timer {
  private accumulatedTime = 0
  private lastTime?: number

  constructor(private deltaTimeTarget = 1 / 60) {}

  onFixedStep = (dt: number) => {}

  onAnimationFrame = (dt: number) => {}

  start() {
    this.enqueue()
  }

  private enqueue() {
    requestAnimationFrame(this.updateProxy)
  }

  private updateProxy = (time: number) => {
    if (this.lastTime != null) {
      this.onAnimationFrame(time)

      this.accumulatedTime += (time - this.lastTime) / 1000
      this.accumulatedTime = Math.min(this.accumulatedTime, 1)

      while (this.accumulatedTime > this.deltaTimeTarget) {
        this.onFixedStep(this.deltaTimeTarget)
        this.accumulatedTime -= this.deltaTimeTarget
      }
    }

    this.lastTime = time
    this.enqueue()
  }
}
