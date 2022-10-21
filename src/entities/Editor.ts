import {LevelEditor} from "../traits/LevelEditor"
import {Entity} from "../Entity"
import {Level} from "../Level"

export class Editor extends Entity {
  levelEditor: LevelEditor

  constructor(
    level: Level
  ) {
    super()
    this.levelEditor = this.addTrait(new LevelEditor(level))
  }
}
