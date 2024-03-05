import TreeSegment from "./TreeSegment.js"
import LSystem from "./LSystem.js"
import gsap from "gsap"
import GUI from 'lil-gui'


export default class GameManager
{
    constructor(scene)
    {
        this.scene = scene
        this.score
        this.itemState
        this.startTrackingItems()
        this.treeSegmentsMeshes = []
        this.debugPanel = new GUI()

    }

    // start animation for the tree
    animateTree(){
        const animateSpeed = 0.05
        let timeline = gsap.timeline()
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
            resumeAnimation: () => {timeline.resume()},
            resetAnimation: () => {timeline.restart()}
        }
        this.debugPanel.add(this.debugAnimationObject, 'stopAnimation')
        this.debugPanel.add(this.debugAnimationObject, 'resumeAnimation')
        this.debugPanel.add(this.debugAnimationObject, 'resetAnimation')
    }

    // generate a tree based on rules defined by user items
    generateTree(){
        const newTree = new LSystem('X', {'F': 'FF', 'X':'F+^[[X]&-X]&-/F[*&-*FX]+^X'}, 2, 0.5, 25)
        const treeString = newTree.applyRules()
        const treeSegments = newTree.generateTreePaths(treeString)
        treeSegments.forEach(element => {
            const newSegment = new TreeSegment(element[0], element[1], 5.0, 0.05, 2)
            newSegment.getMesh().visible = false // hide mesh before animation
            this.scene.add(newSegment.getMesh())
            this.treeSegmentsMeshes.push(newSegment)
        });
    }

    
    // adds event listeners for each of the slot and act accordingly
    activateMenu(){
        const slots = document.querySelectorAll('.slot') //get all slots
        slots.forEach(slot => { //for each slot check if the state is locked before replacing image
            slot.addEventListener('click', (value) => {
                const slotNumber = slot.classList[1]
                if (this.itemState[slotNumber]['state'] == 'locked'){
                    this.itemState[slotNumber]['state'] = 'unlocked'
                    const imageElement = document.querySelector('.' + slot.classList[1]).querySelector('img')
                    const newImage = this.itemState[slotNumber]['image']
                    imageElement.setAttribute('src', newImage)
                }
            })
        })
    }

    startTrackingItems()
    {
        this.itemState = {
            slot_1: {image:'./sun.svg', state: 'locked'}, // CC BY 3.0 https://game-icons.net/1x1/delapouite/sunrise.html
            slot_2: {image: './night.svg', state: 'locked'}, // CC BY 3.0 https://game-icons.net/1x1/delapouite/night-sleep.html
            slot_3: {image: './booze.svg', state: 'locked'}, // CC BY 3.0 https://game-icons.net/1x1/lorc/martini.html
            slot_4: {image: './booze.svg', state: 'locked'}, // CC BY 3.0 https://game-icons.net/1x1/lorc/martini.html
            slot_5: {image: './booze.svg', state: 'locked'}, // CC BY 3.0 https://game-icons.net/1x1/lorc/martini.html
            slot_6: {image: './booze.svg', state: 'locked'}, // CC BY 3.0 https://game-icons.net/1x1/lorc/martini.html
            slot_7: {image: './booze.svg', state: 'locked'}, // CC BY 3.0 https://game-icons.net/1x1/lorc/martini.html
            slot_8: {image: './booze.svg', state: 'locked'}, // CC BY 3.0 https://game-icons.net/1x1/lorc/martini.html
            locked: './question.svg' // CC BY 3.0 https://game-icons.net/1x1/delapouite/perspective-dice-six-faces-random.html
        }

    }
}