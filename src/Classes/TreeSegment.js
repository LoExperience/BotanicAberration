import * as THREE from 'three'

export default class TreeSegment
{
    constructor(start, end, subDivision, radius, radialSegments){
        // setting params as attributes
        this.start = start
        this.end = end

        const midPoint = new THREE.Vector3().copy(this.start)
        midPoint.add(this.end)
        midPoint.multiplyScalar(0.5)


        this.curveControlPoint = midPoint
        this.subDivision = subDivision
        this.radius = radius
        this.radialSegments = radialSegments

        // set curve, geo and material
        this.curve = new THREE.QuadraticBezierCurve3(this.start, this.curveControlPoint, this.end);
        this.curvePoints = this.curve.getPoints(20)
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setFromPoints(this.curvePoints);
        this.tubeGeometry = new THREE.TubeGeometry(
            this.curve,
            this.subDivision,
            this.radius,
            this.radialSegments,
            false
        )
        this.tubeMaterial = new THREE.ShaderMaterial(
            {
                transparent: true,
                // wireframe: true,
                side: THREE.DoubleSide,
                uniforms:
                {
                    uProgress: {value: 0},
                    uStartPos: {value: this.start},
                    uEndPos: {value: this.end},
                    uColor: {value: new THREE.Vector3(Math.random(), Math.random(), Math.random())}
                },
                vertexShader:`

                varying float vElevation;

                void main()
                {
                    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                    vec4 viewPosition = viewMatrix * modelPosition;
                    vec4 projectedPosition = projectionMatrix * viewPosition;
                    gl_Position = projectedPosition;
                    
                    vElevation = position.y;
                }
                
                `,
                fragmentShader:`
                uniform float uProgress; // Uniform increasing from 0 to 1, used for animation
                uniform vec3 uStartPos; // the starting position of each segment
                uniform vec3 uEndPos; //the ending position of each segment
                varying float vElevation;  // Varying for the vertex position
                
                void main() {
                    
                    // normalise height range
                    float relativeHeightPos = (vElevation - uStartPos.y)/(uEndPos.y - uStartPos.y);
                    
                    // conditional to check if fragment should be visible
                    float alpha = 0.0;
                    alpha = step(relativeHeightPos, uProgress);
                    if (uProgress == 1.0){
                        alpha = 1.0;
                    }    

                    // Set the output color
                    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
                }
                `
            })  
        
        //create mesh
        this.tubeMesh = new THREE.Mesh(this.tubeGeometry, this.tubeMaterial)
    }

    getMidPoint(v1, v2){
        console.log('midpointing')
        const midPoint = new THREE.Vector3().copy(v1)
        midPoint.add(v2)
        midPoint.multiplyScalar(0.5)
        return midPoint
    }

    getMesh(){
        return this.tubeMesh
    }

}