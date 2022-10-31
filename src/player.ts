import { DeprecatedEntity } from './Entity'
import { Player } from './traits/Player'
import { PlayerController } from './traits/PlayerController'

export function createPlayerEnv(playerEntity: DeprecatedEntity) {
  const playerEnv = new DeprecatedEntity()
  const playerControl = new PlayerController(playerEntity)
  playerControl.checkpoint.set(64, 64)
  playerEnv.addTrait(playerControl)
  return playerEnv
}

export function* findPlayers(entities: Iterable<DeprecatedEntity>) {
  for (const entity of entities) {
    if (entity.getTrait(Player)) yield entity
  }
}

export function makePlayer(entity: DeprecatedEntity, name: string) {
  const player = new Player()
  player.name = name
  entity.addTrait(player)
}
