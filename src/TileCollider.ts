import {
  TileResolver,
  TileResolverMatch,
  TileResolverMatrix,
} from './TileResolver'
import { Entity, getComponent, ComponentName } from './EntityFunctions'
import { World } from './World'

export type TileColliderHandler = (
  entity: Entity,
  match: TileResolverMatch,
  world: World,
) => void

export class TileCollider {
  resolvers: TileResolver[] = []

  addGrid(tileMatrix: TileResolverMatrix) {
    this.resolvers.push(new TileResolver(tileMatrix))
  }

  checkX(entity: Entity): Array<TileResolverMatch> {
    let x
    const vel = getComponent(entity, ComponentName.VELOCITY)
    const bounds = getComponent(entity, ComponentName.BOUNDING_BOX)
    const collisions: Array<TileResolverMatch> = []
    if (vel.x > 0) {
      x = bounds.right
    } else if (vel.x < 0) {
      x = bounds.left
    } else {
      return collisions
    }

    for (const resolver of this.resolvers) {
      const matches = resolver.searchByRange(x, x, bounds.top, bounds.bottom)

      for (const match of matches) {
        collisions.push(match)
      }
    }
    return collisions
  }

  checkY(entity: Entity): Array<TileResolverMatch> {
    let y
    const vel = getComponent(entity, ComponentName.VELOCITY)
    const bounds = getComponent(entity, ComponentName.BOUNDING_BOX)
    const collisions: Array<TileResolverMatch> = []
    if (vel.y > 0) {
      y = bounds.bottom
    } else if (vel.y < 0) {
      y = bounds.top
    } else {
      return collisions
    }

    for (const resolver of this.resolvers) {
      const matches = resolver.searchByRange(bounds.left, bounds.right, y, y)

      for (const match of matches) {
        collisions.push(match)
      }
    }
    return collisions
  }
}
