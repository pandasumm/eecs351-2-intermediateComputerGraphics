
//===============================================================================
// Vertex shader (a SIMD program in GLSL) :

var VSHADER_1SRC =							// VERTEX SHADER for VBO1 (Triangles)
  'precision highp float;\n' +				// req'd in OpenGL ES if we use 'float'
  //
  'uniform mat4 u_ModelMat1;\n' +
  'attribute vec4 a_Pos1;\n' +
  'attribute vec3 a_Colr1;\n'+
  'varying vec3 v_Colr1;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  //
  'void main() {\n' +

  '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMat1 * a_Pos1;\n' +
//   '  gl_Position = u_ProjMatrix * u_ViewMatrix * a_Pos1;\n' +
  '	 v_Colr1 = a_Colr1;\n' +
  ' }\n';

var VSHADER_2SRC =
	'precision highp float;\n' +				// req'd in OpenGL ES if we use 'float'
  //
  'attribute vec3 a_Position; \n' +				// current state: particle position
  'attribute vec3 a_Color; \n' +					// current state: particle color
  'attribute float a_PtSize; \n' +					// current state: diameter in pixels
  'varying   vec3 v_Colr2; \n' +					// (varying--send to particle
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'void main() {\n' +
//   '	 gl_Position = vec4(a_Position.x -0.9, a_Position.y -0.9, a_Position.z, 1.0);  \n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * vec4(a_Position, 1.0);\n' +
  '  gl_PointSize = a_PtSize; \n' +
  '  v_Colr2 = a_Color; \n' +
  '} \n';

//==============================================================================

var FSHADER_1SRC =
  'precision mediump float;\n' +
  'varying vec3 v_Colr1;\n' +
  'void main() {\n' +
  '  gl_FragColor = vec4(v_Colr1,1.0);\n' + // vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n';

var FSHADER_2SRC =
'precision mediump float;\n' +
  'uniform  int u_runMode; \n' +
  'uniform  int u_renderMode; \n' +
  'varying vec3 v_Colr2; \n' +
  'void main() {\n' +
  '  if(u_runMode == 0) { \n' +
	// ' vec' +
	'	   gl_FragColor = vec4(v_Colr2, 1.0);	\n' +		// red: 0==reset
	'    float dist = distance(gl_PointCoord, vec2(0.5,0.5)); \n' +
	'    if (u_renderMode == 0) {' +
	'    if(dist < 0.5) { gl_FragColor = vec4(v_Colr2, 1.0); } else {discard; } \n' +
	' }' +
	' else {' +
	'  	    gl_FragColor = vec4((2.0 - 1.5*dist)*vec4(v_Colr2, 1.0).rgb, 1.0);\n' +
	' }' +
	'  } \n' +
	'  else if(u_runMode == 1 || u_runMode == 2) {  \n' + //  1==pause, 2==step
	'    float dist = distance(gl_PointCoord, vec2(0.5,0.5)); \n' +
	'    if(dist < 0.5) { gl_FragColor = vec4(v_Colr2, 1.0); } else {discard; } \n' +
	'  }  \n' +
	'  else { \n' +
  '    float dist = distance(gl_PointCoord, vec2(0.5, 0.5)); \n' +
  '    if(dist < 0.5) { \n' +
	'  	    gl_FragColor = vec4((1.0 - 1.5*dist)*vec4(v_Colr2, 1.0).rgb, 1.0);\n' +
	'    } else { discard; }\n' +
  '  }  \n;' +
  '} \n';
