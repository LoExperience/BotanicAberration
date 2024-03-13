import * as THREE from 'three'

export default class TreeSegment
{
    constructor(start, end, subDivision, radius, radialSegments, drunkness, pooAmount){
        // setting params as attributes
        this.start = start
        this.end = end
        this.drunkness = drunkness
        this.pooAmount = pooAmount

        const midPoint = new THREE.Vector3().copy(this.start)
        midPoint.add(this.end)
        midPoint.multiplyScalar(0.5)
        
        const drunkModifier = new THREE.Vector3(
            (Math.random() - 0.5) * (0.2 * (this.drunkness) / 6),
            0, 
            (Math.random() - 0.5) * (0.2 * (this.drunkness) / 6))
        midPoint.add(drunkModifier)

        this.curveControlPoint = midPoint
        this.subDivision = subDivision
        this.radius = radius * (1 + (this.pooAmount / 5))
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
        
        this.trunkColor = new THREE.Vector3(1,1,1)

        if(window.moon){
            this.trunkColor = window.palette.moon[0]
        }

        if(window.sun){
            this.trunkColor = window.palette.sun[0]
        }

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
                    uColor: {value: this.trunkColor}
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
                uniform vec3 uColor;
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
                    gl_FragColor = vec4(uColor, alpha);
                }
                `
            })  
        
        //create mesh
        this.tubeMesh = new THREE.Mesh(this.tubeGeometry, this.tubeMaterial)
    }

    getMidPoint(v1, v2){
        const midPoint = new THREE.Vector3().copy(v1)
        midPoint.add(v2)
        midPoint.multiplyScalar(0.5)
        return midPoint
    }

    getMesh(){
        return this.tubeMesh
    }

}