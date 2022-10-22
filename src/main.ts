import { loadEntities } from './entities'
import { GameContext } from './GameContext'
import { setupKeyboard } from './input'
import { createCollisionLayer } from './layers/collision'
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
import {Editor} from './entities/Editor'
import {createEditorLayer} from './layers/editor'

async function startGame(canvas: HTMLCanvasElement) {
  const videoContext = canvas.getContext('2d') || raise('Canvas not supported')

  // turning this off lets us save a lot of Math.floor calls when rendering
  videoContext.imageSmoothingEnabled = false

  const audioContext = new AudioContext()

  const [entityFactory, font] = await Promise.all([
    loadEntities(audioContext),
    loadFont(),
  ])

  const loadLevel = createLevelLoader(entityFactory)

  const sceneRunner = new SceneRunner()

  const mario = entityFactory.mario?.() || raise('where mario tho')
  makePlayer(mario, 'MARIO')

  const inputRouter = setupKeyboard(window)
  inputRouter.addReceiver(mario)

  const timer = new Timer()

  timer.update = function update(deltaTime) {
    if (!document.hasFocus()) return

    const gameContext: GameContext = {
      deltaTime,
      audioContext,
      entityFactory,
      videoContext,
    }

    sceneRunner.update(gameContext)
  }

  timer.start()

  const loadScreen = new Scene()
  loadScreen.comp.layers.push(createColorLayer('black'))
  loadScreen.comp.layers.push(createTextLayer(font, `LOADING ${name}...`))
  sceneRunner.addScene(loadScreen)
  sceneRunner.runNext()

  await new Promise((resolve) => setTimeout(resolve, 500))

  const level = await loadLevel('1-1')

  const playerProgressLayer = createPlayerProgressLayer(font, level)
  const dashboardLayer = createDashboardLayer(font, level)

  mario.pos.set(0, 0)
  mario.vel.set(0, 0)
  level.entities.add(mario)

  const playerEnv = createPlayerEnv(mario)
  level.entities.add(playerEnv)

  const waitScreen = new TimedScene()
  waitScreen.comp.layers.push(createColorLayer('black'))
  waitScreen.comp.layers.push(dashboardLayer)
  waitScreen.comp.layers.push(playerProgressLayer)
  sceneRunner.addScene(waitScreen)

  level.comp.layers.push(dashboardLayer)
  sceneRunner.addScene(level)

  sceneRunner.runNext()
}

async function startEditor(canvas: HTMLCanvasElement) {
  const videoContext = canvas.getContext('2d') || raise('Canvas not supported')

  // turning this off lets us save a lot of Math.floor calls when rendering
  videoContext.imageSmoothingEnabled = false

  const audioContext = new AudioContext()

  const [entityFactory, font] = await Promise.all([
    loadEntities(audioContext),
    loadFont(),
  ])

  const loadLevel = createLevelLoader(entityFactory)

  const sceneRunner = new SceneRunner()

  const timer = new Timer()

  timer.update = function update(deltaTime) {
    if (!document.hasFocus()) return

    const gameContext: GameContext = {
      deltaTime,
      audioContext,
      entityFactory,
      videoContext,
    }

    sceneRunner.update(gameContext)
  }

  timer.start()

  const level = await loadLevel('1-1')

  const editor = new Editor(level)

  const mario = entityFactory.mario?.() || raise('where mario tho')
  makePlayer(mario, 'MARIO')

  const inputRouter = setupKeyboard(window)

  inputRouter.addReceiver(mario)
  inputRouter.addReceiver(editor)

  const editorLayer = createEditorLayer(font, level)

  mario.pos.set(0, 0)
  mario.vel.set(0, 0)
  level.entities.add(mario)

  const playerEnv = createPlayerEnv(mario)
  level.entities.add(playerEnv)

  // TODO add hot key to toggle this
  // level.comp.layers.push(createCollisionLayer(level))

  level.comp.layers.push(editorLayer)
  sceneRunner.addScene(level)
  level.pause()

  sceneRunner.runNext()
}

const canvas = document.getElementById('screen')
if (canvas instanceof HTMLCanvasElement) {
  const path = location.pathname
  if(path === '/editor') {
    startEditor(canvas).catch(console.error)
  } else {
    startGame(canvas).catch(console.error)
  }
} else {
  console.warn('Canvas not found')
}
