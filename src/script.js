import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'


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

const v1 = new THREE.Vector3(5, 0, 5);
const v2 = new THREE.Vector3(-5, 0, -5);
const vControl = new THREE.Vector3(0, 5, 0);
const curve = new THREE.QuadraticBezierCurve3( v1, vControl, v2);
const v3Array = curve.getPoints(20);
const geometry = new THREE.BufferGeometry();
geometry.setFromPoints(v3Array);
const points = new THREE.Points(geometry, new THREE.PointsMaterial({color: 0xff0000, size: 0.25 }));
scene.add(points);

const tubeGeometry = new THREE.TubeGeometry(
    curve,
    20,
    0.5,
    8,
    false
)

const tubeMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00})
const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial)
scene.add(tubeMesh)

gui.add(vControl, 'y')
    .min(0)
    .max(10)
    .step(0.1)
    .name("Bezier Control")
    .onFinishChange((value) => {
        tubeMesh.geometry.dispose()
        tubeMesh.geometry = new THREE.TubeGeometry(
            curve,
            20,
            0.5,
            8,
            false
        )
    })

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