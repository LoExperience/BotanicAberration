import GameManager from './Classes/GameManger.js'
import LSystem from './Classes/LSystem.js'
import Start from './Classes/Start.js'


/**
 * Base
 */
const start = new Start()

// Game Loop
const gameManager = new GameManager()
gameManager.activateMenu()

// Starting to generate a new tree
const newTree = new LSystem('X', {'F': 'FFF', 'X':'[F*X]+^[[X]&-X]&-/F[*&-*FX]+^[X*]'}, 3, 0.25, 25)
gameManager.generateTree(newTree, 0.07, 5)
gameManager.animateTree()


