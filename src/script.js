// Testing L system on a 2D canvas


/** */
 * This function takes an starting state, rules to be applied
 * and number of times the rules should be applied. Returns an L-system string representation of a tree.
 */
function lSystem(start, rules, iterations) {
    // Iterate and apply rules 
    for (let i = 0; i < iterations; i++) {
      let newstart = '';
      for (let j = 0; j < start.length; j++) {
        const char = start[j];
        newstart += rules[char] || char; // Apply rules or keep the character
      }
      start = newstart;
    }
    return start;
  }

  
/**
* This function takes an L-system string visualises it on a 2D canvas
*/
function visualizeTree(lSystemString, canvasId, angle, branchLength) {

    // start by getting the canvas and set up an initial point and angle
    const ctx = document.getElementById(canvasId).getContext('2d');
    const canvas = document.getElementById(canvasId)
    const startX = canvas.width / 2;   // start in the middle of the canvas
    const startY = canvas.height; // (0,0) on canvas is top left corner
    let x = startX;
    let y = startY;
    let currentAngle = 90; // Start facing upwards
    ctx.beginPath();
    ctx.moveTo(x, y);
    const stack = []; // To keep track of positions and angles

    // Apply visualisation for each character in the L System string
    // hardcoded rules for now.
    for (const char of lSystemString) {

        // If character is 'F', then move to new point based on rotation and length parameters
        if (char === 'F') {
            const endX = x + branchLength * Math.cos(currentAngle * Math.PI / 180);
            const endY = y - branchLength * Math.sin(currentAngle * Math.PI / 180);
            ctx.lineTo(endX, endY);
            x = endX; // save new X co-ord for next character
            y = endY; // save new X co-ord for next character
        }
        // If '+' then rotate to the left 
        else if (char === '+') {
            currentAngle -= angle;
        }
        // If '-' then rotate to the left 
        else if (char === '-') {
            currentAngle += angle;
        }

        // Handling branching. If '[' then save the state into a stack
        else if (char === '[') {  // handles branching by saving point of divergance
            stack.push({x: x, y: y, angle: currentAngle});
            console.log('[: starting branch. Angle: ' + currentAngle + ' position ' + x + ',' + y)   
            
        // Handling branching.  If ']' then pop stack and return to last saved point
        } else if (char === ']') {
            const state = stack.pop();
            x = state.x;
            y = state.y;
            currentAngle = state.angle;
            ctx.moveTo(x,y)
            console.log('end of branch, going back to ' + x + ',' + y + ' with angle ' + +currentAngle)
        }
        else{
            //pass
        }
    }
    ctx.stroke(); 
}

// Testing using examples from 'The Algorithmic Beauty of Plants' by Przemyslaw Prusinkiewicz and Aristid Lindenmayer
const start = 'X';
const test1 = {'X': 'F[+X][-X]FX', 'F': 'FF'};  
const test2 = {'F': 'FF', 'X':'F+[[X]-X]-F[-FX]+X'};
const test3 = {'X': '-F'};
const rules = test1
const iterations = 5;
const angle = 18;
const branchLength = 5; // Adjust branch length

const lsystemString = lSystem(start, rules, iterations);
visualizeTree(lsystemString, 'treeCanvas', angle, branchLength); 
