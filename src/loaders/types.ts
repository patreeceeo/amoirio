export type LevelSpec = {
  spriteSheet: string
  musicSheet: string
  patternSheet: string
  patterns: LevelSpecPatterns
  layers: LevelSpecLayer[]
  entities: LevelSpecEntity[]
  triggers?: LevelSpecTrigger[]
}

export type LevelSpecLayer = {
  tiles: LevelSpecTile[]
}

export type LevelSpecEntity = {
  name: string
  pos: [number, number]
}

export type LevelSpecPatterns = {
  [name: string]: {
    tiles: LevelSpecTile[]
  }
}

export enum TileType {
  BRICK = 'bricks',
  COIN = 'coin',
  GROUND = 'ground',
  PLANT = 'plant',
}

export type LevelSpecTile = {
  type: TileType
  name?: string
  pattern?: string
  ranges: TileRange[]
}

export type LevelSpecTrigger = {
  type: string
  name: string
  pos: [number, number]
}

export type TileRange = number[]

export type SpriteSheetSpec = {
  imageURL: string
  tileW: number
  tileH: number
  tiles?: TileSpec[]
  frames?: FrameSpec[]
  animations?: AnimationSpec[]
}

export type TileSpec = {
  name: string
  index: [number, number]
}

export type FrameSpec = {
  name: string
  rect: [number, number, number, number]
}

export type AnimationSpec = {
  name: string
  frameLength: number
  frames: string[]
}
