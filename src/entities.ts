import { loadBullet } from './entities/Bullet'
import { loadCannon } from './entities/Cannon'
import { loadGoomba } from './entities/Goomba'
import { loadKoopa } from './entities/Koopa'
import { loadMario } from './entities/Mario'
import { DeprecatedEntity } from './Entity'
import { Dict } from './types'
import { Entity } from './EntityFunctions'
import { loadBowser } from './entities/Bowser'
import { loadShroom } from './entities/Shroom'

export type EntityFactory = () => [Entity, DeprecatedEntity]

export type EntityFactoryDict = Dict<EntityFactory>

export async function loadEntities(
  audioContext: AudioContext,
): Promise<EntityFactoryDict> {
  const factories: EntityFactoryDict = {}

  const addAs = (name: string) => (factory: EntityFactory) => {
    factories[name] = factory
  }

  await Promise.all([
    loadMario(audioContext).then(addAs('mario')),
    loadGoomba().then(addAs('goomba')),
    loadKoopa().then(addAs('koopa')),
    loadBullet().then(addAs('bullet')),
    loadCannon(audioContext).then(addAs('cannon')),
    loadBowser(audioContext).then(addAs('bowser')),
    loadShroom(audioContext).then(addAs('shroom')),
  ])

  return factories
}
