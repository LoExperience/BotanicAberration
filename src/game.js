import GameManager from './Classes/GameManger.js'
import Start from './Classes/Start.js'




/**
 * Base
 */
const start = new Start()



// Fake loading screen
let loadingBar = document.getElementsByClassName('loading-bar')[0]
loadingBar.style.transform =`scaleX(1)`

loadingBar.addEventListener(
    'transitionend', 
    ()=>{
        const titleDiv = document.getElementsByClassName('titlePage')[0]
        titleDiv.style.display = 'none'
        const body = document.body
        body.style.visibility = 'visible'
    }
)

// Game Loop
const gameManager = new GameManager()
gameManager.activateMenu()


