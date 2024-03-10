import TreeSegment from "./TreeSegment.js"
import LSystem from "./LSystem.js"
import gsap from "gsap"
import * as THREE from 'three'
import Sun from "./Sun.js"
import Moon from "./Moon.js"

export default class GameManager
{
    constructor()
    {
        this.scene = window.scene
        this.camera = window.camera
        this.pointsToSpend = 1000
        this.itemState
        this.startTrackingItems()
        this.treeSegmentsMeshes = []
        this.debugPanel = window.debugPanel
        this.branchSize = 0.0
        this.multiplier = 10.0
        this.drunkness = 0.0
        this.poo = 0.0
        this.pollen = 0.0
        this.currentMusicTrack = null  
        this.timeline
        this.max = new THREE.Vector3(0, 0, 0)
        this.sun
        this.moon
        this.playing = false
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
        let score = 0
        score = Math.round(this.treeSegmentsMeshes.length * this.branchSize * this.multiplier)
        this.pointsToSpend += score
        this.playing = false
    }

    // start animation for the tree
    animateTree(){
        const animateSpeed = 0.05
        this.timeline = gsap.timeline({onComplete: () => {
            this.calculateScore() 
            document.querySelector('.score').textContent = this.pointsToSpend
            this.playing = false
        }})
        this.timeline.timeScale(0.1)
        this.timeline.pause()
        this.treeSegmentsMeshes.forEach(element => {
                this.timeline.to(
                    element.tubeMaterial.uniforms.uProgress, 
                    {
                        duration: animateSpeed, 
                        value: 1.0, 
                        onStart: () => {
                            this.max = new THREE.Vector3(
                                Math.max(this.max.x, Math.abs(element.end.x)),
                                Math.max(this.max.y, Math.abs(element.end.y)),
                                Math.max(this.max.z, Math.abs(element.end.z))
                            )
                            window.topSegment = this.max
                            element.getMesh().visible = true
                        }, // make each segment visible as the animation starts
                    }
                )
        })
        
        // Adding to debug panel
        // this.debugAnimationObject = {
        //     stopAnimation: () => {this.timeline.pause()},
        //     playAnimation: () => {
        //         this.timeline.resume()
        //         if(this.currentMusicTrack) {this.setUpAudio(this.currentMusicTrack)}
        //     },
        //     resetAnimation: () => {this.timeline.restart()},
        //     animationSpeed: 1.00
        // }

        // const debugAnimation = this.debugPanel.addFolder('Animations')
        // debugAnimation.add(this.debugAnimationObject, 'stopAnimation')
        // debugAnimation.add(this.debugAnimationObject, 'playAnimation')
        // debugAnimation.add(this.debugAnimationObject, 'resetAnimation')
        // debugAnimation.add(this.debugAnimationObject, 'animationSpeed').min(0).max(5.0).step(0.1).onFinishChange(
        //     () => this.timeline.timeScale(this.debugAnimationObject.animationSpeed)
        // )

        return this.timeline
    }

    // generate a tree based on rules defined by user items
    generateTree(lSystem, branchSize, branchDimensions, drunkness){
        this.branchSize = branchSize
        const newTree = lSystem
        const treeString = newTree.applyRules()
        const treeSegments = newTree.generateTreePaths(treeString)
        treeSegments.forEach(element => {
            const newSegment = new TreeSegment(element[0], element[1], 10.0, branchSize, branchDimensions, drunkness)
            newSegment.getMesh().visible = false // hide mesh before animation
            this.scene.add(newSegment.getMesh())
            this.treeSegmentsMeshes.push(newSegment)
        });
    }

    
    // adds event listeners for each of the slot and act accordingly
    activateMenu(){
        // Play button

        const playButton = document.querySelector('.play')
        playButton.addEventListener(
            'click', 
            () => {
                if(!this.playing){
                        // lock ui
                        this.playing = true

                        // set music base on ui selection
                        if(this.currentMusicTrack) {this.setUpAudio(this.currentMusicTrack)}

                        // generate lsystem based on ui selection
                        const newTree = new LSystem('X', {'F': 'FFF', 'X':'F*X+^[[X]&-X]&-/F[*&-*FX]+^[X*]'}, 3, 0.25, 25, this.poo)

                        // generate tree based on lsystem
                        this.generateTree(newTree, 0.07, 5, this.drunkness)

                        // play animation 
                        this.animateTree()
                        this.timeline.resume()

                    }
                }
        )

        // Inventory system
        const slots = document.querySelectorAll('.slot') //get all slots
        let activeCount
        let clearButton
        
        slots.forEach(slot => { //for each slot check if the state is locked before replacing image
            slot.addEventListener('click', (value) => {
                if(!this.playing){
                    // id which slot is being pressed
                    const slotNumber = slot.classList[1]

                    // Locked behaviour
                    if (this.itemState[slotNumber]['state'] == 'locked'){

                        if(this.pointsToSpend >= this.itemState[slotNumber]['cost']){

                            // deduct costs from points
                            this.pointsToSpend -= this.itemState[slotNumber]['cost']
                            document.querySelector('.score').textContent = this.pointsToSpend

                            // unlock it and change image
                            this.itemState[slotNumber]['state'] = 'unlocked'
                            const imageElement = document.querySelector('.' + slotNumber).querySelector('img')
                            const newImage = this.itemState[slotNumber]['image']
                            imageElement.setAttribute('src', newImage)

                            // change description once it has been unlocked
                            const tooltipText = document.querySelector('.' + slotNumber).querySelector('span')
                            tooltipText.textContent = this.itemState[slotNumber]['description']
                        }
                    } else{ // it is unlocked
                        activeCount = document.querySelector('.' + slotNumber).querySelectorAll('span')[1]
                        clearButton = document.querySelector('.' + slotNumber).querySelectorAll('span')[2]

                        if(['slot_1', 'slot_2'].includes(slotNumber)){
                            if(activeCount.textContent === ''){
                                document.querySelector('.slot_1').querySelectorAll('span')[1].textContent = ''
                                document.querySelector('.slot_2').querySelectorAll('span')[1].textContent = ''
                                activeCount.removeAttribute('hidden')
                                activeCount.textContent = 'ON'
                                if(slotNumber == 'slot_1'){
                                    this.sun = new Sun()
                                    window.sun = this.sun
                                }else{
                                    this.moon = new Moon()
                                    window.moon = this.moon
                                }
                            } else {
                                if (slotNumber == 'slot_1'){
                                    activeCount.setAttribute('hidden', true)
                                    activeCount.textContent = ''
                                    this.sun.destroy()
                                }else{
                                    activeCount.setAttribute('hidden', true)
                                    activeCount.textContent = ''
                                    this.moon.destroy()
                                }
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
                                if(slotNumber == 'slot_6'){this.pollen = activeCount.textContent}
                                if(slotNumber == 'slot_7'){this.poo = activeCount.textContent}
                                if(slotNumber == 'slot_8'){this.drunkness = activeCount.textContent}
                            }
                        }
                    }
                }
            })
        })

        // behaviour of clear buttons
        const clearButtons = document.querySelectorAll('.clear') //get all clear buttons
        clearButtons.forEach(button => { //for button check for clicks
            button.addEventListener('click', (event) => 
            {
                // lock ui if playing
                if(!this.playing){
                    const slotNumber = activeCount.parentElement.classList[1]
                    event.stopPropagation() // stops triggering the event listener on the div
                    clearButton.setAttribute('hidden', true)
                    activeCount.setAttribute('hidden', true)
                    activeCount.textContent = ''
                    if(slotNumber == 'slot_6'){this.pollen = 0}
                    if(slotNumber == 'slot_7'){this.poo = 0}
                    if(slotNumber == 'slot_8'){this.drunkness = 0}
                }
            })
        })
    }

    startTrackingItems()
    {
        this.itemState = {
            slot_1: {
                image:'./sun.svg', // CC BY 3.0 https://game-icons.net/1x1/delapouite/sunrise.html
                state: 'locked',
                cost: 10,
                description: 'Discover the power of sunlight! [Free. Affects growth and color]'
            },    
            slot_2: {
                image: './night.svg', // CC BY 3.0 https://game-icons.net/1x1/delapouite/night-sleep.html
                state: 'locked',
                cost: 100,
                description: 'Some plants thrive better in the moonlight [Free. Affects growth and color]'                
            }, 
            slot_3: {
                image: './classical.svg', // CC BY 3.0 https://game-icons.net/1x1/delapouite/classical-knowledge.html
                state: 'locked',
                cost: 20,
                description: 'The soothing sound of pianos promotes harmony in growth [Free. Affects tree shape]'            
            }, 
            slot_4: {
                image: './jazz.svg', // CC BY 3.0 https://game-icons.net/1x1/delapouite/saxophone.html
                state: 'locked',
                cost: 20,
                description: 'Jazz encourages more improvisation! [Free. Affects tree shape]'            
            }, 
            slot_5: {
                image: './spa.svg', // CC BY 3.0 https://game-icons.net/1x1/lorc/meditation.html
                state: 'locked',
                cost: 20,
                description: 'Do trees know how to enjoy spa music? [Free. Affects tree shape]'            
            }, 
            slot_6: {
                image: './pollen.svg', // CC BY 3.0 https://game-icons.net/1x1/lorc/pollen-dust.html
                state: 'locked',
                cost: 20,
                description: 'Pollen enables sexual reproduction! [20pt each. Affects fruiting]'            
            }, 
            slot_7: {
                image: './poo.svg', // CC BY 3.0 https://game-icons.net/1x1/lorc/turd.html
                state: 'locked',
                cost: 20,
                description: 'Plant food! Very smelly though... [20pt each. Affects growth]'            
            }, 
            slot_8: {
                image: './booze.svg', // CC BY 3.0 https://game-icons.net/1x1/lorc/martini.html
                state: 'locked',
                cost: 20,
                description: 'Humans love alcohol so why not plants?'            
            }, 
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