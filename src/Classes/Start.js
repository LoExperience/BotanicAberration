import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Floor from './Floor.js'

export default class Start{

    constructor()
    {
        //set up scene and canvas
        this.canvas = document.querySelector('canvas.webgl')
        this.scene = this.setUpScene()

        //set up debug panel
        // this.debugPanel = new GUI()
        // this.setUpDebug()

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
        this.welcome()
        
    }

    welcome(){
        // Welcome Message
        const welcomeContainer = document.getElementById('welcome-container');
        const closeButton = document.getElementById('close-welcome');

        // Function to show the popup
        function showWelcome() {
            welcomeContainer.style.display = 'flex'; 
        }

        // Function to hide the popup
        function hideWelcome() {
        welcomeContainer.style.display = 'none'
        const floor = new Floor()
        }

        // Event listener for close button
        welcomeContainer.addEventListener('click', hideWelcome);

        showWelcome()
    }

    setUpScene(){
        const scene = new THREE.Scene()
        // scene.add( new THREE.GridHelper(10, 10, 0x00ff00, 0x4a4a4a) );
        scene.background = new THREE.Color(0x000000);
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
        this.camera = new THREE.PerspectiveCamera(50, this.sizes.width / this.sizes.height, 0.1, 500)
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
            powerPreference: "high-performance",
            apha: true
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

            //update shader uniforms

            this.scene.traverse((child) =>
                {
                    if(child.name == 'leaf')
                    {
                        child.material.uniforms.u_time.value += (child.material.uniforms.u_windSpeed.value/2) * deltaTime
                    }
                })

            //Update Camera
            const initHeight = 2        
            let radius = 4
            let rotationSpeed = (1 * deltaTime) * 0.2 
            let center = new THREE.Vector3(0, 0, 0) 

            if (window.topSegment){
                radius = Math.max(Math.max(Math.abs(window.topSegment.x), Math.abs(window.topSegment.z)) * 3, 3)
                rotationSpeed = (1 * deltaTime) * 0.2
                center.y += Math.max(Math.abs(window.topSegment.y * 1), initHeight)
            }

            // Update in animation loop
            cameraAngle += rotationSpeed;
            const cameraX = THREE.MathUtils.lerp(this.camera.position.x, center.x + radius * Math.cos(cameraAngle), 0.02)
            const cameraZ = THREE.MathUtils.lerp(this.camera.position.z, center.z + radius * Math.sin(cameraAngle), 0.02)
            const cameraY = THREE.MathUtils.lerp(this.camera.position.y, center.y, 0.05)
            this.camera.position.set(cameraX, Math.max(cameraY, initHeight), cameraZ)
            this.controls.target.set(0, (cameraY * 0.4) , 0)
            this.controls.update()

            // update sun position

            if(window.sun && window.topSegment){
                window.sun.sun.position.x = THREE.MathUtils.lerp(window.sun.sun.position.x, Math.abs(window.topSegment.x) + 1 , 0.01)
                window.sun.sun.position.y = Math.max(THREE.MathUtils.lerp(window.sun.sun.position.y, window.topSegment.y - 1, 0.01), initHeight)
                window.sun.sun.position.z = THREE.MathUtils.lerp(window.sun.sun.position.z, Math.abs(window.topSegment.z) + 1, 0.01)
            }

            //update moon position
            if(window.moon && window.topSegment ){
                window.moon.moon.position.x = THREE.MathUtils.lerp(window.moon.moon.position.x, Math.abs(window.topSegment.x) + 1 , 0.01)
                window.moon.moon.position.y = Math.max(THREE.MathUtils.lerp(window.moon.moon.position.y, window.topSegment.y - 1, 0.01), initHeight)
                window.moon.moon.position.z = THREE.MathUtils.lerp(window.moon.moon.position.z, Math.abs(window.topSegment.z) + 1, 0.01)
            }

            // Render
            this.renderer.render(this.scene, this.camera)
        
            // Call tick again on the next frame
            window.requestAnimationFrame(tick)
        }

        tick()
    }

    setUpEnv(){
        // Lights

        // Ambient Light
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.0)
        this.scene.add(ambientLight)

    }

    setUpDebug(){
        window.debugPanel = this.debugPanel
    }
}