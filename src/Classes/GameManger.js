import TreeSegment from "./TreeSegment.js"
import LSystem from "./LSystem.js"
import gsap from "gsap"
import * as THREE from 'three'
import Sun from "./Sun.js"
import Moon from "./Moon.js"
import Leaf from "./Leaf.js"

export default class GameManager
{
    constructor()
    {
        this.scene = window.scene
        this.camera = window.camera
        this.pointsToSpend = 0
        this.itemState
        this.startTrackingItems()
        this.treeSegmentsMeshes = []
        this.leafMeshes = 0
        this.debugPanel = window.debugPanel
        this.branchSize = 0.02
        this.multiplier = 10.0
        this.drunkness = 0.0
        this.poo = 0.0
        this.pollen = 0.0
        this.pollenColor = []
        this.currentMusicTrack = null  
        this.timeline
        this.max = new THREE.Vector3(0, 0, 0)
        this.sun
        this.moon
        this.playing = false
        this.sound
        this.genre = undefined
        this.palette = {
            'sun': [new THREE.Vector3(0.55, 0.274, 0.274),
                new THREE.Vector3(0, 1.0, 0)],
            'moon': [new THREE.Vector3(0.30, 0.15, 0.00),
                new THREE.Vector3(1.0, 0.87, 0.87)],
        }
        window.palette = this.palette
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
        this.scene.traverse((child) =>
                {
                    if(child.name == 'leaf')
                    {
                        this.leafMeshes += 1
                    }
                })
        score = Math.round((this.treeSegmentsMeshes.length + this.leafMeshes) * this.branchSize * this.multiplier)
        this.playing = false
        return score
    }

    // management of each round
    endRound(score){
        //add points
        this.pointsToSpend += score

        //clear sun and moon
        window.moon = undefined
        window.sun = undefined

        // clear pollen
        this.pollen = 0.0
        this.pollenColor = []
        
        // clear audio
        this.genre = undefined
        // insert some text to give user feedback / info
        let popUp = document.getElementById('message-div')
        if(score < 5){
            popUp.textContent = '[+' + score + ' Life Points.] You have managed to create life in this vast emptiness! It is small but it is a start! Evolution is random so try again for a different result! Save up life points (see top left) to unlock more wonders of the universe!'
        }else if(score >= 5 && score < 10){
            popUp.textContent = '[+' + score + ' Life Points] What a beauty! Some items can be stacked and their effects will accumulate. This can lead to some weird and wonderful plants!'
        }else if(score >= 10 && score < 15){
            popUp.textContent = '[+' + score + ' Life Points] Did you know different music can affect how life grows? Try out different music to see how this make your plant feel!'
        }else if(score >= 15){
            popUp.textContent = '[+' + score + ' Life Points] Looks liike you have gotten the hang of it! Keep going to see what wonderful liife you can bring to this world!'
        }
        popUp.textContent += ' Click this box to continue!'
        popUp.style.display = 'grid'
        
        // when the dialog box is closed, clear the old tree
        this.leafMeshes = 0
        popUp.addEventListener('click', () => 
            {  
                popUp.style.display = 'none' //hide text
                document.getElementsByClassName('play')[0].style.display = 'grid'
                document.getElementById('inventory').style.display = 'grid' //show inventory
                this.treeSegmentsMeshes.forEach(mesh => { //get rid of mesh and geomateries
                    if(mesh instanceof TreeSegment){
                        this.scene.remove(mesh.tubeMesh)
                        mesh.tubeGeometry.dispose()
                        mesh.tubeMaterial.dispose()
                        this.treeSegmentsMeshes = []
                    }
                })

                // get rid of leaves
                const leafToDelete = []
                this.scene.traverse((child) =>
                {
                    if(child.name == 'leaf')
                    {
                        child.geometry.dispose()
                        child.material.dispose()
                        leafToDelete.push(child)
                    }
                })
                leafToDelete.forEach(leaf => {this.scene.remove(leaf)})

                

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

                // unlock ui
                this.playing = false
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
            
        }})
        this.timeline.timeScale(0.1)
        this.timeline.pause()

        // generate colours

        this.pollenColor =[]

        for(let i = 0; i < Math.floor(this.pollen); i++){
            const newColor = new THREE.Color(Math.random(), Math.random(), Math.random())
            this.pollenColor.push(newColor)
        }

        //some convoluted logic because i didn't set up signals and now its too close to the deadline!
        let prevTree = []
        let leavesToSpawn =[]
        for( let i = 0; i < this.treeSegmentsMeshes.length; i++){
            if(this.treeSegmentsMeshes[i] instanceof TreeSegment){
                this.timeline.to(
                    this.treeSegmentsMeshes[i].tubeMaterial.uniforms.uProgress,
                        {
                            duration: animateSpeed, 
                            value: 1.0, 
                            onStart: () => {
                                this.max = new THREE.Vector3(
                                    Math.max(this.max.x, Math.abs(this.treeSegmentsMeshes[i].end.x)),
                                    Math.max(this.max.y, Math.abs(this.treeSegmentsMeshes[i].end.y)),
                                    Math.max(this.max.z, Math.abs(this.treeSegmentsMeshes[i].end.z))
                                )
                            window.topSegment = this.max
                            this.treeSegmentsMeshes[i].getMesh().visible = true
                            },
                            onComplete: () => {


                                    if(leavesToSpawn.length > 0 && prevTree.includes(i - 1)){
                                        
                                        const newLeaf = new Leaf(leavesToSpawn[prevTree.indexOf(i - 1)], this.poo, this.pollenColor)
                                    }
                                    else if(i == this.treeSegmentsMeshes.length - 1){
                                        if(leavesToSpawn.length > 0){
                                            const newLeaf = new Leaf(leavesToSpawn[-1], this.poo, this.pollenColor)
                                        }
                                    }
                                }
                        }
                )
            }else{
                prevTree.push(i)
                leavesToSpawn.push(this.treeSegmentsMeshes[i])
            }
        }
        // this.treeSegmentsMeshes.forEach(element => {
        //         if(element instanceof TreeSegment){
        //             this.timeline.to(
        //                 element.tubeMaterial.uniforms.uProgress, 
        //                 {
        //                     duration: animateSpeed, 
        //                     value: 1.0, 
        //                     onStart: () => {
        //                         this.max = new THREE.Vector3(
        //                             Math.max(this.max.x, Math.abs(element.end.x)),
        //                             Math.max(this.max.y, Math.abs(element.end.y)),
        //                             Math.max(this.max.z, Math.abs(element.end.z))
        //                         )
        //                         window.topSegment = this.max
        //                         element.getMesh().visible = true
        //                     }, // make each segment visible as the animation starts
        //                 }
        //             )
        //         }
        // })

        return this.timeline
    }

    // generate a tree based on rules defined by user items
    generateTree(lSystem, branchSize, branchDimensions, drunkness, pooAmount){
        this.branchSize = branchSize
        const newTree = lSystem
        const treeString = newTree.applyRules()
        const treeSegments = newTree.generateTreePaths(treeString)
        treeSegments.forEach(element => {
            if(element[0]=='LEAVES'){
                this.treeSegmentsMeshes.push(element[1])
            }
            else{
                const newSegment = new TreeSegment(element[0], element[1], 10.0, branchSize, branchDimensions, drunkness, this.poo)
                newSegment.getMesh().visible = false // hide mesh before animation
                this.scene.add(newSegment.getMesh())
                this.treeSegmentsMeshes.push(newSegment)
            }
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
                        document.getElementsByClassName('play')[0].style.display = 'none'

                        // set music base on ui selection
                        if(this.currentMusicTrack) {this.setUpAudio(this.currentMusicTrack)}

                        // generate lsystem based on ui selection
                        // const newTree = new LSystem('X', {'F': 'FFF', 'X':'F*X+^[[X]&-X]&-/F[*&-*FX]+^[X*]'}, 1, 0.25, 25, this.poo, this.sun, this.moon)
                        
                        
                        // No Music
                        const basicRules = 
                            {
                                'X': ['F[^X]F![&X]+X', 'F[^X]F[&X]+X','F[*X]F[/X]+X'],
                                'F': ['FF','+F-', '/F*F'],
                            }
                        // Classical Music
                        const classicRules = 
                            {
                                'F': ['F[*FF][/FF]F[&F][^F]F', 'F[*FF][&FF]F[/F][^F]F', 'F[&FF][/FF]F[^F][*F]F']
                            }
                        // Jazz Music
                        const JazzRules = 
                            {
                                'X': ['[*XFF]FF[^X]FF[&X]+X', '[/XFF]FF[^X]FF[&X]+X','[&XFF]FF[*X]FF[/X]+X'],
                                'F': ['FF','+F-', '/F*F']
                            }
                        
                        // Spa Music
                        const SpaRules = 
                        {
                            'F': ['-F[*FF][/FF]F[*F][/F]F', '+F[&FF][^FF]F[&F][^F]F','F[+FF][-FF]F[+F][-F]F', 'F[+FF][/FF]F[+F][/F]F', 'F[^FF][*FF]F[^F][*F]F']
                        }
                        
                        // length and angle depends on type
                        let rules = basicRules
                        let angle = 45
                        let length = 0.1
                        let startingChar = 'X'
                        if(this.genre == 'jazz'){
                            rules = JazzRules
                            length = 0.12
                        }
                        else if(this.genre == 'classical'){
                            rules = classicRules
                            startingChar = 'F'
                            length = 0.2
                        }
                        else if(this.genre == 'spa'){
                            rules = SpaRules
                            startingChar = 'F'
                        }

                        const newTree = new LSystem(startingChar, rules, 1, length, angle, this.poo, this.sun, this.moon)

                        // generate tree based on lsystem
                        //TODO branch size depending on type
                        
                        this.generateTree(newTree, this.branchSize, 3, this.drunkness, this.poo)

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
                                    console.log(this.pointsToSpend)
                                    if(this.pointsToSpend >= this.itemState[slotNumber]['useCost']){
                                        this.pointsToSpend -= this.itemState[slotNumber]['useCost']
                                    }
                                    document.querySelector('.score').textContent = this.pointsToSpend
                                }
                                if(slotNumber == 'slot_7'){
                                    this.poo = activeCount.textContent}
                                    if(this.pointsToSpend >= this.itemState[slotNumber]['useCost']){
                                        this.pointsToSpend -= this.itemState[slotNumber]['useCost']
                                    }
                                    this.pointsToSpend -= this.itemState[slotNumber]['useCost']
                                    document.querySelector('.score').textContent = this.pointsToSpend
                                if(slotNumber == 'slot_8'){
                                    this.drunkness = activeCount.textContent
                                    if(this.pointsToSpend >= this.itemState[slotNumber]['useCost']){
                                        this.pointsToSpend -= this.itemState[slotNumber]['useCost']
                                    }
                                    document.querySelector('.score').textContent = this.pointsToSpend
                                }
                            } else{
                                activeCount.textContent = Number(activeCount.textContent) + 1
                                if(slotNumber == 'slot_6'){
                                    this.pollen = activeCount.textContent
                                    if(this.pointsToSpend >= this.itemState[slotNumber]['useCost']){
                                        this.pointsToSpend -= this.itemState[slotNumber]['useCost']
                                    }
                                    document.querySelector('.score').textContent = this.pointsToSpend
                                }
                                if(slotNumber == 'slot_7'){
                                    this.poo = activeCount.textContent
                                    if(this.pointsToSpend >= this.itemState[slotNumber]['useCost']){
                                        this.pointsToSpend -= this.itemState[slotNumber]['useCost']
                                    } 
                                    document.querySelector('.score').textContent = this.pointsToSpend
                                }
                                if(slotNumber == 'slot_8'){
                                    this.drunkness = activeCount.textContent
                                    if(this.pointsToSpend >= this.itemState[slotNumber]['useCost']){
                                        this.pointsToSpend -= this.itemState[slotNumber]['useCost']
                                    }
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
                description: 'Discover the power of sunlight! [Free. Affects growth]'
            },    
            slot_2: {
                image: './night.svg', // CC BY 3.0 https://game-icons.net/1x1/delapouite/night-sleep.html
                state: 'locked',
                unlockCost: 50,
                description: 'Some plants thrive better in the moonlight [Free. Affects growth]'                
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
                description: 'Cross pollenation can lead to new characteristics! [10pt each. Affects leaf color]'            
            }, 
            slot_7: {
                image: './poo.svg', // CC BY 3.0 https://game-icons.net/1x1/lorc/turd.html
                state: 'locked',
                unlockCost: 10,
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
        this.genre = genre
        const tracks = {
            classical: [
                './music/melody/Presto.mp3', // CC BY 3.0 https://musopen.org/music/3935-violin-sonata-in-g-minor-bwv-1001/
                './music/melody/Ukuaru_valss_fur_Klavier.mp3', // PDM 1.0 https://musopen.org/music/43990-ukuaru-valss-fur-klavier/
                './music/melody/PianoSonatano_14_Moonlight.mp3', //PDM 1.0  https://musopen.org/music/2547-piano-sonata-no-14-in-c-sharp-minor-moonlight-sonata-op-27-no-2/
                './music/melody/Allemande.mp3' // PDM 1.0  https://musopen.org/music/30912-french-suite-no-1-in-d-minor-bwv-812/
            ],
            jazz: [
                './music/jazz/jazz2.mp3', // CC BY-NC-SA 3.0 https://freemusicarchive.org/music/till-paradiso/
                './music/jazz/joe-crotty-day-ahead.mp3', // CC BY 3.0 https://www.free-stock-music.com/joe-crotty-day-ahead.html
                './music/jazz/kevin-macleod-airport-lounge.mp3' // CC BY 4.0 https://www.free-stock-music.com/kevin-macleod-airport-lounge.html
            ],
            spa: [
                './music/spa/spa1.mp3', // CC BY-NC-ND https://soundcloud.com/royaltyfreebackgroundmusic/creative-commons-music-2077
                './music/spa/spa2.mp3', // CC BY-NC-ND https://soundcloud.com/royaltyfreebackgroundmusic/creative-commons-music-2067
                './music/spa/fsm-team-escp-komorebi.mp3' // CC BY 4.0 https://www.free-stock-music.com/fsm-team-escp-komorebi.html
            ]
        }
        
        return tracks[genre][[Math.floor(Math.random() * tracks[genre].length)]]

    }
}