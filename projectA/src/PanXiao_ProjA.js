var s0 = new Float32Array((partCount+tonadoCount+boidCount+flameCount+springCount) * PART_MAXVAR);
var FSIZE2 = s0.BYTES_PER_ELEMENT;
var PSsystem = new CPartSys();

function main() {
//=============================================================================
	// Retrieve <canvas> element
	g_canvasID = document.getElementById('webgl');

	gl = getWebGLContext(g_canvasID);
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	g_canvasID.onmousedown	=	function(ev){myMouseDown( ev, gl, g_canvasID) };

	g_ShaderID1 = createProgram(gl, VSHADER_1SRC, FSHADER_1SRC);	// for VBO1,
	g_ShaderID2 = createProgram(gl, VSHADER_2SRC, FSHADER_2SRC);	// for VBO2.

	if (!g_ShaderID1 || !g_ShaderID2) {
		console.log('Failed to intialize multiple GLSL shaders. Bye!');
		return;
	}

	// Create and fill any/all Vertex Buffer Objects in the GPU:
	var n = initVBO1();			// init the first VBO: returns # of vertices created
	if (n < 0) {
		console.log('Failed to create FIRST vertex buffer object (VBO) in the GPU!');
		return;
	}

	reset();


	n = initVBO2();					// init the 2nd VGO: returns # of vertices created.
	if (n < 0) {
		console.log('Failed to create SECOND vertex buffer object(VBO) in the GPU!');
	}

	gl.clearColor(0.2, 0.2, 0.2, 1);	  // RGBA color for clearing <canvas>
	document.onkeydown = function(ev) { keydown(ev); };

	var tick = function() {
		var elapsed = animate();
		var fps = 1000 / elapsed;

		// timeStep = fps / (60.0 * 200.0);

		if (g_fps_num % 60 == 0) {
			displayFPS(fps);
		}

		update();
		requestAnimationFrame(tick, g_canvasID);
	};
	tick();
}


function animate() {
//==============================================================================
// How much time passed since we last updated the 'canvas' screen elements?
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  g_fps_num += 1;
//   g_stepCount = (g_stepCount +1)%1000;		// count 0,1,2,...999,0,1,2,...
  // Return the amount of time passed, in integer milliseconds
  return elapsed;
}

var g_Eye  = vec4.fromValues(-90.0, 0.0, 90.0, 0.0);
var	g_Look = vec4.fromValues(-89.0, 0.0, 89.0, 0.0);

var theta2D = Math.PI / 2;
var theta3D = Math.PI / 4;
// var theta3D = Math.PI / 8;;

function initVBO1() {
//=============================================================================
	// Create a buffer object in the graphics hardware: save its ID# in global var:
	g_vboID1 = gl.createBuffer();

	if (!g_vboID1) {
		console.log('initVBO1() failed to create 1st vertex buffer object (VBO) in the GPU');
		return -1;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, g_vboID1);
	gl.bufferData(gl.ARRAY_BUFFER, vbo1Array, gl.STATIC_DRAW);				// Usage hint.

	u_ProjMatrix = gl.getUniformLocation(g_ShaderID1, 'u_ProjMatrix');
	u_ViewMatrix = gl.getUniformLocation(g_ShaderID1, 'u_ViewMatrix');

	u_ModelMat1Loc = gl.getUniformLocation(g_ShaderID1, 'u_ModelMat1');
	if (!u_ModelMat1Loc) {
		console.log('Failed to get GPU storage location1 of u_ModelMat1 uniform');
		return;
	}

	a_Pos1Loc = gl.getAttribLocation(g_ShaderID1, 'a_Pos1');
	if(a_Pos1Loc < 0) {
		console.log('initVBO1() Failed to get GPU storage location of a_Pos1');
		return -1;
	}

	gl.vertexAttribPointer(a_Pos1Loc,4,gl.FLOAT,false,8*FSIZE1,0);
	gl.enableVertexAttribArray(a_Pos1Loc);
	//------------------------
	// Next attribute: a) get the GPU location...
		a_Colr1Loc = gl.getAttribLocation(g_ShaderID1, 'a_Colr1');
	if(a_Colr1Loc < 0) {
		console.log('initVBO1() failed to get the GPU storage location of a_Colr1');
		return -1;
	}
	// b) tell GPU shader 1 how to retrieve attrib from the currently bound buffer:
	gl.vertexAttribPointer(a_Colr1Loc, 3, gl.FLOAT, false, 8*FSIZE1, 4*FSIZE1);
	// c) Enable this assignment of a_Colr1 attribute to the bound buffer:
	gl.enableVertexAttribArray(a_Colr1Loc);


	return g_BufVerts1;
}

function initVBO2() {
//=============================================================================
 g_vboID2 = gl.createBuffer();

  if (!g_vboID2) {
    console.log('initVBO2() failed to create 2nd vertex buffer object (VBO) in the GPU');
    return -1;
  }

	u_runModeID = gl.getUniformLocation(g_ShaderID2, 'u_runMode');
	if(!u_runModeID) {
		console.log('Failed to get u_runMode variable location');
		return;
	}

  gl.bindBuffer(gl.ARRAY_BUFFER,g_vboID2);

  gl.bufferData(gl.ARRAY_BUFFER, s0, gl.STATIC_DRAW);

 u_ModelMatrixLoc2 = gl.getUniformLocation(g_ShaderID2, 'u_ModelMatrix');
  if (!u_ModelMatrixLoc2) {
    console.log('Failed to get GPU storage location2 of u_ModelMatrix uniform');
    return;
  }

u_ProjMatrix2 = gl.getUniformLocation(g_ShaderID2, 'u_ProjMatrix');
u_ViewMatrix2 = gl.getUniformLocation(g_ShaderID2, 'u_ViewMatrix');

  a_PositionLoc2 = gl.getAttribLocation(g_ShaderID2, 'a_Position');
  if(a_PositionLoc2 < 0) {
    console.log('initVBO2() failed to get the GPU location2 of a_Position');
    return -1;
  }

  gl.vertexAttribPointer(a_PositionLoc2, 4, gl.FLOAT, false, 8*FSIZE2, 0);

  gl.enableVertexAttribArray(a_PositionLoc2);

 	a_ColorLoc2 = gl.getAttribLocation(g_ShaderID2, 'a_Color');
  if(a_ColorLoc2 < 0) {
    console.log('initVBO2() failed to get the GPU storage location2 of a_Color');
    return -1;
  }

  gl.vertexAttribPointer(a_ColorLoc2, 3, gl.FLOAT, false, 8*FSIZE2, 4*FSIZE2);

  gl.enableVertexAttribArray(a_ColorLoc2);

  a_PtSizeLoc2 = gl.getAttribLocation(g_ShaderID2, 'a_PtSize');

  gl.vertexAttribPointer(a_PtSizeLoc2, 1, gl.FLOAT, false, 8*FSIZE2, 7*FSIZE2);

  u_render = gl.getUniformLocation(g_ShaderID2, 'u_renderMode');

  return g_BufVerts2;
}

var supertemp = 0;
function draw() {
//=============================================================================
  // Clear on-screen HTML-5 <canvas> object:
  gl.clear(gl.COLOR_BUFFER_BIT);

	if(g_show1 == 1) {	// IF user didn't press HTML button to 'hide' VBO1:
	  // DRAW FIRST VBO:--------------------------
		gl.useProgram(g_ShaderID1);
		gl.uniformMatrix4fv(u_ModelMat1Loc, false, g_ModelMatrix.elements);// Javascript data to send to GPU
		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

			g_ViewMatrix.setLookAt(g_Eye[0], g_Eye[1], g_Eye[2], g_Look[0]+0.00001, g_Look[1], g_Look[2], 0, 0.0, 1);

		gl.uniformMatrix4fv(u_ViewMatrix, false, g_ViewMatrix.elements);
		g_ProjMatrix.setPerspective(10, g_canvasID.width/g_canvasID.height, 1, 10000);
		gl.uniformMatrix4fv(u_ProjMatrix, false, g_ProjMatrix.elements);
		gl.bindBuffer(gl.ARRAY_BUFFER, g_vboID1);
		if (supertemp == 0) {
		console.log("g_ModelMatrix = ", g_ModelMatrix);
		console.log("g_ViewMatrix = " , g_ViewMatrix );
		console.log("g_ProjMatrix = " , g_ProjMatrix );
		supertemp = 1;
		}


		var temp_j = g_BufVerts1-springCount;
		for (var i = partCount+tonadoCount+boidCount+flameCount; i < partCount+tonadoCount+boidCount+flameCount+springCount; i++) {
			vbo1Array[temp_j*floatsPerVertex+0] = PSsystem.ps[i].val[PART_XPOS];
			vbo1Array[temp_j*floatsPerVertex+1] = PSsystem.ps[i].val[PART_YPOS];
			vbo1Array[temp_j*floatsPerVertex+2] = PSsystem.ps[i].val[PART_ZPOS];
			vbo1Array[temp_j*floatsPerVertex+3] = 1.0;

			vbo1Array[temp_j*floatsPerVertex+4] = PSsystem.ps[i].val[PART_R];
			vbo1Array[temp_j*floatsPerVertex+5] = PSsystem.ps[i].val[PART_G];
			vbo1Array[temp_j*floatsPerVertex+6] = PSsystem.ps[i].val[PART_B];
			vbo1Array[temp_j*floatsPerVertex+7] = 7.0;

			temp_j += 1;
		}
		g_BufVerts1 = vbo1Array.length/8;

		gl.bufferSubData(gl.ARRAY_BUFFER, 0, vbo1Array);

		gl.vertexAttribPointer( a_Pos1Loc, 4, gl.FLOAT,false, 8*FSIZE1, 0);
		gl.enableVertexAttribArray(a_Pos1Loc);
		gl.vertexAttribPointer(a_Colr1Loc, 3, gl.FLOAT, false, 8*FSIZE1, 4*FSIZE1);
		gl.enableVertexAttribArray(a_Colr1Loc);

		gl.drawArrays(gl.LINES, 0, g_BufVerts1-box_count-circle_count-springCount);
        if(showBox){
            // gl.drawArrays(gl.LINE_LOOP, g_BufVerts1-box_count-circle_count-springCount, box_count);
    		gl.drawArrays(gl.LINE_LOOP, g_BufVerts1-circle_count-springCount, circle_count/2);
    		gl.drawArrays(gl.LINE_LOOP, g_BufVerts1-circle_count/2-springCount, circle_count/2);
        }

		gl.drawArrays(gl.LINE_LOOP, g_BufVerts1-springCount, springCount);

		var tempModelMatrix = g_ModelMatrix;
		tempModelMatrix.translate(moveDistance, 0, 0);
		gl.uniformMatrix4fv(u_ModelMat1Loc, false, tempModelMatrix.elements);
		// gl.drawArrays(gl.LINE_LOOP, g_BufVerts1-circle_count-springCount, circle_count/2);


		tempModelMatrix.translate(-2*moveDistance, 0, 0);
		gl.uniformMatrix4fv(u_ModelMat1Loc, false, tempModelMatrix.elements);
		// gl.drawArrays(gl.LINE_LOOP, g_BufVerts1-circle_count/2-springCount, circle_count/2);


		tempModelMatrix.scale(2, 2, 2);
		gl.uniformMatrix4fv(u_ModelMat1Loc, false, tempModelMatrix.elements);
		// gl.drawArrays(gl.LINE_LOOP, g_BufVerts1-box_count-circle_count-springCount, box_count);
		tempModelMatrix.scale(0.5, 0.5, 0.5);
		tempModelMatrix.translate(moveDistance, 0, 0);
  }
  if(g_show2 == 1) {

	  gl.useProgram(g_ShaderID2);
	  gl.uniform1i(u_render, g_render);

	  gl.uniformMatrix4fv(u_ModelMatrixLoc2,false, g_ModelMatrix.elements);

			g_ViewMatrix.setLookAt(g_Eye[0], g_Eye[1], g_Eye[2], g_Look[0]+0.00001, g_Look[1], g_Look[2], 0, 0.0, 1);

		gl.uniformMatrix4fv(u_ViewMatrix2, false, g_ViewMatrix.elements);

		gl.uniformMatrix4fv(u_ProjMatrix2, false, g_ProjMatrix.elements);

		gl.bindBuffer(gl.ARRAY_BUFFER, g_vboID2);


		for (var i = 0; i < partCount+tonadoCount+boidCount+flameCount+springCount; i++) {
			for (var j = 0; j < PART_MAXVAR; j++) {
				s0[i * PART_MAXVAR + j] = PSsystem.ps[i].val[j];
			}
		}

		gl.bufferSubData(gl.ARRAY_BUFFER, 0, s0);

	  // ----------Tie shader's 'a_Position' attribute to bound buffer:------------
	  gl.vertexAttribPointer( a_PositionLoc2, 3,	gl.FLOAT,	false, PART_MAXVAR*FSIZE2, PART_XPOS*FSIZE2);
	  // Enable this assignment of the a_Position attribute to the bound buffer:
	  gl.enableVertexAttribArray(a_PositionLoc2);
	  // ----------Tie shader's 'a_Color' attribute to bound buffer:--------------
	  gl.vertexAttribPointer(a_ColorLoc2, 3, gl.FLOAT, false, PART_MAXVAR*FSIZE2, PART_R*FSIZE2);
	  // Enable this assignment of a_Color attribute to the bound buffer:
	  gl.enableVertexAttribArray(a_ColorLoc2);
	  //-----------Tie shader's 'a_PtSize' attribute to bound buffer:-------------
	  gl.vertexAttribPointer(a_PtSizeLoc2, 1, gl.FLOAT, false, PART_MAXVAR*FSIZE2, PART_DIAM*FSIZE2);
	  // Enable this assignment of a_PtSize attribute to the bound buffer:
	  gl.enableVertexAttribArray(a_PtSizeLoc2);
		// ****** END SURPRISE.
	  gl.drawArrays(gl.POINTS, 0, g_BufVerts2);	// draw 2nd VBO contents:
	  gl.drawArrays(gl.LINE_LOOP, g_BufVerts2-springCount, springCount);
	}
}

function update() {
	PSsystem.solver(timeStep);
	PSsystem.doConstraint(PSsystem.ps1, PSsystem.ps);
    PSsystem.UpdateColor(PSsystem.ps);
	PSsystem.StateVecSwap(PSsystem.ps, PSsystem.ps1);
	draw();
}




function roundRand3D() {
    do {
        xball = 2.0*Math.random() -1.0;
        yball = 2.0*Math.random() -1.0;
        zball = 2.0*Math.random() -1.0;
        }
    while(xball*xball + yball*yball + zball*zball >= 1.0);
    ret = new Array(xball,yball,zball);
    return ret;
}

function roundRand2D() {
//==============================================================================
var xy = [0,0];
	do {			// 0.0 <= Math.random() < 1.0 with uniform PDF.
		xy[0] = 2.0*Math.random() -1.0;			// choose an equally-likely 2D point
		xy[1] = 2.0*Math.random() -1.0;			// within the +/-1, +/-1 square.
		}
	while(xy[0]*xy[0] + xy[1]*xy[1] >= 1.0);		// keep 1st point inside circle
//	while(xdisc*xdisc + ydisc*ydisc >= 1.0);		// keep 1st point inside circle.
	return xy;
}

function keydown(ev) {
//------------------------------------------------------
//HTML calls this'Event handler' or 'callback function' when we press a key:
	var speedup = 1.0;
	// console.log(ev.keyCode);

	var dis = 1.0;
	var diff = vec4.create();
	vec4.scaleAndAdd(diff, g_Look, g_Eye, -1);

	if (ev.keyCode == 82) {
		reset();
		return;
	}

    if (ev.keyCode == 39) { // left
		theta2D += Math.PI / 36 /6 * speedup;
    } else
    if (ev.keyCode == 37) { // right
		theta2D -= Math.PI / 36 /6 * speedup;
    } else
    if(ev.keyCode == 38) { // down
		theta3D += Math.PI / 36 /6 * speedup;
    } else
    if (ev.keyCode == 40) { // up
		theta3D -= Math.PI / 36 /6 * speedup;
    } else
    if(ev.keyCode == 187) {
        g_Eye[2] += 1;
    } else
    if (ev.keyCode == 189) {
        g_Eye[2] -= 1;
    } else
	if(ev.keyCode == 65) {
		// g_Eye[1] += diff[0] * speedup;
		// g_Eye[0] -= diff[1] * speedup;
		g_Eye[0] -= Math.cos(theta2D) * speedup;
		g_Eye[1] += Math.sin(theta2D) * speedup;

    } else

    if (ev.keyCode == 68) {
		// g_Eye[1] -= diff[0] * speedup;
		// g_Eye[0] += diff[1] * speedup;

		g_Eye[0] += Math.cos(theta2D) * speedup;
		g_Eye[1] -= Math.sin(theta2D) * speedup;

    } else
    if(ev.keyCode == 87) {
		vec4.scaleAndAdd(g_Eye, g_Eye, diff, speedup);
    } else
    if (ev.keyCode == 83) {
		vec4.scaleAndAdd(g_Eye, g_Eye, diff, -speedup);
    } else

    { return; }

	var r    = Math.sin(theta3D);
    // var r = 1;
	var temp = vec4.fromValues(r*Math.sin(theta2D), r*Math.cos(theta2D), -Math.cos(theta3D), 0.0);

	vec4.add(g_Look, g_Eye, temp);
    console.log(g_Look, g_eye);
    draw();
}
//
// function viewGravity() {
// 	g_Eye  = vec4.fromValues(-20.0, 0.0, 1.0, 0.0);
// 	g_Look = vec4.fromValues(-19.0, 0.0, 1.0, 0.0);
// 	theta3D = Math.PI / 2;
// }
// function viewTonado() {
// 	g_Eye  = vec4.fromValues(-20.0, -moveDistance, 1.0, 1.0);
// 	g_Look = vec4.fromValues(-19.0 , -moveDistance, 1.0, 1.0);
// 	theta3D = Math.PI / 2;
// }
// function viewBoid() {
// 	var leadID = partCount+tonadoCount+1;
// 	g_Eye = vec4.fromValues(PSsystem.ps1[leadID].val[PART_XPOS],
// 							PSsystem.ps1[leadID].val[PART_YPOS]+0.001,
// 							PSsystem.ps1[leadID].val[PART_ZPOS]+5*moveDistance, 1);
// 	g_Look = vec4.fromValues(PSsystem.ps1[leadID].val[PART_XPOS],
// 							PSsystem.ps1[leadID].val[PART_YPOS]+0.001,
// 							PSsystem.ps1[leadID].val[PART_ZPOS]+5*moveDistance-1, 1);
// 	theta3D = 0;
//
// }
// function viewFlame() {
// 	g_Eye  = vec4.fromValues(-30.0, moveDistance, 1.0, 0.0);
// 	g_Look = vec4.fromValues(-29.0, moveDistance, 1.0, 0.0);
// 	theta3D = Math.PI / 2;
// }
// function viewSpring() {
// 	var local_x = spring_x - springLength * 100;
// 	var local_y = spring_y + parseInt(springCount / springInterval) / 2 * springLength;
// 	var local_z = spring_z + springInterval / 2 * springLength;
// 	g_Eye  = vec4.fromValues(local_x, local_y, local_z, 1.0);
// 	g_Look = vec4.fromValues(local_x+1, local_y, local_z, 1.0);
// 	theta3D = Math.PI / 2;
// 	// theta2D = 0;
// }

function reset() {
	for (var i = 0; i < partCount+tonadoCount+boidCount+flameCount+springCount; i++) {
		PSsystem.ps[i].reset();
		PSsystem.psdot[i].reset();
		PSsystem.ps1[i].reset();

		// this.ps     = this.initPS();
	// this.psdot  = this.initPS();
	// this.ps1    = this.initPS();
		PSsystem.psM[i].reset();
		PSsystem.psMdot[i].reset();
		PSsystem.psB[i].reset();
		PSsystem.psBdot[i].reset();
	}

	for (var ii = partCount+tonadoCount+boidCount; ii < partCount+tonadoCount+boidCount+flameCount; ii++) {
		PSsystem.ps[ii].makeFire();
		PSsystem.psdot[ii].makeFire();
		PSsystem.ps1[ii].makeFire();
		PSsystem.psM[ii].makeFire();
		PSsystem.psMdot[ii].makeFire();
		PSsystem.psB[ii].makeFire();
		PSsystem.psBdot[ii].makeFire();
	}

	for (var ii = toSpringCount;
	ii < toSpringCount+springCount; ii++) {
		PSsystem.ps[ii].makeSpring(ii-toSpringCount);
        PSsystem.psdot[ii].makeSpring(ii-toSpringCount);
		PSsystem.ps1[ii].makeSpring(ii-toSpringCount);
		PSsystem.psM[ii].makeSpring(ii-toSpringCount);
		PSsystem.psMdot[ii].makeSpring(ii-toSpringCount);
		PSsystem.psB[ii].makeSpring(ii-toSpringCount);
		PSsystem.psBdot[ii].makeSpring(ii-toSpringCount);
		// PSsystem.psdot[ii].makeFire();
		// PSsystem.ps1[ii].makeFire();
		// PSsystem.psM[ii].makeFire();
		// PSsystem.psMdot[ii].makeFire();
		// PSsystem.psB[ii].makeFire();
		// PSsystem.psBdot[ii].makeFire();
	}

	PSsystem.ps[partCount+tonadoCount+1].val[PART_YVEL] = boid_speed;
}

function displayFPS(fps) {
	// var temp = 1.0 / g_timeStep;
	// document.getElementById('fps').innerHTML = fps.toFixed(3) + '<b> fps</b>';
}

function updateFPS() {
	timeStep = 1.0 / parseFloat(document.getElementById("fpsInput").value);
	console.log(timeStep);
}

function switchToEuler() {
	g_solver = NU_SOLV_EULER;
}

function switchToMidPt() {
	g_solver = NU_SOLV_MIDPOINT;
}

function switchToInverse() {
	g_solver = NU_SOLV_BACK_EULER;
}

function switchToBackMid() {
	g_solver = NU_SOLV_BACK_MIDPT;
}

function renderByBall() {
	g_render = 0;
}

function renderByBox() {
	g_render = 1;
}

function showOutBox(){
    showBox = !showBox;
    console.log(showBox);
}

function myMouseDown(ev, gl, canvas) {
//==============================================================================
    var rect = ev.target.getBoundingClientRect();
    var xp = ev.clientX - rect.left - g_canvasID.width/2;
    var yp = ev.clientY - rect.top - g_canvasID.height/2;

    // var x = (xp - canvas.width/2)  / (canvas.width/2);
    // var y = (yp - canvas.height/2) / (canvas.height/2);

    isDrag = true;
    xMclik = xp;
    yMclik = yp;

	g_mouse = !g_mouse;
    g_mouse_x = yp;
    g_mouse_y = -xp;

	console.log(g_mouse_x, g_mouse_y);
};
