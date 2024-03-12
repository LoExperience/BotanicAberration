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
        this.branchSize = 0.02
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
        this.sound
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
        this.sound = sound
    }

    // calculate score
    calculateScore(){
        let score = 0
        score = Math.round(this.treeSegmentsMeshes.length * this.branchSize * this.multiplier)
        this.playing = false
        return score
    }

    // management of each round
    endRound(score){
        // insert some text to give user feedback / info
        let popUp = document.getElementById('message-div')
        if(score < 5){
            popUp.textContent = '[+' + score + ' Life Points.] You have managed to create life in this vast emptiness! It is small but it is a start! Save up life points (see top left) to unlock more wonders of the universe!'
        }else if(score >= 5){
            popUp.textContent = '[+' + score + ' Life Points] What a beauty! Some items can be stacked and their effects will accumulate. This can lead to some weird and wonderful plants!'
        }
        popUp.textContent += ' Click this box to continue!'
        popUp.style.display = 'grid'

        // when the dialog box is closed, clear the old tree
        popUp.addEventListener('click', () => 
            {  
                popUp.style.display = 'none' //hide text
                document.getElementById('inventory').style.display = 'grid' //show inventory
                this.treeSegmentsMeshes.forEach(mesh => { //get rid of mesh and geomateries
                    this.scene.remove(mesh.tubeMesh)
                    mesh.tubeGeometry.dispose()
                    mesh.tubeMaterial.dispose()
                    this.treeSegmentsMeshes = []
                })

                // clear applied items
                const allItems = document.querySelectorAll('.count')
                allItems.forEach(element => {
                    element.textContent = ''
                });

                const clearButtons = document.querySelectorAll('.clear')
                clearButtons.forEach(element => {
                    element.setAttribute('hidden', true)
                });

                const count = document.querySelectorAll('.count')
                count.forEach(element => {
                    element.setAttribute('hidden', true)
                });

                //todo stop music
                this.currentMusicTrack = undefined
                if(this.sound){this.sound.stop()}

                //todo reset sun and moon position
                window.topSegment = undefined
                if(this.sun){this.sun.destroy()}
                if(this.moon){this.moon.destroy()}
            }
        )
        
    }


    // start animation for the tree
    animateTree(){
        const animateSpeed = 0.05
        this.timeline = gsap.timeline({onComplete: () => {
            const pointsEarned = this.calculateScore() 
            document.querySelector('.score').textContent = this.pointsToSpend + pointsEarned
            
            this.endRound(pointsEarned)
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

        return this.timeline
    }

    // generate a tree based on rules defined by user items
    generateTree(lSystem, branchSize, branchDimensions, drunkness, pooAmount){
        this.branchSize = branchSize
        const newTree = lSystem
        const treeString = newTree.applyRules()
        const treeSegments = newTree.generateTreePaths(treeString)
        treeSegments.forEach(element => {
            const newSegment = new TreeSegment(element[0], element[1], 10.0, branchSize, branchDimensions, drunkness, this.poo)
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
                        document.getElementById('inventory').style.display = 'none'

                        // set music base on ui selection
                        if(this.currentMusicTrack) {this.setUpAudio(this.currentMusicTrack)}

                        // generate lsystem based on ui selection
                        // const newTree = new LSystem('X', {'F': 'FFF', 'X':'F*X+^[[X]&-X]&-/F[*&-*FX]+^[X*]'}, 1, 0.25, 25, this.poo, this.sun, this.moon)
                        
                        
                        // Classical Music
                        const classicRules = 
                            {
                                'X': ['F[X]Y', 'FF', 'F[F]Y', 'F[Y]X' ],
                                'F': ['FF', 'F[Y]X', 'Y[Y]X', 'FYF'],
                                'Y': ['/F&F', '/F*F', '&F*F', '^F*F', '^F/F', '*F*F', '/F/F', '&F&F', '^F^F', '/Y[X]']
                            }
                        // Jazz Music
                        const JazzRules = 
                            {
                                'X': ['[^F^Y][/Y*F]&Y^F'],
                                'F': ['FF', 'F[Y]X', 'Y[Y]X', 'FYF'],
                                'Y': ['/F&F', '/F*F', '&F*F', '^F*F', '^F/F', '*F*F', '/F/F', '&F&F', '^F^F', '/Y[X]']
                            }

                        const newTree = new LSystem('X', JazzRules, 2, 0.10, 25, this.poo, this.sun, this.moon)

                        // generate tree based on lsystem
                        this.generateTree(newTree, this.branchSize, 10, this.drunkness, this.poo)

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

                        if(this.pointsToSpend >= this.itemState[slotNumber]['unlockCost']){

                            // deduct unlockCosts from points
                            this.pointsToSpend -= this.itemState[slotNumber]['unlockCost']
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
                                if(slotNumber == 'slot_6'){
                                    this.pollen = activeCount.textContent
                                    this.pointsToSpend -= this.itemState[slotNumber]['useCost']
                                    document.querySelector('.score').textContent = this.pointsToSpend
                                }
                                if(slotNumber == 'slot_7'){
                                    this.poo = activeCount.textContent}
                                    this.pointsToSpend -= this.itemState[slotNumber]['useCost']
                                    document.querySelector('.score').textContent = this.pointsToSpend
                                if(slotNumber == 'slot_8'){
                                    this.drunkness = activeCount.textContent
                                    this.pointsToSpend -= this.itemState[slotNumber]['useCost']
                                    document.querySelector('.score').textContent = this.pointsToSpend
                                }
                            } else{
                                activeCount.textContent = Number(activeCount.textContent) + 1
                                if(slotNumber == 'slot_6'){
                                    this.pollen = activeCount.textContent
                                    this.pointsToSpend -= this.itemState[slotNumber]['useCost'] 
                                    document.querySelector('.score').textContent = this.pointsToSpend
                                }
                                if(slotNumber == 'slot_7'){
                                    this.poo = activeCount.textContent
                                    this.pointsToSpend -= this.itemState[slotNumber]['useCost'] 
                                    document.querySelector('.score').textContent = this.pointsToSpend
                                }
                                if(slotNumber == 'slot_8'){
                                    this.drunkness = activeCount.textContent
                                    this.pointsToSpend -= this.itemState[slotNumber]['useCost'] 
                                    document.querySelector('.score').textContent = this.pointsToSpend
                                }
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
                    if(slotNumber == 'slot_7'){
                        this.pointsToSpend += this.itemState[slotNumber]['useCost'] * this.poo
                        this.poo = 0
                        document.querySelector('.score').textContent = this.pointsToSpend

                    }
                    if(slotNumber == 'slot_6'){
                        this.pointsToSpend += this.itemState[slotNumber]['useCost'] * this.pollen
                        this.pollen = 0
                        document.querySelector('.score').textContent = this.pointsToSpend

                    }
                    if(slotNumber == 'slot_8'){
                        this.pointsToSpend += this.itemState[slotNumber]['useCost'] * this.drunkness
                        this.drunkness = 0
                        document.querySelector('.score').textContent = this.pointsToSpend

                    }
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
                unlockCost: 1,
                description: 'Discover the power of sunlight! [Free. Affects growth and color]'
            },    
            slot_2: {
                image: './night.svg', // CC BY 3.0 https://game-icons.net/1x1/delapouite/night-sleep.html
                state: 'locked',
                unlockCost: 50,
                description: 'Some plants thrive better in the moonlight [Free. Affects growth and color]'                
            }, 
            slot_3: {
                image: './classical.svg', // CC BY 3.0 https://game-icons.net/1x1/delapouite/classical-knowledge.html
                state: 'locked',
                unlockCost: 5,
                description: 'The soothing sound of melodies promote harmony in growth [Free. Affects tree shape]'            
            }, 
            slot_4: {
                image: './jazz.svg', // CC BY 3.0 https://game-icons.net/1x1/delapouite/saxophone.html
                state: 'locked',
                unlockCost: 25,
                description: 'Jazz encourages more improvisation! [Free. Affects tree shape]'            
            }, 
            slot_5: {
                image: './spa.svg', // CC BY 3.0 https://game-icons.net/1x1/lorc/meditation.html
                state: 'locked',
                unlockCost: 25,
                description: 'Do trees know how to enjoy spa music? [Free. Affects tree shape]'            
            }, 
            slot_6: {
                image: './pollen.svg', // CC BY 3.0 https://game-icons.net/1x1/lorc/pollen-dust.html
                state: 'locked',
                unlockCost: 10,
                useCost: 10,
                description: 'Pollen enables sexual reproduction! [10pt each. Affects fruiting]'            
            }, 
            slot_7: {
                image: './poo.svg', // CC BY 3.0 https://game-icons.net/1x1/lorc/turd.html
                state: 'locked',
                unlockCost: 5,
                useCost: 10,
                description: 'Plant food! Very smelly though... [10pt each. Affects growth]'            
            }, 
            slot_8: {
                image: './booze.svg', // CC BY 3.0 https://game-icons.net/1x1/lorc/martini.html
                state: 'locked',
                unlockCost: 10,
                useCost: 10,
                description: 'Humans love alcohol so why not plants? [10pt each. Affects ???]'            
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