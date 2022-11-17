import { Entity } from './EntityFunctions'

export class Spawner {
  readonly respawnDelay = 2
  timer = 0
  constructor(
    public prefab: string,
    public minCount: number,
    public brood: Array<Entity>,
  ) {}
}
