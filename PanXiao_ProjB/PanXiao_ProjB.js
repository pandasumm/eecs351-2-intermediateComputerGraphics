var gl; // WebGL rendering context -- the 'webGL' object
// in JavaScript with all its member fcns & data
var g_canvasID; // HTML-5 'canvas' element ID#

// For the VBOs & Shaders:-----------------
preView = new VBObox1(); // For WebGLpreview: holds one VBO and its shaders
rayView = new VBObox2(); // for displaying the ray-tracing results.

var g_show1 = 1; // 0==Show, 1==Hide VBO1 contents on-screen.
//var g_show2 = 1;							  	"					"			VBO2		"				"				"

var gwidth;
var gheight;

var EyeToAtLen = 10;

var isDrag = false; // mouse-drag: true when user holds down mouse button
var xMclik = 0.0; // last mouse button-down position (in CVV coords)
var yMclik = 0.0;
var xMdragTot = 0.0; // total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot = 0.0;

//-----------Ray Tracer Objects:
//var myScene = new CScene();
//var myImg = new CImgBuf();
function main() {
    g_canvasID = document.getElementById('webgl');
    gwidth = g_canvasID.width;
    gheight = g_canvasID.height;

    browserResize();
    gl = getWebGLContext(g_canvasID);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.clearColor(0.4, 0.4, 0.4, 1);
    preView.init(gl); // VBO + shaders + uniforms + attribs for WebGL preview

    C_ImgBuf = new CImgBuf(1 * 256, 1 * 256);
    C_ImgBuf.makeRayTracedImage();
    rayView.init(gl); //  "		"		" to display ray-traced on-screen result.



    window.addEventListener("keydown", myKeyDown, false);

    var tick = function() {
        drawAll();
        requestAnimationFrame(tick, g_canvasID); // browser request: ?call tick fcni
    };
    tick();

}

function drawAll() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, // Viewport lower-left corner
                0, // (x,y) location(in pixels)
                gl.drawingBufferWidth / 2, // viewport width, height.
                gl.drawingBufferHeight);
        preView.adjust(gl);
        preView.draw(gl)

    gl.viewport(gl.drawingBufferWidth / 2, // Viewport lower-left corner
            0, // location(in pixels)
            gl.drawingBufferWidth / 2, // viewport width, height.
            gl.drawingBufferHeight);
    rayView.draw(gl);

}

var can = document.getElementById("webgl");
function browserResize() {
    w = window.innerWidth;
    h = window.innerHeight;

    if (w > 2 * h) { // fit to brower-window height
        var tw = 2 * h - 20;
        var th = h - 20;
        can.style.width = tw + "px";
        can.style.height = th + "px";
    } else { // fit canvas to browser-window width
        var tw = w - 20;
        var th = 0.5 * w - 20;
        can.style.width = tw + "px";
        can.style.height = th + "px";
    }
};


var rad = 20;
var cos0xy = ((g_AtY - g_EyeY) * (g_AtY - g_EyeY)) / (Math.sqrt((g_AtX - g_EyeX) * (g_AtX - g_EyeX) + (g_AtY - g_EyeY) * (g_AtY - g_EyeY)) * (g_AtY - g_EyeY));
var angle = Math.acos(cos0xy);
var cos0xyz = ((g_AtX - g_EyeX) * (g_AtX - g_EyeX) + (g_AtY - g_EyeY) * (g_AtY - g_EyeY)) / (Math.sqrt((g_AtX - g_EyeX) * (g_AtX - g_EyeX) + (g_AtY - g_EyeY) * (g_AtY - g_EyeY) + (g_AtZ - g_EyeZ) * (g_AtZ - g_EyeZ)) * Math.sqrt((g_AtX - g_EyeX) * (g_AtX - g_EyeX) + (g_AtY - g_EyeY) * (g_AtY - g_EyeY)));
var angleud = Math.asin(cos0xyz);
//var angleud = -180;

function crossProductX(x1, y1, z1, x2, y2, z2) {
    var x3 = y1 * z2 - z1 * y2;
    return x3;
}
function crossProductY(x1, y1, z1, x2, y2, z2) {
    var y3 = z1 * x2 - x1 * z2;
    return y3;
}
function crossProductZ(x1, y1, z1, x2, y2, z2) {
    var z3 = x1 * y2 - y1 * z2;
    return z3;
}

function myKeyDown(ev) {

    if (ev.keyCode == 39) { // The right arrow key was pressed


            g_AtY = rad * Math.cos(angle);
            g_AtX = rad * Math.sin(angle);
            angle += 0.62831853072 / 10;
        } else if (ev.keyCode == 37) { // The left arrow key was pressed
            g_AtY = rad * Math.cos(angle);
            g_AtX = rad * Math.sin(angle);
            angle -= 0.62831853072 / 10;
        } else if (ev.keyCode == 38) { // The up arrow key was pressed
            g_AtZ = rad * Math.cos(angleud);
            g_AtY = rad * Math.cos(angle) * Math.sin(angleud);
            angleud -= 0.62831853072 / 50;
        } else if (ev.keyCode == 40) { // The down arrow key was pressed
            g_AtZ = rad * Math.cos(angleud);
            g_AtY = rad * Math.cos(angle) * Math.sin(angleud);
            angleud += 0.62831853072 / 50;
        } else if (ev.keyCode == 87) { // The w arrow key was pressed
            var vx = g_AtX - g_EyeX;
            var vy = g_AtY - g_EyeY;
            var vz = g_AtZ - g_EyeZ;
            g_EyeX += 0.01 * vx;
            g_EyeY += 0.01 * vy;
            g_EyeZ += 0.01 * vz;
            g_AtX += 0.01 * vx;
            g_AtY += 0.01 * vy;
            g_AtZ += 0.01 * vz;
            moving = true;

        } else if (ev.keyCode == 83) { // The s arrow key was pressed
            var vx = g_AtX - g_EyeX;
            var vy = g_AtY - g_EyeY;
            var vz = g_AtZ - g_EyeZ;
            g_EyeX -= 0.01 * vx;
            g_EyeY -= 0.01 * vy;
            g_EyeZ -= 0.01 * vz;
            g_AtX -= 0.01 * vx;
            g_AtY -= 0.01 * vy;
            g_AtZ -= 0.01 * vz;
            moving = false;
        } else if (ev.keyCode == 65) { // The a arrow key was pressed
            var cx = crossProductX(g_AtX - g_EyeX, g_AtY - g_EyeY, 0, 0, 0, -3);
            var cy = crossProductY(g_AtX - g_EyeX, g_AtY - g_EyeY, 0, 0, 0, -3);
            var cz = crossProductZ(g_AtX - g_EyeX, g_AtY - g_EyeY, 0, 0, 0, -3);
            g_EyeX += 0.002 * cx; // INCREASED for perspective camera)
            g_AtX += 0.002 * cx;
            g_EyeY += 0.002 * cy;
            g_AtY += 0.002 * cy;

        } else if (ev.keyCode == 68) { // The d arrow key was pressed
            var cx = crossProductX(g_AtX - g_EyeX, g_AtY - g_EyeY, 0, 0, 0, -3);
            var cy = crossProductY(g_AtX - g_EyeX, g_AtY - g_EyeY, 0, 0, 0, -3);
            var cz = crossProductZ(g_AtX - g_EyeX, g_AtY - g_EyeY, 0, 0, 0, -3);
            g_EyeX -= 0.002 * cx; // INCREASED for perspective camera)
            g_AtX -= 0.002 * cx;
            g_EyeY -= 0.002 * cy;
            g_AtY -= 0.002 * cy;
        } else if (ev.keyCode == 84) { // The t key was pressed
            C_ImgBuf.clearfBuf();
            C_ImgBuf.makeRayTracedImage();
            rayView.init(gl);
            // break;
        } else {
            return;
        }
    }

function antiAliasing(jitterValue) {
    jitterAmt = jitterValue;
    C_ImgBuf.clearfBuf();
    C_ImgBuf.makeRayTracedImage();
    rayView.init(gl);
}

function increaseDepth() {
    if (globalRecursionDepth < 10) {
        globalRecursionDepth += 1;
    }

    C_ImgBuf.clearfBuf();
    C_ImgBuf.makeRayTracedImage();
    rayView.init(gl);
    console.log("recursion depth: " + globalRecursionDepth);
    document.getElementById("Recursion_Depth").innerHTML = globalRecursionDepth.toString();
}

function decreaseDepth() {
    if (globalRecursionDepth > 0) {
        globalRecursionDepth -= 1;
    }
    C_ImgBuf.clearfBuf();
    C_ImgBuf.makeRayTracedImage();
    rayView.init(gl);
    console.log("recursion depth: " + globalRecursionDepth);
    document.getElementById("Recursion_Depth").innerHTML = globalRecursionDepth.toString();
}
