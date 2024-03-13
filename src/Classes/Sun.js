import * as THREE from 'three'
import gsap from 'gsap'


export default class Sun{

    constructor(){

        this.scene = window.scene
        this.sun
        this.spawn()
        this.directionalLight
        this.directionalLightHelper
    }

    spawn(){
        // load matcap
        const textureLoader = new THREE.TextureLoader()
        const sunTexture1 = textureLoader.load('./textures/matcap/sun1.png') // by E.J. Hassenfratz at https://eyedesyn.gumroad.com/l/mgeiu?_gl=1*17w7ivw*_ga*MTU2NTExODkzOS4xNzA5NzEyMzYx*_ga_6LJN6D94N6*MTcxMDA5NzI3MC40LjAuMTcxMDA5NzI3MC4wLjAuMA..
        sunTexture1.colorSpace = THREE.SRGBColorSpace

        // create mesh
        const sunGeo = new THREE.IcosahedronGeometry(0.5, 5)
        const sunMat = new THREE.MeshMatcapMaterial({matcap: sunTexture1, transparent: true, opacity: 0})
        const sunMesh = new THREE.Mesh(sunGeo, sunMat)
        sunMesh.position.set(2,2,2)
        this.sun = sunMesh
        this.scene.add(this.sun)

        // create sunlight as directional light
        const directionalLight = new THREE.DirectionalLight('#ffdd40', 0)
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

        // animate sunlight coming on
        let timeline = gsap.timeline()
        timeline.to(
            this.sun.material, 
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
                r: 0.95,
                g: 0.89,
                b: 0.58,
                duration:0.33
            }
        )
        this.scene.background.colorSpace = THREE.SRGBColorSpace
    }

    destroy(){
        // animate sun fading
        let timeline = gsap.timeline()
        timeline.to(
            this.sun.material, 
            {
                duration: 0.33, 
                opacity: 0

            }
        )

        // animate sunlight going away and then disposing
        timeline.to(
            this.directionalLight,
            {
                duration: 0.33,
                intensity: 0,
                onComplete: () => 
                {
                    this.sun.geometry.dispose()
                    this.sun.material.dispose()
                    this.scene.remove(this.sun)
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