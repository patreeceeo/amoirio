import { Entity } from './EntityFunctions'

export class Spawner {
  timer = 0
  constructor(
    public prefab: string,
    public minCount: number,
    public brood: Array<Entity>,
    public readonly respawnDelay: number,
  ) {}
}
