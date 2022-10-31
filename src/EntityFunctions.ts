import { TileResolverMatrix } from './TileResolver'
import { raise } from './raise'
import { SpriteSheet } from './SpriteSheet'
import { Vec2 } from './math'
import { Dict } from './types'

export type Entity = number

export enum ComponentName {
  TILE_MATRIX = 'tile_matrix',
  SPRITE_SHEET = 'sprite_sheet',
  POSITION = 'position',
  VELOCITY = 'velocity',
  SIZE = 'size',
  IS_KILLABLE = 'is_killable',
  IS_BULLET = 'is_bullet',
}

type ComponentType<
  Name extends ComponentName
> = Name extends ComponentName.TILE_MATRIX
  ? TileResolverMatrix
  : Name extends ComponentName.SPRITE_SHEET
  ? SpriteSheet
  : Name extends ComponentName.SIZE
  ? Vec2
  : Name extends ComponentName.POSITION
  ? Vec2
  : Name extends ComponentName.VELOCITY
  ? Vec2
  : true

type ComponentData<
  EntityPlurality extends 'plural' | 'single',
  Name extends ComponentName
> = EntityPlurality extends 'plural'
  ? Array<ComponentType<Name>>
  : ComponentType<Name>

interface ComponentDict<EntityPlurality extends 'plural' | 'single'> {
  [ComponentName.TILE_MATRIX]?: ComponentData<
    EntityPlurality,
    ComponentName.TILE_MATRIX
  >
  [ComponentName.SPRITE_SHEET]?: ComponentData<
    EntityPlurality,
    ComponentName.SPRITE_SHEET
  >
  [ComponentName.POSITION]?: ComponentData<
    EntityPlurality,
    ComponentName.POSITION
  >
  [ComponentName.VELOCITY]?: ComponentData<
    EntityPlurality,
    ComponentName.VELOCITY
  >
  [ComponentName.SIZE]?: ComponentData<EntityPlurality, ComponentName.SIZE>
  [ComponentName.IS_KILLABLE]?: ComponentData<
    EntityPlurality,
    ComponentName.IS_KILLABLE
  >
  [ComponentName.IS_BULLET]?: ComponentData<
    EntityPlurality,
    ComponentName.IS_BULLET
  >
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
  data: ComponentType<Name>,
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

export function getComponent<Name extends ComponentName>(
  entity: Entity,
  name: Name,
): ComponentType<Name> {
  const soa = _entitySoA
  if (soa[name] === undefined || soa[name]![entity] === undefined) {
    raise('No ' + name + ' component for entity ' + entity)
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
