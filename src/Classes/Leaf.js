import * as THREE from 'three'
import gsap from 'gsap'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import vertexShader from './vertex.glsl'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'


export default class Leaf{

    constructor(position){
        this.position = position
        this.scene = window.scene
        this.alphaMap = new THREE.TextureLoader().load('./textures/leaves/alpha1.png')
        this.meshPath = './models/leafSmall.glb'
        this.material = new CustomShaderMaterial({
            baseMaterial: THREE.MeshStandardMaterial,
            // vertexShader: undefined,
            // uniforms: {
            //     u_effectBlend: { value: 1.0 },
            //     u_inflate: { value: 0.0 },
            //     u_scale: { value: 1.0 },
            //     u_windSpeed: { value: 1.0 },
            //     u_time: { value: 0.0 },
            // },
            transparent: true,
            alphaMap: this.alphaMap ,
            alphaTest: 0.5,
            side: THREE.FrontSide,
            color: new THREE.Color(1.0, 0.0, 0.0)
        })

        this.spawn()

    }

    spawn(){
        const gltfLoader = new GLTFLoader()
        gltfLoader.load(
            this.meshPath,
            (gltf) =>
            {
                const leafMesh = gltf.scene.children[0]
                leafMesh.scale.set(0.05, 0.05, 0.05)
                leafMesh.position.set(this.position.x, this.position.y, this.position.z)
                leafMesh.receiveShadow  = true
                leafMesh.castShadow = true
                this.scene.add(leafMesh)

            }
        )
    }


}