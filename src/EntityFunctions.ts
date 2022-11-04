import { TileResolverMatrix } from './TileResolver'
import { raise } from './raise'
import { SpriteSheet } from './SpriteSheet'
import { Vec2 } from './math'
import { Dict } from './types'
import { Animation } from './AnimationFunctions'
import { Jump } from './traits/Jump'
import { Go } from './traits/Go'

export type Entity = number

export enum ComponentName {
  TILE_MATRIX = 'tile_matrix',
  SPRITE_SHEET = 'sprite_sheet',
  POSITION = 'position',
  VELOCITY = 'velocity',
  SIZE = 'size',
  ANIMATION = 'animation',
  JUMP = 'jump',
  GO = 'go',
}

type ComponentType = {
  [ComponentName.TILE_MATRIX]: TileResolverMatrix
  [ComponentName.SPRITE_SHEET]: SpriteSheet
  [ComponentName.SIZE]: Vec2
  [ComponentName.POSITION]: Vec2
  [ComponentName.VELOCITY]: Vec2
  [ComponentName.ANIMATION]: Animation
  [ComponentName.JUMP]: Jump
  [ComponentName.GO]: Go
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

  console.log('Adding ' + name + ' component to ' + entity)
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
    raise(
      'CHECK FAILED: entity ' +
        entity +
        ' does not have a ' +
        name +
        ' component',
    )
  }
}

export function getComponent<Name extends ComponentName>(
  entity: Entity,
  name: Name,
): ComponentType[Name] {
  const soa = _entitySoA
  if (soa[name] === undefined || soa[name]![entity] === undefined) {
    checkComponent(entity, name)
  }
  return soa[name]![entity]! as any
}

export function queryAll(): ReadonlyArray<Entity> {
  return _allEntities
}

export function clearFlags() {
  for (let name in _flags) {
    const component = _flags[name]
    for (let entity of component || []) {
      if (entity !== undefined) entity.isNew = false
    }
  }
}
