//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)
//
// TABS set to 2.
//
// ORIGINAL SOURCES:
// Chap 5: TexturedQuad.js (c) 2012 matsuda and kanda
//					"WebGL Programming Guide" pg. 163
// RotatingTranslatedTriangle.js (c) 2012 matsuda
// JT_MultiShader.js  for EECS 351-1,
//									Northwestern Univ. Jack Tumblin
//----------------------------------------------------------------------
//	traceWeek01_LineGrid.js 		Northwestern Univ. Jack Tumblin
//----------------------------------------------------------------------
//	--add comments
//	--add mouse & keyboard functions + on-screen display & console reporting
//	--two side-by-side viewports:
//			LEFT:	--3D line-drawing preview
//			RIGHT:--texture-map from a Uint8Array object.
//						(NOTE: Not all versions of WebGL offer floating-point textures:
//							instead our ray-tracer will fill a Float32Array array in a
//               CImgBuf object. To display that image, our CImgBuf object
//	             converts RGB 32-bit floats to 8 bit RGB integers for
//               the Uint8Array texture map we show on-screen.
//               (convert by rounding: intRGB = floatRGB*255.5)
//	--include re-sizing so that HTML-5 canvas always fits browser-window width
//							(see 351-1 starter code: 7.11.JT_HelloCube_Resize.js, .html)
//	--revise to use VBObox0,VBObox1 objects; each holds one VBO & 1 shader pgm,
//			so that changes to code for WebGL preview in the left viewport won't
//			affect code for the right viewport that displays ray-traced result by
//			texture-mapping.
//	--Update VBObox code: drop old VBOboxes.js, add JT_VBObox-Lib.js (vers. 18)
//    with 'switchToMe()' and improved animation timing
// --Unify our user-interface's global variables into one 'GUIbox' object.
//==============================================================================

// Global Variables
//   (These are almost always a BAD IDEA, but here they eliminate lots of
//    tedious function arguments.
//    Later, collect them into just a few global, well-organized objects!)
// ============================================================================
//-----For WebGL usage:-------------------------
var gl;													// WebGL rendering context -- the 'webGL' object
																// in JavaScript with all its member fcns & data
var g_canvasID;									// HTML-5 'canvas' element ID#

//-----Mouse,keyboard, GUI variables-----------
var gui = new GUIbox(); // Holds all (Graphical) User Interface fcns & vars, for
                        // keyboard, mouse, HTML buttons, window re-sizing, etc.

//-----For the VBOs & Shaders:-----------------
preView = new VBObox0();		// For WebGLpreview: holds one VBO and its shaders
rayView = new VBObox1();		// for displaying the ray-tracing results.
// rayView_disk = 

//-----------Ray Tracer Objects:---------------
//var myScene = new CScene();
var rayImg = new CImgBuf(256, 256);
console.log("rayImg: ", rayImg);

var g_SceneNum = 0;			// scene-selector number; 0,1,2,... G_SCENE_MAX-1
var G_SCENE_MAX = 3;		// Number of scenes defined.

var g_AAcode = -1;			// Antialiasing setting: 0 == ERROR.
                        // +1,+2,+3,... == JITTERED supersamples: 1x1, 2x2,...
                        // -1,-2,-3,... == NO jittering: 1x2, 2x2, etc.
var G_AA_MAX = 4;				// highest super-sampling number allowed.

//-----For animation & timing:---------------------
var g_lastMS = Date.now();			// Timestamp (in milliseconds) for our
                                // most-recently-drawn WebGL screen contents.
                                // Set & used by moveAll() fcn to update all
                                // time-varying params for our webGL drawings.
  // All time-dependent params (you can add more!)
/*
var g_angleNow0  =  0.0; 			  // Current rotation angle, in degrees.
var g_angleRate0 = 45.0;				// Rotation angle rate, in degrees/second.
*/
//--END---GLOBAL VARIABLES------------------------------------------------------

function main() {
//=============================================================================
// Function that begins our Javascript program (because our HTML file specifies
// its 'body' tag to define the 'onload' parameter as main() )

//  test_glMatrix();		// make sure that the fast vector/matrix library we use
  										// is available and working properly.

  // Retrieve the HTML-5 <canvas> element where webGL will draw our pictures:
  g_canvasID = document.getElementById('webgl');

  // Create the the WebGL rendering context: one giant JavaScript object that
  // contains the WebGL state machine, adjusted by big sets of WebGL functions,
  // built-in variables & parameters, and member data. Every WebGL func. call
  // will follow this format:  gl.WebGLfunctionName(args);
  //gl = getWebGLContext(g_canvasID); // SIMPLE version.
  // Here's a BETTER version:
  gl = g_canvasID.getContext("webgl", { preserveDrawingBuffer: true});
	// This fancier-looking version disables HTML-5's default screen-clearing,
	// so that our drawAll() function will over-write previous on-screen results
	// until we call the gl.clear(COLOR_BUFFER_BIT); function. )
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.clearColor(0.2, 0.2, 0.2, 1);	  // set RGBA color for clearing <canvas>
  gl.enable(gl.DEPTH_TEST);           // CAREFUL! don't do depth tests for 2D!

  gui.init();                   // Register all Mouse & Keyboard Event-handlers
                                // (see JT_GUIbox-Lib.js )

  // Initialize each of our 'vboBox' objects:
  preView.init(gl);		// VBO + shaders + uniforms + attribs for WebGL preview
  rayView.init(gl);		//  "		"		" to display ray-traced on-screen result.

  browserResize();			// Re-size this canvas before we use it. (ignore the
  // size settings from our HTML file; fill browser window with canvas whose
  // width is twice its height.)

  drawAll();
//----------------------------------------------------------------------------
// NOTE! Our ray-tracer ISN'T 'animated' in the usual sense!
// --No 'tick()' function, no continual automatic re-drawing/refreshing.
// --Instead, call 'drawAll()' after user makes an on-screen change, e.g. after
// mouse drag, after mouse click, after keyboard input, and after ray-tracing.
// --You can also re-draw screen to show ray-tracer progress on-screen:
//  try calling drawAll() after ray-tracer finishes each set of 16 scanlines,
//  or perhaps re-draw after every 1-2 seconds of ray-tracing.
//----------------------------------------------------------------------------
}

function test_glMatrix() {
//=============================================================================
// Make sure that the fast vector/matrix library we use is available and works
// properly. My search for 'webGL vector matrix library' found the GitHub
// project glMatrix is intended for WebGL use, and is very fast, open source
// and well respected.		 	SEE:       http://glmatrix.net/
// 			NOTE: cuon-matrix.js library (supplied with our textbook: "WebGL
// Programming Guide") duplicates some of the glMatrix.js functions. For
// example, the glMatrix.js function 		mat4.lookAt() 		is a work-alike
//	 for the cuon-matrix.js function 		Matrix4.setLookAt().
// Try some vector vec4 operations:
	var myV4 = vec4.fromValues(1,8,4,7);				// create a 4-vector
																							// (without 'var'? global scope!)
	console.log(' myV4 = '+myV4+'\n myV4[0] = '+myV4[0]+'\n myV4[1] = '
			+ myV4[1]+'\n myV4[2] = '+myV4[2]+'\n myV4[3] = '+myV4[3]+'\n\n');
	var yerV4 = vec4.fromValues(1,1,1,1);
	console.log('yerV4[] = ',
				yerV4[0], ', ', yerV4[1], ', ', yerV4[2], ', ', yerV4[3]);
	console.log('vec4.subtract(yerV4, yerV4, myV4) yields ');
	vec4.subtract(yerV4, yerV4, myV4);
		console.log('yerV4[] = ',
				yerV4[0], ', ', yerV4[1], ', ', yerV4[2], ', ', yerV4[3]);
	// Try some matrix mat4 operations:
	var myM4 = mat4.create();							// create a 4x4 matrix
	console.log('mat4.str(myM4) = '+mat4.str(myM4)+'\n' );
	// Which is it? print out row[0], row[1], row[2], row[3],
	// or print out column[0], column[1], column[2], column[3]?
	// Create a 'translate' matrix to find out:
	var transV3 = vec3.fromValues(6,7,8);			// apply 3D translation vector
	mat4.translate(myM4, myM4, transV3);	// make into translation matrix
	console.log('mat4.str(myM4) = '+mat4.str(myM4)+'\n');	// print it as string
	// As you can see, the 'mat4' object stores matrix contents in COLUMN-first
	// order; to display this translation matrix correctly, do this
	// (suggests you might want to add a 'print()' function to mat2,mat3,mat4):
	console.log('---------Translation Matrix: tx,ty,tz == (6,7,8)-----------\n');
	console.log(
	' myM4 row0=[ '+myM4[ 0]+', '+myM4[ 4]+', '+myM4[ 8]+', '+myM4[12]+' ]\n');
	console.log(
	' myM4 row1=[ '+myM4[ 1]+', '+myM4[ 5]+', '+myM4[ 9]+', '+myM4[13]+' ]\n');
	console.log(
	' myM4 row2=[ '+myM4[ 2]+', '+myM4[ 6]+', '+myM4[10]+', '+myM4[14]+' ]\n');
		console.log(
	' myM4 row3=[ '+myM4[ 3]+', '+myM4[ 7]+', '+myM4[11]+', '+myM4[15]+' ]\n');
}

function drawAll() {
//=============================================================================
  // Clear <canvas> color AND DEPTH buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Use OpenGL/ WebGL 'viewports' to map the CVV to the 'drawing context',
	// (for WebGL, the 'gl' context describes how we draw on the HTML-5 canvas)
	// Details? see  https://www.khronos.org/registry/webgl/specs/1.0/#2.3
  // Draw in the LEFT viewport:
  //------------------------------------------
	// CHANGE from our default viewport:
	// gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	// to a half-width viewport on the right side of the canvas:
	gl.viewport(0,														// Viewport lower-left corner
							0,														// (x,y) location(in pixels)
  						gl.drawingBufferWidth/2, 			// viewport width, height.
  						gl.drawingBufferHeight);
	preView.switchToMe();  // Set WebGL to render from this VBObox.
	preView.adjust();		  // Send new values for uniforms to the GPU, and
	preView.draw();			  // draw our VBO's contents using our shaders.

  // Draw in the RIGHT viewport:
  //------------------------------------------
  // MOVE our viewport from the left half of the canvas to the right:
	gl.viewport(gl.drawingBufferWidth/2,   // Viewport lower-left corner
	            0,      // location(in pixels)
	            gl.drawingBufferWidth/2, 			// viewport width, height.
  	            gl.drawingBufferHeight);
    rayView.switchToMe(); // Set WebGL to render from this VBObox.
  	rayView.adjust();		  // Send new values for uniforms to the GPU, and
    // rayImg.setTestPattern(0);
    rayImg.makeRayTracedImage();
    rayView.myImg = rayImg.iBuf;
    rayView.reload();
  	rayView.draw();			  // draw our VBO's contents using our shaders.

}

function onSuperSampleButton() {
//=============================================================================
	//console.log('ON-SuperSample BUTTON!');
	if(g_AAcode < 0) {  // next-lower antialiasing code, but >= -G_AA_MAX.
		g_AAcode = -g_AAcode;							// remove the negative sign.
		g_AAcode = 1 + (g_AAcode % G_AA_MAX); // 1,2,3,4,1,2,3,4,1,2, etc
		g_AAcode = -g_AAcode;							// restore the negative sign.
		// Display results on-screen:
		console.log(-g_AAcode + 'x' + -g_AAcode + ' Supersampling; NO jitter.');
		document.getElementById('AAreport').innerHTML =
		-g_AAcode + 'x' + -g_AAcode + ' Supersampling, NO jitter.';
		}
	else {		// next-higher antialiasing code, but <= G_AA_MAX
		g_AAcode = 1 + (g_AAcode % G_AA_MAX);	// 1,2,3,4,1,2,3,4, etc.
		// Display results on-screen:
		console.log('Jittered '+ g_AAcode + 'x' + g_AAcode + ' Supersampling.');
		document.getElementById('AAreport').innerHTML =
		'Jittered ' + g_AAcode + 'x' + g_AAcode + ' Supersampling.';
	}
}
function onJitterButton() {
//=============================================================================
	console.log('ON-JITTER button!!');
	g_AAcode = -g_AAcode;		// flip the sign:
	if(g_AAcode < 0) {  	// Revise on-screen report
		console.log(-g_AAcode,'x', -g_AAcode, ' Supersampling; NO jitter.');
		document.getElementById('AAreport').innerHTML =
		-g_AAcode + 'x' + -g_AAcode + ' Supersampling, NO jitter.';
		}
	else {
		console.log('Jittered ', g_AAcode, 'x', g_AAcode, ' Supersampling.');
		document.getElementById('AAreport').innerHTML =
		'Jittered ' + g_AAcode + 'x' + g_AAcode + ' Supersampling.';
	}
}

function onSceneButton() {
//=============================================================================
	console.log('ON-SCENE BUTTON!');
	if(g_SceneNum < 0 || g_SceneNum >= G_SCENE_MAX) g_SceneNum = 0;
	else g_SceneNum = g_SceneNum +1;
	document.getElementById('SceneReport').innerHTML =
  			'Show Scene Number' + g_SceneNum;
	drawAll();
}

function browserResize() {
//=============================================================================
// Called when user re-sizes their browser window , because our HTML file
// contains:  <body onload="main()" onresize="browserResize()">

	//Make a square canvas/CVV fill the SMALLER of the width/2 or height:
	if(innerWidth > 2*innerHeight) {  // fit to brower-window height
		g_canvasID.width = 2*innerHeight - 20;  // (with 20-pixel margin)
		g_canvasID.height = innerHeight - 20;   // (with 20-pixel margin_
	  }
	else {	// fit canvas to browser-window width
		g_canvasID.width = innerWidth - 20;       // (with 20-pixel margin)
		g_canvasID.height = 0.5*innerWidth - 20;  // (with 20-pixel margin)
	  }
 console.log('NEW g_canvas width,height=' +
  						g_canvasID.width + ', ' + g_canvasID .height);
 drawAll();     // re-draw browser contents using the new size.
}
