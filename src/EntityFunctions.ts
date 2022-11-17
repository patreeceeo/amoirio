import { TileResolverMatrix } from './TileResolver'
import { raise } from './raise'
import { SpriteSheet } from './SpriteSheet'
import { Vec2 } from './math'
import { Dict, SpawnInfo } from './types'
import { AnimationCollection } from './AnimationFunctions'
import { Jump } from './traits/Jump'
import { Go } from './traits/Go'
import { BoundingBox } from './BoundingBox'
import { Player } from './traits/Player'
import { Solid } from './traits/Solid'
import { PendulumMove } from './traits/PendulumMove'
import { Killable } from './traits/Killable'
import { Stomper } from './traits/Stomper'
import { KoopaBehavior } from './entities/Koopa'
import { Spawner } from './Spawner'

export type Entity = number

export enum ComponentName {
  NAME = 'name',
  INPUT_RECEIVER = 'input_receiver',
  TILE_MATRIX = 'tile_matrix',
  SPRITE_SHEET = 'sprite_sheet',
  POSITION = 'position',
  VELOCITY = 'velocity',
  SIZE = 'size',
  ANIMATION = 'animation',
  JUMP = 'jump',
  GO = 'go',
  BOUNDING_BOX = 'bounding_box',
  PLAYER = 'player',
  PHYSICS = 'physics',
  SOLID = 'solid',
  PENDULUM_MOVE = 'pendulum_move',
  KILLABLE = 'killable',
  STOMPER = 'stomper',
  KOOPA_BEHAV = 'koopa_behav',
  SPAWN = 'spawn',
  SPAWNER = 'spawner',
  IS_A = 'is_a',
  IS_B = 'is_b',
}

type ComponentType = {
  [ComponentName.NAME]: string
  [ComponentName.INPUT_RECEIVER]: true
  [ComponentName.IS_A]: true
  [ComponentName.IS_B]: true
  [ComponentName.TILE_MATRIX]: TileResolverMatrix
  [ComponentName.SPRITE_SHEET]: SpriteSheet
  [ComponentName.SIZE]: Vec2
  [ComponentName.POSITION]: Vec2
  [ComponentName.VELOCITY]: Vec2
  [ComponentName.ANIMATION]: AnimationCollection
  [ComponentName.JUMP]: Jump
  [ComponentName.GO]: Go
  [ComponentName.BOUNDING_BOX]: BoundingBox
  [ComponentName.PLAYER]: Player
  [ComponentName.PHYSICS]: true
  [ComponentName.SOLID]: Solid
  [ComponentName.PENDULUM_MOVE]: PendulumMove
  [ComponentName.KILLABLE]: Killable
  [ComponentName.STOMPER]: Stomper
  [ComponentName.KOOPA_BEHAV]: KoopaBehavior
  [ComponentName.SPAWN]: SpawnInfo
  [ComponentName.SPAWNER]: Spawner
}

type ComponentData<
  EntityPlurality extends 'plural' | 'single',
  Name extends ComponentName
> = EntityPlurality extends 'plural'
  ? Array<ComponentType[Name]>
  : ComponentType[Name]

type ComponentDict<EntityPlurality extends 'plural' | 'single'> = {
  [key in ComponentName]?: ComponentData<EntityPlurality, key>
}

type SetOfArrays = ComponentDict<'plural'>

interface EnityComponentFlags {
  isNew: boolean
}

let _nextEntity = 0
const _entitySoA: SetOfArrays = {}
const _allEntities: Array<Entity> = []
const _flags: Dict<Array<EnityComponentFlags>> = {}

export function createEntity() {
  const created = _nextEntity
  _allEntities.push(created)
  _nextEntity++
  return created
}

export function isEntity(candidate: Entity) {
  return _allEntities.includes(candidate)
}

function clearObject(o: object) {
  for (const key of Object.getOwnPropertyNames(o)) {
    delete (o as any)[key]
  }
}
export function reset() {
  _allEntities.length = 0
  _nextEntity = 0
  clearObject(_entitySoA)
  clearFlags()
}

export function createNamedEntity(name: string) {
  const e = createEntity()
  addComponent(e, ComponentName.NAME, name)
  return e
}

function addComponent<Name extends ComponentName>(
  entity: Entity,
  name: Name,
  data: ComponentType[Name],
) {
  if (entity < 0) {
    return
  }
  if (data === undefined) {
    raise('No data provided for ' + name + ' component')
  }
  const soa = _entitySoA
  soa[name] = soa[name] || ([] as any)
  soa[name]![entity] = data as any

  _flags[name] = _flags[name] || []
  _flags[name]![entity] = { isNew: true }
}

// TODO wait until end of loop to actually remove?
function removeComponent(entity: Entity, name: ComponentName) {
  const typeData = _entitySoA[name]
  if (typeData !== undefined) {
    delete typeData[entity]
  }
}

export function updateEntity(
  entity: Entity,
  addOrUpdate: ComponentDict<'single'>,
  remove: Array<ComponentName> = [],
) {
  for (let name in addOrUpdate) {
    addComponent(
      entity,
      name as ComponentName,
      addOrUpdate[name as ComponentName]!,
    )
  }
  for (let name of remove) {
    removeComponent(entity, name as ComponentName)
  }
}

export function deleteEntity(entity: Entity) {
  const index = _allEntities.indexOf(entity)
  _allEntities.splice(index, 1)
}

export function hasNewComponent<Name extends ComponentName>(
  entity: Entity,
  name: Name,
): boolean {
  const has = hasComponent(entity, name)
  if (entity < 0) return false
  if (has && _flags[name]![entity].isNew) return true
  return false
}

export function hasComponent(entity: Entity, name: ComponentName) {
  const soa = _entitySoA
  return soa[name] !== undefined && soa[name]![entity] !== undefined
}

export function checkComponent(entity: Entity, name: ComponentName) {
  if (!hasComponent(entity, name)) {
    const entityName = getComponent(entity, ComponentName.NAME)
    raise(
      `CHECK FAILED: ${entityName}(${entity}) entity does not have a ${name} component`,
    )
  }
}

export function getComponent<Name extends ComponentName>(
  entity: Entity,
  name: Name,
): ComponentType[Name] {
  const soa = _entitySoA
  return soa[name]![entity]! as any
}

export function queryAll(): ReadonlyArray<Entity> {
  return _allEntities
}

export function query(names: Array<ComponentName>) {
  const [set1, ...rest] = names.map((name) =>
    _allEntities.filter((e) => hasComponent(e, name)),
  )
  let intersection = set1
  for (let set of rest) {
    intersection = intersection.filter((e) => set.includes(e))
  }
  return intersection
}

export function clearFlags() {
  for (let name in _flags) {
    const component = _flags[name]
    for (let entity of component || []) {
      if (entity !== undefined) entity.isNew = false
    }
  }
}
