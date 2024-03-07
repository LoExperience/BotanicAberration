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
const newTree = new LSystem('X', {'F': 'FF', 'X':'F+^[[X]&-X]&-/F[*&-*FX]+^[X*]'}, 2, 0.5, 25)
gameManager.generateTree(newTree, 0.07, 5)
gameManager.animateTree()


