import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import Sun from './Sun.js'
import Floor from './Floor.js'

export default class Start{

    constructor()
    {
        //set up scene and canvas
        this.canvas = document.querySelector('canvas.webgl')
        this.scene = this.setUpScene()

        //set up debug panel
        this.debugPanel = new GUI()
        this.setUpDebug()

        //set up resizing
        this.sizes ={     
            width: window.innerWidth,
            height: window.innerHeight
        }
        this.setUpResize()

        //set up camera & controls
        this.camera
        this.setUpCamera()
        this.controls = this.setUpConstrols()

        //set up renderer
        this.renderer
        this.startRenderer()
        this.setUpEnv()
        
    }

    setUpScene(){
        const scene = new THREE.Scene()
        scene.add( new THREE.GridHelper(10, 10, 0x00ff00, 0x4a4a4a) );
        window.scene = scene
        return scene
    }

    setUpResize(){
        window.addEventListener('resize', () =>
        {
            // Update sizes
            this.sizes.width = window.innerWidth
            this.sizes.height = window.innerHeight

            // Update camera
            this.camera.aspect = this.sizes.width / this.sizes.height
            this.camera.updateProjectionMatrix()
            
            // Update renderer
            this.renderer.setSize(this.sizes.width, this.sizes.height)
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        })
    }

    setUpCamera(){
        this.camera = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 500)
        this.camera .position.z = 3
        this.camera .position.y = 2
        this.camera.lookAt(this.scene.position)
        scene.add(this.camera )
        window.camera = this.camera 
    }

    setUpConstrols(){
        // Controls
        const controls = new OrbitControls(this.camera, this.canvas)
        controls.enableDamping = true
        // controls.enableRotate = false;  
        return controls
    }

    startRenderer(){
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            powerPreference: "high-performance"
        })
        
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.shadowMap.autoUpdate = true
        this.renderer.shadowMap.needsUpdate = true;


        let cameraAngle = 0;
        const clock = new THREE.Clock()
        let oldElapsedTime = 0

        const tick = () =>
        {
            // Delta time
            const elapsedTime = clock.getElapsedTime()
            const deltaTime = elapsedTime - oldElapsedTime
            oldElapsedTime = elapsedTime

            //Update Camera            
            let radius = 4
            let rotationSpeed = (1 * deltaTime) * 0.2 
            let center = new THREE.Vector3(0, 2, 0) 

            if (window.topSegment){
                radius = Math.max(Math.max(Math.abs(window.topSegment.x), Math.abs(window.topSegment.z)) * 11, 3)
                rotationSpeed = (1 * deltaTime) * 0.2
                center.y += Math.max(Math.abs(window.topSegment.y * 1), 3)
            }

            // Update in animation loop
            cameraAngle += rotationSpeed;
            const cameraX = THREE.MathUtils.lerp(this.camera.position.x, center.x + radius * Math.cos(cameraAngle), 0.05)
            const cameraZ = THREE.MathUtils.lerp(this.camera.position.z, center.z + radius * Math.sin(cameraAngle), 0.05)
            const cameraY = THREE.MathUtils.lerp(this.camera.position.y, center.y, 0.05)
            this.camera.position.set(cameraX, cameraY, cameraZ);
            this.controls.update()

            // Render
            this.renderer.render(this.scene, this.camera)
        
            // Call tick again on the next frame
            window.requestAnimationFrame(tick)
        }

        tick()
    }

    setUpEnv(){
        // floor
        const floor = new Floor()


        // Lights

        // Directional Light
        const directionalLight = new THREE.DirectionalLight('#ffffff', 0)
        directionalLight.castShadow = true
        directionalLight.shadow.camera.far = 15
        directionalLight.shadow.mapSize.set(1024, 1024)
        directionalLight.shadow.normalBias = 0.05
        directionalLight.position.set(3.5, 2, - 1.25)

        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1, 0xFFFFFF)
        this.scene.add(directionalLight, directionalLightHelper)

        const debugLights = this.debugPanel.addFolder('Lights')
        debugLights.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('dir intensity')
        debugLights.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001).name('dir pos x')
        debugLights.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001).name('dir pos y')
        debugLights.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001).name('dir pos z')

        // Ambient Light
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 2.0)
        this.scene.add(ambientLight)
        debugLights.add(ambientLight, 'intensity').min(0).max(15).step(0.1).name('ambient intensity')

        let sun = new Sun()


    }

    setUpDebug(){
        window.debugPanel = this.debugPanel
    }
}