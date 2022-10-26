import {LevelEditor} from "../traits/LevelEditor"
import {Entity} from "../Entity"
import {Level} from "../Level"
import {World} from "../World"

export class Editor extends Entity {
  levelEditor: LevelEditor

  constructor(
    level: Level,
    world: World
  ) {
    super()
    this.levelEditor = this.addTrait(new LevelEditor(level, world))
  }
}
