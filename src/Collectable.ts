export enum CollectableType {
  SHROOM = 'shroom',
  PLANT = 'plant',
}
export class Collectable {
  constructor(
    public readonly value: number,
    public readonly type: CollectableType,
  ) {}
}
