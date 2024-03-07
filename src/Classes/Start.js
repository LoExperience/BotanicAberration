import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { GroundProjectedSkybox } from 'three/addons/objects/GroundProjectedSkybox.js'
import GUI from 'lil-gui'


export default class Start{

    constructor()
    {
        this.canvas = document.querySelector('canvas.webgl')
        this.scene = this.setUpScene()
        
        this.sizes ={     
            width: window.innerWidth,
            height: window.innerHeight
        }
        this.setUpResize()

        this.camera
        this.setUpCamera()

        this.controls = this.setUpConstrols()

        this.startRenderer()
        this.setUpEnvMap()

        this.gui = new GUI()
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
        this.camera = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 100)
        this.camera .position.z = 3
        scene.add(this.camera )
        window.camera = this.camera 
    }

    setUpConstrols(){
        // Controls
        const controls = new OrbitControls(this.camera, this.canvas)
        controls.enableDamping = true
        return controls
    }

    startRenderer(){
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas
        })
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        
        const tick = () =>
        {
            // Update controls
            this.controls.update()
        
            // Render
            this.renderer.render(this.scene, this.camera)
        
            // Call tick again on the next frame
            window.requestAnimationFrame(tick)
        }

        tick()
    }

    setUpEnvMap(){
        // Ground projected skybox
        const rgbeLoader = new RGBELoader()

        rgbeLoader.load('/textures/environment/kloofendal_48d_partly_cloudy_puresky_1k_modified.hdr', (environmentMap) =>
        {
            environmentMap.mapping = THREE.EquirectangularReflectionMapping
            const skybox = new GroundProjectedSkybox(environmentMap)
            skybox.radius = 31.2
            skybox.height = 0
            skybox.scale.setScalar(50)
            this.scene.add(skybox)
        })


        // floor
        const textureLoader = new THREE.TextureLoader()

        const floorColorTexture = textureLoader.load('textures/ground/dirt/color.jpg')
        floorColorTexture.colorSpace = THREE.SRGBColorSpace
        floorColorTexture.repeat.set(50.0, 50.0)
        floorColorTexture.wrapS = THREE.RepeatWrapping
        floorColorTexture.wrapT = THREE.RepeatWrapping

        const floorNormalTexture = textureLoader.load('textures/ground/dirt/normal.jpg')
        floorNormalTexture.repeat.set(50.0, 50.0)
        floorNormalTexture.wrapS = THREE.RepeatWrapping
        floorNormalTexture.wrapT = THREE.RepeatWrapping
        
        const floorGeometry = new THREE.CircleGeometry(20, 64)
        const floorMaterial = new THREE.MeshStandardMaterial({
            map: floorColorTexture,
            normalMap: floorNormalTexture
        })
        const floor = new THREE.Mesh(floorGeometry, floorMaterial)
        floor.rotation.x = - Math.PI * 0.5
        scene.add(floor)


        // Lights

        const directionalLight = new THREE.DirectionalLight('#ffffff', 4)
        directionalLight.castShadow = true
        directionalLight.shadow.camera.far = 15
        directionalLight.shadow.mapSize.set(1024, 1024)
        directionalLight.shadow.normalBias = 0.05
        directionalLight.position.set(3.5, 2, - 1.25)
        scene.add(directionalLight)

        // const newGUI = new GUI()
        // newGUI.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity')
        // newGUI.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001).name('lightX')
        // newGUI.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001).name('lightY')
        // newGUI.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001).name('lightZ')


    }
}