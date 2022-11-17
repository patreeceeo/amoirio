import { loadEntities, EntityFactory } from './entities'
import { GameContext } from './GameContext'
import { createColorLayer } from './layers/color'
import { createDashboardLayer } from './layers/dashboard'
import { createPlayerProgressLayer } from './layers/player-progress'
import { createTextLayer } from './layers/text'
import { createLevelLoader } from './loaders/level'
import { createPlayerEnv, makePlayer } from './player'
import { raise } from './raise'
import { Scene } from './Scene'
import { SceneRunner } from './SceneRunner'
import { TimedScene } from './TimedScene'
import { Timer } from './Timer'
import { DeprecatedEntity } from './Entity'
import { Level } from './Level'
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
import { loadFont } from './loaders/font'
import { SpawnSystem } from './SpawnSystem'
import { ScoreKeeper } from './ScoreKeeper'

/** @deprecated */
function getVideoContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const videoContext = canvas.getContext('2d') || raise('Canvas not supported')

  // turning this off lets us save a lot of Math.floor calls when rendering
  videoContext.imageSmoothingEnabled = false

  return videoContext
}

function spawnMario(mario: DeprecatedEntity, level: Level) {
  mario.pos.set(220, 0)
  mario.vel.set(0, 0)
  level.entities.add(mario)
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
    if (world.bigMomemtTimer > 0) {
      world.bigMomemtTimer = Math.max(
        0,
        world.bigMomemtTimer - world.fixedDeltaSeconds,
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

  const audioContext = new AudioContext()

  const [entityFactory, font] = await Promise.all([
    loadEntities(audioContext),
    loadFont(),
  ])

  world.prefabs = entityFactory

  const loadLevel = createLevelLoader(entityFactory)

  const sceneRunner = new SceneRunner()

  // const [_, mario] = entityFactory.mario?.() || raise('where mario tho')
  // makePlayer(mario, 'MARIO')

  // const inputRouter = setupKeyboard(window)
  // inputRouter.addReceiver(mario)

  const loadScreen = new Scene()
  loadScreen.compositor.layers.push(createColorLayer('black'))
  loadScreen.compositor.layers.push(createTextLayer(font, `LOADING ${name}...`))
  sceneRunner.addScene(loadScreen)
  sceneRunner.runNext()

  await new Promise((resolve) => setTimeout(resolve, 500))

  const level = await loadLevel('1-1')

  const playerProgressLayer = createPlayerProgressLayer(font, level)
  const dashboardLayer = createDashboardLayer(font, level)

  // spawnMario(mario, level)

  const playerEnv = createPlayerEnv(mario)
  level.entities.add(playerEnv)

  const waitScreen = new TimedScene()
  waitScreen.compositor.layers.push(createColorLayer('black'))
  waitScreen.compositor.layers.push(dashboardLayer)
  waitScreen.compositor.layers.push(playerProgressLayer)
  sceneRunner.addScene(waitScreen)

  level.compositor.layers.push(dashboardLayer)
  sceneRunner.addScene(level)

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

async function startEditor(canvas: HTMLCanvasElement) {
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
  // const editor = new Editor(level, world)

  // const [_, mario] = entityFactory.mario?.() || raise('where mario tho')
  // makePlayer(mario, 'MARIO')

  // const [__, bullet] = entityFactory.goomba?.() || raise('where bullet tho')
  // bullet.pos.set(24, 12)

  // const inputRouter = setupKeyboard(window)

  // inputRouter.addReceiver(mario)
  // inputRouter.addReceiver(editor)

  // spawnMario(mario, level)

  // const playerEnv = createPlayerEnv(mario)
  // level.entities.add(playerEnv)

  // TODO add hot key to toggle this
  // level.comp.layers.push(createCollisionLayer(level))

  // level.compositor.layers.push(editorLayer)
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
  } else if (path === '/editor') {
    runTests()
    startEditor(canvas).catch(console.error)
  } else {
    startGame(canvas).catch(console.error)
  }
} else {
  console.warn('Canvas not found')
}
