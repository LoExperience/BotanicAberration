import * as THREE from 'three'
import gsap from 'gsap'


export default class Moon{

    constructor(){

        this.scene = window.scene
        this.moon
        this.spawn()
        this.directionalLight
        this.directionalLightHelper
    }

    spawn(){
        // load matcap
        const textureLoader = new THREE.TextureLoader()
        const moonTexture1 = textureLoader.load('./textures/matcap/moon1.png') // by E.J. Hassenfratz at https://eyedesyn.gumroad.com/l/mgeiu?_gl=1*17w7ivw*_ga*MTU2NTExODkzOS4xNzA5NzEyMzYx*_ga_6LJN6D94N6*MTcxMDA5NzI3MC40LjAuMTcxMDA5NzI3MC4wLjAuMA..
        moonTexture1.colorSpace = THREE.SRGBColorSpace

        // create mesh
        const moonGeo = new THREE.IcosahedronGeometry(0.5, 5)
        const moonMat = new THREE.MeshMatcapMaterial({matcap: moonTexture1, transparent: true, opacity: 0})
        const moonMesh = new THREE.Mesh(moonGeo, moonMat)
        moonMesh.position.set(2,2,2)
        this.moon = moonMesh
        this.scene.add(this.moon)

        // create moonlight as directional light
        const directionalLight = new THREE.DirectionalLight('#d4d4d4', 0)
        directionalLight.castShadow = true
        directionalLight.shadow.camera.far = 15
        directionalLight.shadow.mapSize.set(1024, 1024)
        directionalLight.shadow.normalBias = 0.05
        directionalLight.position.set(2, 2, 2)

        this.directionalLight = directionalLight
        this.scene.add(this.directionalLight)

        // const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1, 0xFFFFFF)
        // this.directionalLightHelper = directionalLightHelper
        // this.scene.add(this.directionalLight, this.directionalLightHelper)

        // animate smoonlight coming on
        let timeline = gsap.timeline()
        timeline.to(
            this.moon.material, 
            {
                duration: 0.33, 
                opacity: 1

            }
        )
        
        // animate dir light
        timeline.to(
            this.directionalLight, 
            {duration: 0.33, intensity: 5.0},
        )

        // animate background color
        timeline.to(
            this.scene.background,
            {
                r: 0.00,
                g: 0.00,
                b: 0.02,
                duration:0.33
            }
        )
    }

    destroy(){
        // animate moon fading
        let timeline = gsap.timeline()
        timeline.to(
            this.moon.material, 
            {
                duration: 0.33, 
                opacity: 0

            }
        )

        // animate moonlight going away and then disposing
        timeline.to(
            this.directionalLight,
            {
                duration: 0.33,
                intensity: 0,
                onComplete: () => 
                {
                    this.moon.geometry.dispose()
                    this.moon.material.dispose()
                    this.scene.remove(this.moon)
                    this.directionalLight.dispose()
                }
            }
        )

        // animate background color
        timeline.to(
            this.scene.background,
            {
                r: 0,
                g: 0,
                b: 0,
                duration:0.33
            }
        )
    }


}