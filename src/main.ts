import { loadEntities, EntityFactory } from './entities'
import { GameContext } from './GameContext'
import { createLevelLoader } from './loaders/level'
import { raise } from './raise'
import { SceneRunner } from './SceneRunner'
import { Timer } from './Timer'
import { Dict } from './types'
import { World, WorldState } from './World'
import { AudioSystem } from './audio/AudioSystem'
import { runTests } from './test'
import { EventName } from './EventEmitter'
import { VideoSystem } from './video/VideoSystem'
import {
  clearFlags,
  createEntity,
  updateEntity,
  ComponentName,
} from './EntityFunctions'
import { TraitSystem } from './traits/TraitSystem'
import { InputSystem } from './input/InputSystem'
import { TimerSystem } from './TimerSystem'
import { SpawnSystem } from './SpawnSystem'
import { ScoreKeeper } from './ScoreKeeper'

/** @deprecated */
function getVideoContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const videoContext = canvas.getContext('2d') || raise('Canvas not supported')

  // turning this off lets us save a lot of Math.floor calls when rendering
  videoContext.imageSmoothingEnabled = false

  return videoContext
}

async function createLoop(
  videoContext: CanvasRenderingContext2D,
  audioContext: AudioContext,
  entityFactory: Dict<EntityFactory>,
  sceneRunner: SceneRunner,
  world: World,
): Promise<Timer> {
  const timer = new Timer()

  await SpawnSystem(world)
  await TimerSystem(world)
  await AudioSystem(world)
  await TraitSystem(world)
  await VideoSystem(world)
  await InputSystem(world)

  world.fixedDeltaSeconds = timer.deltaTimeTarget

  world.events.emit(EventName.WORLD_INIT)

  timer.onFixedStep = function update(deltaTime) {
    if (!document.hasFocus() || world.state === WorldState.PAUSE) return
    if (world.bigMomentTimer > 0) {
      world.bigMomentTimer = Math.max(
        0,
        world.bigMomentTimer - world.fixedDeltaSeconds,
      )
    }

    const gameContext: GameContext = {
      deltaTime,
      audioContext,
      entityFactory,
      videoContext,
      world,
    }

    world.fixedElapsedSeconds += deltaTime
    sceneRunner.update(gameContext)
    world.events.emit(EventName.WORLD_FIXED_STEP)
    clearFlags()
  }

  return timer
}

async function startGame(canvas: HTMLCanvasElement) {
  const world = new World()
  const videoContext = getVideoContext(canvas)

  // TODO should audioContext be instantiate in AudioSystem?
  const audioContext = new AudioContext()

  const entityFactory = await loadEntities(audioContext)
  world.prefabs = entityFactory

  const loadLevel = createLevelLoader(entityFactory)

  const sceneRunner = new SceneRunner()

  const level = await loadLevel('antario-1')

  const scoreKeeper = createEntity()
  updateEntity(scoreKeeper, {
    [ComponentName.SCORE]: new ScoreKeeper(),
  })
  sceneRunner.addScene(level)
  level.pause()

  sceneRunner.runNext()

  const loop = await createLoop(
    videoContext,
    audioContext,
    entityFactory,
    sceneRunner,
    world,
  )
  loop.start()
}

const canvas = document.getElementById('screen')
if (canvas instanceof HTMLCanvasElement) {
  const path = location.pathname
  if (path === '/test') {
    runTests()
  } else if (path === '/') {
    runTests()
    startGame(canvas).catch(console.error)
  }
} else {
  console.warn('Canvas not found')
}
