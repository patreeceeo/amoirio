import { LevelEditor } from '../traits/LevelEditor'
import { DeprecatedEntity } from '../Entity'
import { Level } from '../Level'
import { World } from '../World'

export class Editor extends DeprecatedEntity {
  levelEditor: LevelEditor

  constructor(level: Level, world: World) {
    super()
    this.levelEditor = this.addTrait(new LevelEditor(level, world))
  }
}
