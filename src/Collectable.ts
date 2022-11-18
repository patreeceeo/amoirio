export enum CollectableType {
  SHROOM = 'shroom',
  PLANT = 'plant',
}
export class Collectable {
  constructor(public value: number, public readonly type: CollectableType) {}
}
