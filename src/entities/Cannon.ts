import { EntityFactoryDict } from '../entities'
import { Entity } from '../Entity'
import { Level } from '../Level'
import { loadAudioBoard } from '../loaders/audio'
import { findPlayers } from '../player'
import { Emitter } from '../traits/Emitter'

const HOLD_FIRE_THRESHOLD = 30

export async function loadCannon(
  audioContext: AudioContext,
  entityFactory: EntityFactoryDict,
) {
  const audio = await loadAudioBoard('cannon', audioContext)

  function emitBullet(cannon: Entity, level: Level) {
    for (const player of findPlayers(level)) {
      if (Math.abs(player.pos.x - cannon.pos.x) <= HOLD_FIRE_THRESHOLD) {
        return
      }
    }

    const bullet = entityFactory.bullet?.()
    if (!bullet) return

    bullet.pos.copy(cannon.pos)
    level.entities.add(bullet)
    cannon.sounds.add('shoot')
  }

  return function createCannon() {
    const cannon = new Entity()
    cannon.audio = audio

    const emitter = cannon.addTrait(new Emitter())
    emitter.interval = 4
    emitter.emitters.push(emitBullet)

    return cannon
  }
}
