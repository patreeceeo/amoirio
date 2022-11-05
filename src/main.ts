import { loadEntities, EntityFactory } from './entities'
import { GameContext } from './GameContext'
import { setupKeyboard } from './input'
import { createColorLayer } from './layers/color'
import { createDashboardLayer } from './layers/dashboard'
import { createPlayerProgressLayer } from './layers/player-progress'
import { createTextLayer } from './layers/text'
import { loadFont } from './loaders/font'
import { createLevelLoader } from './loaders/level'
import { createPlayerEnv, makePlayer } from './player'
import { raise } from './raise'
import { Scene } from './Scene'
import { SceneRunner } from './SceneRunner'
import { TimedScene } from './TimedScene'
import { Timer } from './Timer'
import { Editor } from './entities/Editor'
import { createEditorLayer } from './layers/editor'
import { DeprecatedEntity } from './Entity'
import { Level } from './Level'
import { Dict } from './types'
import { World } from './World'
import { AudioSystem } from './audio/AudioSystem'
import { runTests } from './test'
import { EventName } from './EventEmitter'
import { VideoSystem } from './video/VideoSystem'
import { clearFlags } from './EntityFunctions'
import { TraitSystem } from './traits/TraitSystem'

/** @deprecated */
function getVideoContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const videoContext = canvas.getContext('2d') || raise('Canvas not supported')

  // turning this off lets us save a lot of Math.floor calls when rendering
  videoContext.imageSmoothingEnabled = false

  return videoContext
}

function spawnMario(mario: DeprecatedEntity, level: Level) {
  mario.pos.set(0, 0)
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

  await AudioSystem(world)
  await VideoSystem(world)
  await TraitSystem(world)

  world.fixedDeltaSeconds = timer.deltaTimeTarget
  timer.onFixedStep = function update(deltaTime) {
    if (!document.hasFocus()) return

    const gameContext: GameContext = {
      deltaTime,
      audioContext,
      entityFactory,
      videoContext,
      world,
    }

    world.fixedElapsedSeconds = timer.accumulatedTime
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

  const loadLevel = createLevelLoader(entityFactory)

  const sceneRunner = new SceneRunner()

  const [_, mario] = entityFactory.mario?.() || raise('where mario tho')
  makePlayer(mario, 'MARIO')

  const inputRouter = setupKeyboard(window)
  inputRouter.addReceiver(mario)

  const loadScreen = new Scene()
  loadScreen.compositor.layers.push(createColorLayer('black'))
  loadScreen.compositor.layers.push(createTextLayer(font, `LOADING ${name}...`))
  sceneRunner.addScene(loadScreen)
  sceneRunner.runNext()

  await new Promise((resolve) => setTimeout(resolve, 500))

  const level = await loadLevel('1-1')

  const playerProgressLayer = createPlayerProgressLayer(font, level)
  const dashboardLayer = createDashboardLayer(font, level)

  spawnMario(mario, level)

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

  const [entityFactory, font] = await Promise.all([
    loadEntities(audioContext),
    loadFont(),
  ])

  const loadLevel = createLevelLoader(entityFactory)

  const sceneRunner = new SceneRunner()

  const level = await loadLevel('1-1')

  const editor = new Editor(level, world)

  const [_, mario] = entityFactory.mario?.() || raise('where mario tho')
  makePlayer(mario, 'MARIO')

  const [__, bullet] = entityFactory.goomba?.() || raise('where bullet tho')
  bullet.pos.set(24, 12)

  const inputRouter = setupKeyboard(window)

  inputRouter.addReceiver(mario)
  inputRouter.addReceiver(editor)

  const editorLayer = createEditorLayer(font, level)

  spawnMario(mario, level)

  const playerEnv = createPlayerEnv(mario)
  level.entities.add(playerEnv)

  // TODO add hot key to toggle this
  // level.comp.layers.push(createCollisionLayer(level))

  level.compositor.layers.push(editorLayer)
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
