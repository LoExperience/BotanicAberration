import TreeSegment from "./TreeSegment.js"
import LSystem from "./LSystem.js"
import gsap from "gsap"
import GUI from 'lil-gui'
import * as THREE from 'three'

export default class GameManager
{
    constructor()
    {
        this.scene = window.scene
        this.camera = window.camera
        this.score = 0.0
        this.pointsToSpend = 0.0
        this.itemState
        this.startTrackingItems()
        this.treeSegmentsMeshes = []
        this.debugPanel = new GUI()
        this.branchSize = 0.0
        this.multiplier = 10.0
        this.currentMusicTrack = null     
    }

    // loads music
    setUpAudio(track){
        const listener = new THREE.AudioListener()
        this.camera.add(listener)
        const sound = new THREE.Audio( listener )
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( track, function( buffer ) { 
            sound.setBuffer( buffer );
            sound.setLoop( false );
            sound.setVolume( 0.5 );
            sound.play();
        })
    }
    

    // calculate score
    calculateScore(){
        this.score = Math.round(this.treeSegmentsMeshes.length * this.branchSize * this.multiplier)
        this.pointsToSpend += this.score
    }

    // start animation for the tree
    animateTree(){
        const animateSpeed = 0.05
        let timeline = gsap.timeline({onComplete: () => {this.calculateScore()}})
        timeline.timeScale(0.1)
        timeline.pause()
        this.treeSegmentsMeshes.forEach(element => {
                timeline.to(
                    element.tubeMaterial.uniforms.uProgress, 
                    {
                        duration: animateSpeed, 
                        value: 1.0, 
                        onStart: () => {element.getMesh().visible = true} // make each segment visible as the animation starts
                    }
                )
        })
        
        // Adding to debug panel
        this.debugAnimationObject = {
            stopAnimation: () => {timeline.pause()},
            playAnimation: () => {
                timeline.resume()
                if(this.currentMusicTrack) {this.setUpAudio(this.currentMusicTrack)}
            },
            resetAnimation: () => {timeline.restart()},
            animationSpeed: 1.00
        }
        this.debugPanel.add(this.debugAnimationObject, 'stopAnimation')
        this.debugPanel.add(this.debugAnimationObject, 'playAnimation')
        this.debugPanel.add(this.debugAnimationObject, 'resetAnimation')
        this.debugPanel.add(this.debugAnimationObject, 'animationSpeed').min(0).max(5.0).step(0.1).onFinishChange(
            () => timeline.timeScale(this.debugAnimationObject.animationSpeed)
        )
    }

    // generate a tree based on rules defined by user items
    generateTree(lSystem, branchSize, branchDimensions){
        this.branchSize = branchSize
        const newTree = lSystem
        const treeString = newTree.applyRules()
        const treeSegments = newTree.generateTreePaths(treeString)
        treeSegments.forEach(element => {
            const newSegment = new TreeSegment(element[0], element[1], 5.0, branchSize, branchDimensions)
            newSegment.getMesh().visible = false // hide mesh before animation
            this.scene.add(newSegment.getMesh())
            this.treeSegmentsMeshes.push(newSegment)
        });
    }

    
    // adds event listeners for each of the slot and act accordingly
    activateMenu(){
        const slots = document.querySelectorAll('.slot') //get all slots
        let activeCount
        let clearButton

        // behavior of inventory
        slots.forEach(slot => { //for each slot check if the state is locked before replacing image
            slot.addEventListener('click', (value) => {
                const slotNumber = slot.classList[1]
                if (this.itemState[slotNumber]['state'] == 'locked'){
                    // unlock it and change image
                    this.itemState[slotNumber]['state'] = 'unlocked'
                    const imageElement = document.querySelector('.' + slotNumber).querySelector('img')
                    const newImage = this.itemState[slotNumber]['image']
                    imageElement.setAttribute('src', newImage)

                } else{ // it is unlocked
                    activeCount = document.querySelector('.' + slotNumber).querySelectorAll('span')[1]
                    clearButton = document.querySelector('.' + slotNumber).querySelectorAll('span')[2]

                    if(['slot_1', 'slot_2'].includes(slotNumber)){
                        if(activeCount.textContent === ''){
                            document.querySelector('.slot_1').querySelectorAll('span')[1].textContent = ''
                            document.querySelector('.slot_2').querySelectorAll('span')[1].textContent = ''
                            activeCount.removeAttribute('hidden')
                            activeCount.textContent = 'ON'
                        } else {
                            activeCount.setAttribute('hidden', true)
                            activeCount.textContent = ''
                        }
                    }
                    else if(['slot_3', 'slot_4', 'slot_5'].includes(slotNumber)){
                        if(activeCount.textContent === ''){
                            document.querySelector('.slot_3').querySelectorAll('span')[1].textContent = ''
                            document.querySelector('.slot_4').querySelectorAll('span')[1].textContent = ''
                            document.querySelector('.slot_5').querySelectorAll('span')[1].textContent = ''
                            activeCount.removeAttribute('hidden')
                            activeCount.textContent = 'ON'
                            slotNumber == 'slot_3' ? this.currentMusicTrack = this.getMusic('classical') : null
                            slotNumber == 'slot_4' ? this.currentMusicTrack = this.getMusic('jazz') : null
                            slotNumber == 'slot_5' ? this.currentMusicTrack = this.getMusic('spa') : null

                        } else {
                            activeCount.setAttribute('hidden', true)
                            this.currentMusicTrack = null
                            activeCount.textContent = ''
                        }
                    }
                    else{
                        if(activeCount.textContent === ''){
                            activeCount.textContent = 1
                            activeCount.removeAttribute('hidden')
                            clearButton.removeAttribute('hidden')
                        } else{
                            activeCount.textContent = Number(activeCount.textContent) + 1
                        }
                    }
                }
                
            })
        })

        // behavior of clear buttons
        const clearButtons = document.querySelectorAll('.clear') //get all clear buttons
        clearButtons.forEach(button => { //for button check for clicks
            button.addEventListener('click', (event) => 
            {
                event.stopPropagation() // stops triggering the event listener on the div
                clearButton.setAttribute('hidden', true)
                activeCount.setAttribute('hidden', true)
                activeCount.textContent = ''
            })
        })
    }

    startTrackingItems()
    {
        this.itemState = {
            slot_1: {image:'./sun.svg', state: 'locked'}, // CC BY 3.0 https://game-icons.net/1x1/delapouite/sunrise.html
            slot_2: {image: './night.svg', state: 'locked'}, // CC BY 3.0 https://game-icons.net/1x1/delapouite/night-sleep.html
            slot_3: {image: './classical.svg', state: 'locked'}, // CC BY 3.0 https://game-icons.net/1x1/delapouite/classical-knowledge.html
            slot_4: {image: './jazz.svg', state: 'locked'}, // CC BY 3.0 https://game-icons.net/1x1/delapouite/saxophone.html
            slot_5: {image: './spa.svg', state: 'locked'}, // CC BY 3.0 https://game-icons.net/1x1/lorc/meditation.html
            slot_6: {image: './pollen.svg', state: 'locked'}, // CC BY 3.0 https://game-icons.net/1x1/lorc/pollen-dust.html
            slot_7: {image: './poo.svg', state: 'locked'}, // CC BY 3.0 https://game-icons.net/1x1/lorc/turd.html
            slot_8: {image: './booze.svg', state: 'locked'}, // CC BY 3.0 https://game-icons.net/1x1/lorc/martini.html
            locked: './question.svg' // CC BY 3.0 https://game-icons.net/1x1/delapouite/perspective-dice-six-faces-random.html
        }
    }

    getMusic(genre){
        const tracks = {
            classical: [
                './music/classic1.mp3', // CC BY 3.0 https://musopen.org/music/2491-two-arabesques-deux-arabesques-l-66/
                './music/classic2.mp3' // PDM 1.0 3.0 https://musopen.org/music/3998-cello-suite-no-1-in-g-major-bwv-1007/
            ],
            jazz: [
                './music/jazz1.mp3', // CC BY-NC-SA 3.0 https://freemusicarchive.org/music/Jazz_at_Mladost_Club/Jazz_Night
                './music/jazz2.mp3' // CC BY-NC-SA 3.0 https://freemusicarchive.org/music/till-paradiso/
            ],
            spa: [
                './music/spa1.mp3', // CC BY-NC-ND https://soundcloud.com/royaltyfreebackgroundmusic/creative-commons-music-2077
                './music/spa2.mp3' // CC BY-NC-ND https://soundcloud.com/royaltyfreebackgroundmusic/creative-commons-music-2067
            ]
        }
        
        return tracks[genre][[Math.floor(Math.random() * tracks[genre].length)]]

    }
}