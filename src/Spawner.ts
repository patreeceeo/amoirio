import { Entity } from './EntityFunctions'

export class Spawner {
  timer = 0
  hasSpawned = false
  constructor(
    public prefab: string,
    public countLimit: number,
    public brood: Array<Entity>,
    public readonly throttle: number,
    public leadingEdge = true,
  ) {}
}
