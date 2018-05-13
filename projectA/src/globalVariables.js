// Global Variables  (BAD IDEA! later, put them inside well-organized objects!)
// =============================
// for WebGL usage:
var gl; // WebGL rendering context -- the 'webGL' object
// in JavaScript with all its member fcns & data
var g_canvasID; // HTML-5 'canvas' element ID#

var floatsPerVertex = 8;

var partCount = 0;
var tonadoCount = 2000;
var boidCount = 100;
var flameCount = 5000;
var springCount = 10;

// gndVerts = new Float32Array([]);
var box_count = 17;
var circle_count = 320;

var moveDistance = 10.0;

var gravity_x = 0.0;
var gravity_y = 0.0 + moveDistance;
var gravity_z = 1.0;
var tonado_x = 0.0;
var tonado_y = 0.0 - moveDistance;
var tonado_z = 1.0;
var boid_x = 0.0 + moveDistance;
var boid_y = 0.0;
var boid_z = 1.0;
var flame_x = 0.0;
var flame_y = 0.0;
var flame_z = 1.0;
var spring_x = 0.0;
var spring_y = 0.0 + moveDistance;
var spring_z = 0.0;

var g_boid_view = 0;

makeLines();
var vbo1Array = gndVerts;

var FSIZE1 = vbo1Array.BYTES_PER_ELEMENT;
var g_BufVerts1 = vbo1Array.length / 8; // # of vertices in our first VBO in the GPU.

var g_BufID1; // 1st Vertex Buffer Object ID#, created by GPU
var g_ShaderID1; // Shader-program ID# created in main() by GPU

var myRunMode = 0; // Particle System: 0=reset; 1= pause; 2=step; 3=run
var INIT_VEL = 0.20; // avg particle speed: ++Start,--Start buttons adjust.
// Create & initialize our first, simplest 'state variable' s0:

var g_BufVerts2 = partCount + tonadoCount + boidCount + flameCount + springCount; // # of vertices in our second VBO in the GPU.
var g_BufID2; // ID# for 2nd VBO.
var g_ShaderID2;

var a_Pos1Loc; // GPU location for 'a_Pos1' attrib in Shader 1
var a_PositionLoc2; //   				... in Shader 2 (e.g. g_ShaderID2)
var a_Colr1Loc; // GPU location for 'a_Colr1' attrib in shader 1
var a_ColorLoc2; //   			... in Shader 2)
//var a_PtSizeLoc1;						  GPU location for 'a_PtSize' attrib in shader 1
var a_PtSizeLoc2;

var g_ViewMatrix = new Matrix4();
var g_ProjMatrix = new Matrix4();
var u_ModelMat1Loc; // GPU location for u_ModelMat1 uniform, Shader 1
var u_ViewMatrix;
var u_ProjMatrix;
var u_ModelMatrixLoc2; //  						... in Shader 2
var u_ViewMatrix2;
var u_ProjMatrix2;

// For animation:---------------------
var g_last = Date.now(); // Timestamp: set after each frame of animation,
var g_fps_num = 0;

var g_timeStep = 1000 / 60.0;
// For mouse/keyboard:------------------------
var g_show1 = 1;
var g_show2 = 1;
var showBox = false;

var timeStep = 1 / 60.0;
var g_drag = 0.985;
var g_rest = 0.8;

var boid_speed = 3.0;

var spring_gap = 0.0;
var springLength = 0.4;
var toSpringCount = partCount + tonadoCount + boidCount + flameCount;
var springInterval = 5;
var springRate = 20.0;

var g_ModelMatrix = new Matrix4(); // Transforms CVV drawing axes to 'model' axes.
g_ModelMatrix.setTranslate(0.0, 0.0, 0.0);
