// import { Animation } from '../animation'
import { AudioBoard } from '../AudioBoard'
import { DeprecatedEntity } from '../Entity'
import { loadAudioBoard } from '../loaders/audio'
import { loadSpriteSheet } from '../loaders/sprite'
import { SpriteSheet } from '../SpriteSheet'
import { Go } from '../traits/Go'
import { Jump } from '../traits/Jump'
import { Killable } from '../traits/Killable'
import { Physics } from '../traits/Physics'
import { Solid } from '../traits/Solid'
import { Stomper } from '../traits/Stomper'
import {
  Entity,
  updateEntity,
  ComponentName,
  createNamedEntity,
} from '../EntityFunctions'
import { AnimationCollectionName } from '../AnimationFunctions'

const FAST_DRAG = 1 / 5000
const SLOW_DRAG = 1 / 1000

export class Mario extends DeprecatedEntity {
  jump = this.addTrait(new Jump())
  go = this.addTrait(new Go())
  stomper = this.addTrait(new Stomper())
  killable = this.addTrait(new Killable())
  solid = this.addTrait(new Solid())
  physics = this.addTrait(new Physics())

  constructor(
    private sprites: SpriteSheet,
    public audio: AudioBoard, // private runAnimation: Animation,
  ) {
    super()

    this.size.set(14, 16)

    this.go.dragFactor = SLOW_DRAG
    this.killable.removeAfter = 0

    this.setTurboState(false)
  }

  // TODO
  resolveAnimationFrame() {
    if (this.jump.falling) {
      return 'jump'
    }

    if (this.go.distance > 0) {
      if (
        (this.vel.x > 0 && this.go.dir < 0) ||
        (this.vel.x < 0 && this.go.dir > 0)
      ) {
        return 'brake'
      }

      // return this.runAnimation(this.go.distance)
    }
    return 'idle'
  }

  draw(context: CanvasRenderingContext2D) {
    this.sprites.draw(
      this.resolveAnimationFrame(),
      context,
      0,
      0,
      this.go.heading < 0,
    )
  }

  setTurboState(turboState: boolean) {
    this.go.dragFactor = turboState ? FAST_DRAG : SLOW_DRAG
  }
}

export async function loadMario(audioContext: AudioContext) {
  const [sprites, audioBoard] = await Promise.all([
    loadSpriteSheet('mario'),
    loadAudioBoard('mario', audioContext),
  ])

  // const runAnimation = sprites.getAnimation('run')
  const animations = sprites.getAnimationCollection(
    AnimationCollectionName.MARIO,
  )

  return function createMario(): [Entity, DeprecatedEntity] {
    const de = new Mario(sprites, audioBoard) //, runAnimation)
    const entity = createNamedEntity('MARIO')

    updateEntity(entity, {
      [ComponentName.INPUT_RECEIVER]: true,
      [ComponentName.IS_A]: true,
      [ComponentName.SIZE]: de.size,
      [ComponentName.VELOCITY]: de.vel,
      [ComponentName.SPRITE_SHEET]: sprites,
      [ComponentName.ANIMATION]: animations,
      [ComponentName.POSITION]: de.pos,
      [ComponentName.JUMP]: de.jump,
      [ComponentName.GO]: de.go,
      [ComponentName.PHYSICS]: true,
      [ComponentName.BOUNDING_BOX]: de.bounds,
      [ComponentName.SOLID]: new Solid(),
      [ComponentName.KILLABLE]: new Killable(),
      [ComponentName.STOMPER]: new Stomper(),
    })

    return [entity, de]
  }
}
