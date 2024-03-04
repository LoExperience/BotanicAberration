import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import TreeSegment from './Classes/TreeSegment.js'
import LSystem from './Classes/LSystem.js'
import gsap from 'gsap'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.add( new THREE.GridHelper(10, 10, 0x00ff00, 0x4a4a4a) );

// Debug
const gui = new GUI()

// Starting to generate a new tree
const newTree = new LSystem('X', {'F': 'FF', 'X':'F+^[[X]&-X]&-/F[*&-*FX]+^X'}, 2, 0.5, 25)
const treeString = newTree.applyRules()
const treeSegments = newTree.generateTreePaths(treeString)
let treeSegmentsMeshes = []
treeSegments.forEach(element => {
    const newSegment = new TreeSegment(element[0], element[1], 5.0, 0.05, 10)
    newSegment.getMesh().visible = false // hide mesh before animation
    scene.add(newSegment.getMesh())
    treeSegmentsMeshes.push(newSegment)
});


// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Animate
const clock = new THREE.Clock()
let time = Date.now()

const animateSpeed = 0.05
let timeline = gsap.timeline()
timeline.pause()
treeSegmentsMeshes.forEach(element => {
        timeline.to(
            element.tubeMaterial.uniforms.uProgress, 
            {
                duration: animateSpeed, 
                value: 1.0, 
                onStart: () => {element.getMesh().visible = true} // make each segment visible as the animation starts
            }
        )
});

//adding animation controls to debug panel
let debugObj = {
    stopAnimation: () => {timeline.pause()},
    resumeAnimation: () => {timeline.resume()},
    resetAnimation: () => {timeline.restart()}
}
gui.add(debugObj, 'stopAnimation')
gui.add(debugObj, 'resumeAnimation')
gui.add(debugObj, 'resetAnimation')

const tick = () =>
{
    // const currentTime = Date.now()
    // const deltaTime = (currentTime - time) / 100
    // time = currentTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()