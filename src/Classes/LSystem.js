import * as THREE from 'three'

export default class LSystem
{
    constructor(start, rules, iterations, baseLength, angle){
        this.start = start
        this.rules = rules
        this.iterations = iterations
        this.baseLength = baseLength
        this.angle = angle
        this.segments = []
        this.startingLength = 1
    }

    // returns an L system string after applying all the rules
    applyRules(){
    // Iterate and apply rules 
    for (let i = 0; i < this.iterations; i++) {
        let newstart = '';
        for (let j = 0; j < this.start.length; j++) {
          const char = this.start[j];
          newstart += this.rules[char] || char; // Apply rules or keep the character
        }
        this.start = newstart;
      }
      return this.start;
    }

    // generate individual parts of the tree as a start and end points
    // generateTreePaths(lSystemString){
    //     let x = 0;
    //     let y = 0;
    //     let z = 0;
    //     let currentAngle = 90; // Start facing upwards
    //     const stack = []; // To keep track of positions and angles

    //     for (const char of lSystemString) {

    //         // If character is 'F', then move to new point based on rotation and length parameters
    //         if (char === 'F') {
    //             // Start a new segment and insert the starting point
    //             let newSegment = []
    //             newSegment.push(new THREE.Vector3(x, y, z))

    //             // work out the ending point and add to the new segment
                
    //             const endX = x + this.baseLength * Math.cos(currentAngle * Math.PI / 180)
    //             const endY = y + this.baseLength * Math.sin(currentAngle * Math.PI / 180)
    //             const endZ = 0
    //             console.log('endX: ', endX)
    //             console.log(endZ)
    //             newSegment.push(new THREE.Vector3(endX, endY, endZ))

    //             //add the segment onto tree array
    //             this.segments.push(newSegment)

    //             // // save new co-ord for next character / segment
    //             x = endX; 
    //             y = endY; 
    //             z = endZ; 
    //         }    

    //         // Handling branching. If '[' then save the state into a stack
    //         else if (char === '[') {  // handles branching by saving point of divergance
    //             stack.push({x: x, y: y, z: z, angle: currentAngle})
                
    //         // Handling branching.  If ']' then pop stack and return to last saved point
    //         } else if (char === ']') {
    //             const state = stack.pop()
    //             x = state.x
    //             y = state.y
    //             z = state.z
    //             currentAngle = state.angle
    //         }            
    //         // If '+' then rotate to the left 
    //         else if (char === '+') {
    //             currentAngle -= this.angle
    //         }

    //         // If '-' then rotate to the left 
    //         else if (char === '-') {
    //             currentAngle += this.angle
    //         }
    //     }
    //     return this.segments
    // }


    generateTreePaths(lSystemString){
        let x = 0;
        let y = 0;
        let z = 0;
        let currentAngle = 90; // Start facing upwards

        let yaw = 90; // rotate along y
        let pitch = 0; // rotate along x
        let roll = 0; // rotate along z

        const stack = []; // To keep track of positions and angles

        for (const char of lSystemString) {

            // If character is 'F', then move to new point based on rotation and length parameters
            if (char === 'F') {
                // Start a new segment and insert the starting point
                let newSegment = []
                newSegment.push(new THREE.Vector3(x, y, z))

                // work out the ending point and add to the new segment
                
                // Calculate the forward direction based on angles
                const endX = x + this.baseLength * Math.cos(yaw * Math.PI / 180) * Math.cos(pitch * Math.PI / 180);
                const endY = y + this.baseLength * Math.sin(yaw * Math.PI / 180) * Math.cos(pitch * Math.PI / 180);
                const endZ = z + this.baseLength * Math.sin(pitch * Math.PI / 180);

                newSegment.push(new THREE.Vector3(endX, endY, endZ));
                this.segments.push(newSegment);

                x = endX; 
                y = endY; 
                z = endZ; 
            }    

            else if (char === '[') {  
                stack.push({x: x, y: y, z: z, yaw: yaw, pitch: pitch, roll: roll});
            } 
    
            else if (char === ']') {
                const state = stack.pop();
                x = state.x;
                y = state.y;
                z = state.z;
                yaw = state.yaw;
                pitch = state.pitch;
                roll = state.roll;
            }            
            else if (char === '+') { 
                yaw -= this.angle; // Turn left (around U)
            }
            else if (char === '-') {
                yaw += this.angle; // Turn right (around U)
            }
            else if (char === '&') { 
                pitch -= this.angle;  // Pitch down (around L)
            }
            else if (char === '^') {
                pitch += this.angle;  // Pitch up (around L)
            }
            else if (char === '*') { 
                roll -= this.angle;  // Roll left (around H)
            }
            else if (char === '/') {
                roll += this.angle;  // Roll right (around H)
            }
            else if (char === '|') {
                yaw += 180;  // Turn around 180 degrees (around U)
            }

        }
        return this.segments
    }

    getSegments(){
        return this.segments
    }
}