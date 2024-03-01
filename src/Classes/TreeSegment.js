import * as THREE from 'three'

export default class TreeSegment
{
    constructor(start, end, curveControlPoint, subDivision, radius, radialSegments){
        // setting params as attributes
        this.start = start
        this.end = end
        this.curveControlPoint = curveControlPoint
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
        this.tubeMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00})  
        
        //create mesh
        this.tubeMesh = new THREE.Mesh(this.tubeGeometry, this.tubeMaterial)
    }

    getMesh(){
        return this.tubeMesh
    }

}