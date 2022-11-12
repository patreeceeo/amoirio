import { TileColliderHandler } from '../TileCollider'
import { getComponent, ComponentName, hasComponent } from '../EntityFunctions'

const handle: TileColliderHandler = (entity, match) => {
  if (hasComponent(entity, ComponentName.PLAYER)) {
    const player = getComponent(entity, ComponentName.PLAYER)
    match.resolver.matrix.delete(match.indexX, match.indexY)
    player.addCoins(1)
  }
}

export const coin = [handle, handle]
