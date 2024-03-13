import * as THREE from 'three'

export default class LSystem
{
    constructor(start, rules, iterations, baseLength, angle, pooAmount, sun, moon){
        this.start = start
        this.rules = rules
        this.angle = angle
        this.segments = []
        this.startingLength = 1
        this.pooAmount = pooAmount
        this.baseLength = baseLength * (1 + (this.pooAmount/5))
        this.sun = sun
        this.moon = moon

        // TODO should really be in a function...
        this.iterations = iterations + (this.pooAmount / 8)
        if(this.sun || this.moon){this.iterations *= 1.5}
        this.iterations = Math.round(this.iterations)
    }

    // returns an L system string after applying all the rules
    applyRules(){
    // Iterate and apply rules 
    for (let i = 0; i < this.iterations; i++) {
        let newstart = ''
        for (let j = 0; j < this.start.length; j++) {
          const char = this.start[j]
          if(char in this.rules)
            {newstart += this.rules[char][Math.floor(Math.random() * this.rules[char].length)]} // pick one rule at random
          else
            {newstart += char}
        }
        this.start = newstart;
      }
      this.start = this.injectLeaf(this.start)
      return this.start
    }

    injectLeaf(lSystemString){
        const start = lSystemString
        let newString = start.replaceAll('F]','F!]')

        // get rid of unused symbols
        newString = newString.replaceAll('Y','')
        newString = newString.replaceAll('X','')

        // find all earlier end points
        newString = newString.replaceAll('F]','F!]')

        //add leaf on the last open branch
        const lastBranch = newString.lastIndexOf('F')
        let newerString = newString.slice(0,lastBranch) + '!' + newString.slice(lastBranch)
        newerString = newString.slice() + '!'
        return newerString
    }

    // Takes an L system string and returns a collection of tree paths based on the rules
    generateTreePaths(lSystemString) {
        let x = 0
        let y = 0
        let z = 0
    
        // set current direction as upwards to start using the Y axis
        let currentDirection = new THREE.Vector3(0, 1, 0)
    
        const stack = [] // To save position and direction for branching
    
        for (const char of lSystemString) {
            if (char === 'F') {

                // start a new segment with starting at last known x, y, position
                let newSegment = []
                newSegment.push(new THREE.Vector3(x, y, z))

                // Calculate new position based on direction and length
                const end = currentDirection.clone().multiplyScalar(this.baseLength).add(new THREE.Vector3(x, y, z))

                // Add the ending position onto new segment
                newSegment.push(end)

                // add to collection of tree paths
                this.segments.push(newSegment)

                // save the state for next character
                x = end.x 
                y = end.y
                z = end.z 
            }    
             
            // Represents a branching point. Save current state to return to later
            else if (char === '[') {  
                stack.push({x: x, y: y, z: z, direction: currentDirection.clone()})
            } 
            
            // Represents an end of a branch. Return to earlier saved state and continue
            else if (char === ']') {
                const state = stack.pop()
                x = state.x
                y = state.y
                z = state.z
                currentDirection = state.direction;
            }

            // Rotate around Y 
            else if (char === '+') { 
                const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.angle * Math.PI / 180) 
                currentDirection.applyQuaternion(rotationQuaternion)
            }

            // Rotate around Y in the opposite direction
            else if (char === '-') { 
                const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -this.angle * Math.PI / 180) 
                currentDirection.applyQuaternion(rotationQuaternion)
            }

            // Rotate around X
            else if (char === '&') { 
                const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.angle * Math.PI / 180)
                currentDirection.applyQuaternion(rotationQuaternion)
            }

            // Rotate around X in the opposite direction
            else if (char === '^') {
                const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -this.angle * Math.PI / 180) 
                currentDirection.applyQuaternion(rotationQuaternion)
            }

            // Rotate around Z
            else if (char === '*') {
                const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), this.angle * Math.PI / 180) 
                currentDirection.applyQuaternion(rotationQuaternion)
            }

            // Rotate around Z in the opposite direction
            else if (char === '/') {
                const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -this.angle * Math.PI / 180); 
                currentDirection.applyQuaternion(rotationQuaternion)
            }
            else if (char === '!') {
                let newSegment = []
                newSegment.push('LEAVES')
                newSegment.push(new THREE.Vector3(x, y, z))
                this.segments.push(newSegment)
            }
        }
        return this.segments;
    }

    getSegments(){
        return this.segments
    }
}