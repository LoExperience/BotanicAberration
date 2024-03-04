import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import TreeSegment from './Classes/TreeSegment.js'
import LSystem from './Classes/LSystem.js'



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


// Test Branch
// const v1 = new THREE.Vector3(5, 0, 5);
// const v2 = new THREE.Vector3(-5, 0, -5);
// const vControl = new THREE.Vector3(0, 0, 0);
// const treeSegment = new TreeSegment(v1, v2,  20, 0.5 , 8)
// scene.add(treeSegment.getMesh())

// const boxGeo = new THREE.BoxGeometry(1,1,1)
// const boxMat = new THREE.MeshBasicMaterial({color: 0x00ff00})
// const boxMesh = new THREE.Mesh(boxGeo, boxMat)
// boxMesh.rotateX(45)
// scene.add(boxMesh)

// Starting to generate a new tree
const newTree = new LSystem('X', {'F': 'FF', 'X':'F+^[[X]&-X]&-F[&-FX]+^X'}, 3, 0.1, 40)
const treeString = newTree.applyRules()
const treeSegments = newTree.generateTreePaths(treeString)
treeSegments.forEach(element => {
    const newSegment = new TreeSegment(element[0], element[1], 3, 0.01 , 3)
    scene.add(newSegment.getMesh())
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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
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

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()