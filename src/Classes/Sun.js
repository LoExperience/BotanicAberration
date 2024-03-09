import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import gsap from 'gsap'


export default class Sun{

    constructor(){

        this.scene = window.scene
        this.sun
        this.spawnSun()
    }

    spawnSun(){
        const gltfLoader = new GLTFLoader()
        const textureLoader = new THREE.TextureLoader()
        const sunTexture1 = textureLoader.load('./textures/matcap/sun1.png')
        const sunTexture2 = textureLoader.load('./textures/matcap/sun2.png')
        sunTexture1.colorSpace = THREE.SRGBColorSpace
        sunTexture2.colorSpace = THREE.SRGBColorSpace

        //load model

        gltfLoader.load(
            '/models/Sun.glb',
            (gltf) => {        
                gltf.scene.scale.set(0, 0, 0)
                this.sun = gltf.scene
                this.sun.children[0].children[0].material = new THREE.MeshMatcapMaterial({matcap: sunTexture1})
                this.sun.children[0].children[1].material = new THREE.MeshMatcapMaterial({matcap: sunTexture2})
                this.scene.add(this.sun)

                // TO DO rotation Animation

                gsap.to(this.sun.scale, {
                    duration: 1.5,
                    x: 0.005,
                    y: 0.005,
                    z: 0.005,
                    ease: "elastic.out(1,0.3)"
                })

            }
        )
    }


}