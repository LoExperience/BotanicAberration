import * as THREE from 'three'
import gsap from 'gsap'


export default class Sun{

    constructor(){

        this.scene = window.scene
        this.sun
        this.spawnFloor()
    }

    spawnFloor(){
        const textureLoader = new THREE.TextureLoader()

        const floorColorTexture = textureLoader.load('textures/ground/dirt/color.jpg')
        floorColorTexture.colorSpace = THREE.SRGBColorSpace
        floorColorTexture.repeat.set(1.0, 1.0)
        floorColorTexture.wrapS = THREE.RepeatWrapping
        floorColorTexture.wrapT = THREE.RepeatWrapping

        const floorNormalTexture = textureLoader.load('textures/ground/dirt/normal.jpg')
        floorNormalTexture.repeat.set(1.0, 1.0)
        floorNormalTexture.wrapS = THREE.RepeatWrapping
        floorNormalTexture.wrapT = THREE.RepeatWrapping
        
        const floorGeometry = new THREE.CircleGeometry(1, 32)
        const floorMaterial = new THREE.MeshStandardMaterial({
            map: floorColorTexture,
            normalMap: floorNormalTexture
        })
        const floor = new THREE.Mesh(floorGeometry, floorMaterial)
        floor.receiveShadow = true
        floor.rotation.x = - Math.PI * 0.5
        floor.scale.set(0)
        this.scene.add(floor)

        // Animation

        gsap.to(floor.scale, {
            duration: 3,
            x: 1,
            y: 1,
            z: 1,
            ease: "elastic.out(1,0.3)"
        })
    }


}