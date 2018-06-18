
function CImgBuf(wide, tall) {
//==============================================================================
// Construct an 'image-buffer' object to hold a floating-point ray-traced image.
//  Contains BOTH
//	iBuf -- 2D array of 8-bit RGB pixel values we can display on-screen, AND
//	fBuf -- 2D array of floating-point RGB pixel values we often CAN'T display,
//          but contains full-precision results of ray-tracing.
//			--Both buffers hold the same numbers of pixel values (xSiz,ySiz,pixSiz)
//			--imgBuf.int2float() copies/converts current iBuf contents to fBuf
//			--imgBuf.float2int() copies/converts current fBuf contents to iBuf
//	WHY?
//	--Our ray-tracer computes floating-point light amounts(e.g. radiance L)
//    but neither our display nor our WebGL texture-map buffers can accept
//		images with floating-point pixel values.
//	--You will NEED all those floating-point values for applications such as
//    environment maps (re-lighting from sky image) and lighting simulations.
// Stay simple in early versions of your ray-tracer: keep 0.0 <= RGB < 1.0,
// but later you can modify your ray-tracer
// to use radiometric units of Radiance (watts/(steradians*meter^2), or convert
// to use photometric units of luminance (lumens/(steradians*meter^2 or cd/m^2)
// to compute in physically verifiable units of visible light.

	this.xSiz = wide;							// image width in pixels
	this.ySiz =	tall;							// image height in pixels
	this.pixSiz = 3;							// pixel size (3 for RGB, 4 for RGBA, etc)
	this.iBuf = new Uint8Array(  this.xSiz * this.ySiz * this.pixSiz);
	this.fBuf = new Float32Array(this.xSiz * this.ySiz * this.pixSiz);
}

CImgBuf.prototype.setTestPattern = function(pattNum) {
//==============================================================================
// Replace current 8-bit RGB contents of 'imgBuf' with a colorful pattern
	// 2D color image:  8-bit unsigned integers in a 256*256*3 array
	// to store r,g,b,r,g,b integers (8-bit)
	// In WebGL texture map sizes MUST be a power-of-two (2,4,8,16,32,64,...4096)
	// with origin at lower-left corner
	// (NOTE: this 'power-of-two' limit will probably vanish in a few years of
	// WebGL advances, just as it did for OpenGL)

  // use local vars to set the array's contents.
  console.log();
  for(var j=0; j< this.ySiz; j++) {						// for the j-th row of pixels
  	for(var i=0; i< this.xSiz; i++) {					// and the i-th pixel on that row,
	  	var idx = (j*this.xSiz + i)*this.pixSiz;// Array index at pixel (i,j)
	  	switch(pattNum) {
	  		case 0:	//================(Colorful L-shape)============================
			  	if(i < this.xSiz/4 || j < this.ySiz/4) {
			  		this.iBuf[idx   ] = i;								// 0 <= red <= 255
			  		this.iBuf[idx +1] = j;								// 0 <= grn <= 255
			  	}
			  	else {
			  		this.iBuf[idx   ] = 0;
			  		this.iBuf[idx +1] = 0;
			  		}
			  	this.iBuf[idx +2] = 255 -i -j;								// 0 <= blu <= 255
			  	break;
			  case 1: //================(bright orange)===============================
			  	this.iBuf[idx   ] = 255;	// bright orange
			  	this.iBuf[idx +1] = 128;
			  	this.iBuf[idx +2] =   0;
	  			break;
	  		default:
	  			console.log("imgBuf.setTestPattern() says: WHUT!?");
	  		break;
	  	}
  	}
  }
  this.int2float();		// fill the floating-point buffer with same test pattern.
}

CImgBuf.prototype.int2float = function() {
//==============================================================================
// Convert the integer RGB image in iBuf into floating-point RGB image in fBuf
for(var j=0; j< this.ySiz; j++) {		// for each scanline
  	for(var i=0; i< this.xSiz; i++) {		// for each pixel on that scanline
  		var idx = (j*this.xSiz + i)*this.pixSiz;// Find array index at pixel (i,j)
			// convert integer 0 <= RGB <= 255 to floating point 0.0 <= R,G,B <= 1.0
  		this.fBuf[idx   ] = this.iBuf[idx   ] / 255.0;	// red
  		this.fBuf[idx +1] = this.iBuf[idx +1] / 255.0;	// grn
  		this.fBuf[idx +2] = this.iBuf[idx +2] / 255.0;	// blu
  	}
  }
}

CImgBuf.prototype.float2int = function() {
//==============================================================================
// Convert the floating-point RGB image in fBuf into integer RGB image in iBuf
for(var j=0; j< this.ySiz; j++) {		// for each scanline
  	for(var i=0; i< this.xSiz; i++) {	// for each pixel on that scanline
  		var idx = (j*this.xSiz + i)*this.pixSiz;// Find array index at pixel (i,j)
			// find 'clamped' color values that stay >=0.0 and <=1.0:
  		var rval = Math.min(1.0, Math.max(0.0, this.fBuf[idx   ]));
  		var gval = Math.min(1.0, Math.max(0.0, this.fBuf[idx +1]));
  		var bval = Math.min(1.0, Math.max(0.0, this.fBuf[idx +2]));
			// Divide [0,1] span into 256 equal-sized parts:  Math.floor(rval*256)
			// In the rare case when rval==1.0 you get unwanted '256' result that
			// won't fit into the 8-bit RGB values.  Fix it with Math.min():
  		this.iBuf[idx   ] = Math.min(255,Math.floor(rval*256.0));	// red
  		this.iBuf[idx +1] = Math.min(255,Math.floor(gval*256.0));	// grn
  		this.iBuf[idx +2] = Math.min(255,Math.floor(bval*256.0));	// blu

  	}
  }
}

CImgBuf.prototype.printPixAt = function(xpix,ypix) {
//==============================================================================
// Use console.log() to print the integer and floating-point values (R,B,B,...)
// stored in our CImgBuf object for the pixel at (xpix,ypix)
		//
		//
		//		YOU WRITE THIS
		//
		//
	if(name == undefined) name = ' ';

		console.log('CImgBuf::' + this.constructor.name + '.xpix:\t' + this.xpix[0] +',\t'+ this.xpix[1] +',\t'+ this.xpix[2]);
		console.log('     ', + this.constructor.name + '.ypix:\t' + this.ypix[0] +',\t'+  this.ypix[1] + '\t'+  this.ypix[2]);

}
antialiasing = false;

function CShadowRay(Orig,Dir){
  this.orig = Orig;   // Ray starting point (x,y,z,w)
                                            // (default: at origin
  this.dir =  Dir;     // The ray's direction vector
                                            // (default: look down -z axis)
}

//var lamp0 = new LightsT();
//var lamp1 = new LightsT();

function CLight(lampInd){
  /*lamp0.I_pos.elements.set( [-6, 0, -2]);

  lamp0.I_ambi.elements.set([0.4, 0.4, 0.4]);
  lamp0.I_diff.elements.set([1.0, 1.0, 1.0]);
  lamp0.I_spec.elements.set([1.0, 1.0, 1.0]);*/

 ////
 //console.log(lamp0.I_pos.elements[0])
 this.I_pos = vec4.create();
 this.I_ambi = vec4.create();
 this.I_diff = vec4.create();
 this.I_spec = vec4.create();
 switch(lampInd){
  case 0:
    if(g_show1){
      this.I_pos = vec4.fromValues(lamp0.I_pos.elements[0], lamp0.I_pos.elements[1], lamp0.I_pos.elements[2],1.0);
      //this.I_pos = vec4.fromValues(0, -5, lamp0.I_pos.elements[2],1.0);
      this.I_ambi = vec4.fromValues(lamp0.I_ambi.elements[0], lamp0.I_ambi.elements[1], lamp0.I_ambi.elements[2],1.0);
      this.I_diff = vec4.fromValues(lamp0.I_diff.elements[0], lamp0.I_diff.elements[1], lamp0.I_diff.elements[2],1.0);
      this.I_spec = vec4.fromValues(lamp0.I_spec.elements[0], lamp0.I_spec.elements[1], lamp0.I_spec.elements[2],1.0);
    }else{
      this.I_pos  = vec4.fromValues(lamp2.I_pos.elements[0], lamp2.I_pos.elements[1], lamp2.I_pos.elements[2],1.0);
      this.I_ambi = vec4.fromValues(lamp2.I_ambi.elements[0], lamp2.I_ambi.elements[1], lamp2.I_ambi.elements[2],1.0);
      this.I_diff = vec4.fromValues(lamp2.I_diff.elements[0], lamp2.I_diff.elements[1], lamp2.I_diff.elements[2],1.0);
      this.I_spec = vec4.fromValues(lamp2.I_spec.elements[0], lamp2.I_spec.elements[1], lamp2.I_spec.elements[2],1.0);

    }

  break;
  case 1:
  if(g_show1){
      this.I_pos = vec4.fromValues(lamp1.I_pos.elements[0], lamp1.I_pos.elements[1], lamp1.I_pos.elements[2],1.0);
      //this.I_pos = vec4.fromValues(0, -5, lamp0.I_pos.elements[2],1.0);
      this.I_ambi = vec4.fromValues(lamp1.I_ambi.elements[0], lamp1.I_ambi.elements[1], lamp1.I_ambi.elements[2],1.0);
      this.I_diff = vec4.fromValues(lamp1.I_diff.elements[0], lamp1.I_diff.elements[1], lamp1.I_diff.elements[2],1.0);
      this.I_spec = vec4.fromValues(lamp1.I_spec.elements[0], lamp1.I_spec.elements[1], lamp1.I_spec.elements[2],1.0);
  }else{
      this.I_pos = vec4.fromValues(lamp3.I_pos.elements[0], lamp3.I_pos.elements[1], lamp3.I_pos.elements[2],1.0);
      this.I_ambi = vec4.fromValues(lamp3.I_ambi.elements[0], lamp3.I_ambi.elements[1], lamp3.I_ambi.elements[2],1.0);
      this.I_diff = vec4.fromValues(lamp3.I_diff.elements[0], lamp3.I_diff.elements[1], lamp3.I_diff.elements[2],1.0);
      this.I_spec = vec4.fromValues(lamp3.I_spec.elements[0], lamp3.I_spec.elements[1], lamp3.I_spec.elements[2],1.0);
  }
  break;
 }

  this.PtColor = vec4.create();
}

CLight.prototype.LightOn = function(CHit, myCamera) {

  vPos = vec4.fromValues(CHit.HitX, CHit.HitY, CHit.HitZ,1.0);
  //vPos = vec4.fromValues(myGeom.hitPtWorld[0], myGeom.hitPtWorld[1], myGeom.hitPtWorld[2],1.0);
  //ePos = vec4.fromValues(g_EyeX, g_EyeX, g_EyeX,1.0);
  ePos = myCamera.eyePt;
  //console.log()

  //normal = normalize(CHit.surfNorm);
  normal = vec4.create();

  vec4.normalize(normal,CHit.surfNorm);
  //normal[3] = 0;
  //console.log(normal);

  this.applyMat(CHit.JTObj,CHit.hitPtModel);

  this.emissive = vec4.create();
  this.ambient = vec4.create();
  this.diffuse = vec4.create();
  this.speculr = vec4.create();


  this.lightDirection           = vec4.create();
  this.eyeDirection             = vec4.create();
  this.nDotL                    = 0;
  this.H                        = vec4.create();
  this.nDotH                    = 0;
  this.e64                      = 0;
  this.lightreflectionDirection = vec4.create();
  this.phongSpecular            = 0;


  vec4.subtract(this.lightDirection, this.I_pos, vPos);
  vec4.subtract(this.eyeDirection, ePos, vPos);
  //console.log(this.eyeDirection);

  //negEyeRayDir = vec4.create();
  //vec4.negate(negEyeRayDir, CHit.modRay.dir);

  vec4.normalize(this.lightDirection, this.lightDirection);
  vec4.normalize(this.eyeDirection, this.eyeDirection);

  //console.log(this.lightDirection)

  nDotLTemp = vec4.create();
  vec4.add(nDotLTemp, this.lightDirection,this.eyeDirection)
  nDotLTempdotsurfNorm = vec4.dot(nDotLTemp, normal);
  this.nDotL = Math.max(nDotLTempdotsurfNorm,0);
  //this.nDotL = Math.max(vec4.dot(this.lightDirection, normal),0);
  //console.log(nDotL)
  //vec4.normalize(this.H, nDotLTemp)

  //this.nDotH = Math.max(vec4.dot(this.H, normal),0.0);

  //this.e64 = Math.pow(this.nDotH, this.K_Shiny);

  this.neglightDirection = vec4.create();
  vec4.negate(this.neglightDirection, this.lightDirection);
  this.lightreflectionDirection = reflect(this.neglightDirection, normal)
  this.phongSpecular = Math.max(vec4.dot(this.lightreflectionDirection, this.eyeDirection),0.0);


  vec4.copy(this.emissive, this.K_e);
  vec4.multiply(this.ambient, this.I_ambi, this.K_a);

  vec4.multiply(this.diffuse, this.I_diff, this.K_d);
  vec4.scale(this.diffuse,this.diffuse,this.nDotL);


  vec4.multiply(this.speculr, this.I_spec, this.K_s);
  vec4.scale(this.speculr,this.speculr, Math.pow(this.phongSpecular, 6.0));

  vec4.add4(this.PtColor, this.emissive, this.ambient, this.diffuse, this.speculr);


}

function reflect(b, n){
  NL = vec4.dot(b, n)
  C = vec4.create();
  vec4.scale(C, n, NL);

  C2 = vec4.create();
  vec4.scale(C2, C, 2);

  R = vec4.create();
  vec4.subtract(R,b, C2);

  return R;
}

const materials_Ayerdi = 0;
const materials_wood = 1;
const materials_checkerboard = 2;

CLight.prototype.applyMat = function(shapeType,hitPtWorld) {
  //t is the JT_Object index;
  var materials;
  if(g_show1){
    switch(shapeType){
      case JT_GNDPLANE:
        matlSel = (1)%MATL_DEFAULT;    // see materials_Ayerdi.js for list
        matl0 = new Material(matlSel);          // REPLACE our current material, &
        materials = materials_Ayerdi;
      break;

      case JT_SPHERE:
        matlSel = (2)%MATL_DEFAULT;    // see materials_Ayerdi.js for list
        matl0 = new Material(matlSel);          // REPLACE our current material, &
        materials = materials_Ayerdi;
        //matlSel = (3)%MATL_DEFAULT;    // see materials_Ayerdi.js for list
        //matl0 = new Material(matlSel);          // REPLACE our current material, &
      break;

      case JT_SPHERE3:
        matlSel = (4)%MATL_DEFAULT;    // see materials_Ayerdi.js for list
        matl0 = new Material(matlSel);          // REPLACE our current material, &
        materials = materials_Ayerdi;
        //matlSel = (3)%MATL_DEFAULT;    // see materials_Ayerdi.js for list
        //matl0 = new Material(matlSel);          // REPLACE our current material, &

      break;
      case JT_SPHERE4:
        matlSel = (3)%MATL_DEFAULT;    // see materials_Ayerdi.js for list
        matl0 = new Material(matlSel);          // REPLACE our current material, &
        materials = materials_Ayerdi;
      break;
      case JT_BOX:
        matlSel = (6)%MATL_DEFAULT;    // see materials_Ayerdi.js for list
        matl0 = new Material(matlSel);          // REPLACE our current material, &
        materials = materials_Ayerdi;
        // materials = materials_wood;
        break;

    }
  }

  this.K_e1 = matl0.K_emit;
  this.K_a1 = matl0.K_ambi;
      //console.log(this.K_a)
  this.K_d1 = matl0.K_diff;
  this.K_s1 = matl0.K_spec;
  this.K_Shiny = matl0.K_shiny;


  this.K_e = vec4.fromValues(this.K_e1[0],this.K_e1[1],this.K_e1[2],1);
  this.K_a = vec4.fromValues(this.K_a1[0],this.K_a1[1],this.K_a1[2],1);
  this.K_s = vec4.fromValues(this.K_s1[0],this.K_s1[1],this.K_s1[2],1);

  if(materials == materials_Ayerdi){
    this.K_d = vec4.fromValues(this.K_d1[0],this.K_d1[1],this.K_d1[2],1);

  }else if(materials == materials_wood){
    this.K_d = vec4.fromValues(this.K_d1[0],this.K_d1[1],this.K_d1[2],1);

    r = Math.sqrt(Math.pow(hitPtWorld[0]/Math.pow(0.4,3),2), Math.pow(hitPtWorld[1]/Math.pow(0.4,3),2))

    ran = 2 * (Math.random() + 1);
    //r = 5.0 * turbulence(r,0.0125)
    //r = r + ran;
        //r = Math.sqrt
    b = 0.5 * (1 + Math.sin(r));

    mat1 = vec4.fromValues(104/255,58/255,16/255);
    mat2 = vec4.fromValues(146/255,106/255,68/255);

    vec4.scale(this.K_d, mat1, b);
    colorHelper = vec4.create();
    vec4.scale(colorHelper, mat2, 1-b);
    vec4.add(this.K_d,this.K_d,colorHelper)

  }else if(materials == materials_checkerboard){
    this.K_d = vec4.fromValues(this.K_d1[0],this.K_d1[1],this.K_d1[2],1);
    gapColor = vec4.fromValues(1,1,1,1);

    tot = Math.floor(hitPtWorld[0]/2) + Math.floor(hitPtWorld[1]/2) + Math.floor(hitPtWorld[2]/0.3);
    y = tot%2;
    if(y<0){
      y = -y;
    }
    if(y > 0.5){
      vec4.copy(this.K_d,this.K_d);
    }else{
      matlSel = (9)%MATL_DEFAULT;    // see materials_Ayerdi.js for list
      matl0 = new Material(matlSel);          // REPLACE our current material, &
      this.K_d1 = matl0.K_diff;
      this.K_d = vec4.fromValues(this.K_d1[0],this.K_d1[1],this.K_d1[2],1);
      //vec4.copy(this.K_d,gapColor);
    }

  }

}

var perm = new Array(512);
var gradP = new Array(512);

function Grad(x, y, z) {
    this.x = x; this.y = y; this.z = z;
  }

  Grad.prototype.dot2 = function(x, y) {
    return this.x*x + this.y*y;
  };

  Grad.prototype.dot3 = function(x, y, z) {
    return this.x*x + this.y*y + this.z*z;
  };


function turbulence(pos,pixel_size){
  x = 0;
  scale = 1;
  while(scale>pixel_size){
    pos = pos/scale;
    x = x + noise(pos)*scale;
    scale = scale/2;
  }
  return pos;
}

function noise(a){
  return a * (Math.random());

}


CImgBuf.prototype.findPtValue = function(HitList, myGeom, myCamera) {
  //t is the JT_Object index;
  //CHit(JT_obj,hitPtWorld,hitPtModel,color,hitTime)

  var gapAmt = jitterAmt * jitterAmt - HitList.length;
  //console.log(gapAmt);
  var PtColor = vec4.create();
  var PtHitPtWorld = vec4.create();
  var PtHitPtModel = vec4.create();
  var PtHitTime = 0;
  var PtJT_obj = 0;
  var PtSurfNorm = vec4.create();
  var PtWldRay = vec4.create();
  var PtModRay = vec4.create();
  vec4.scale(PtColor, myGeom.gapColor, gapAmt);
  var PtColorHit = vec4.create();


  for (var i = 0; i < HitList.length; i++){
    myCScene = new CScene();
    recursionDepth = globalRecursionDepth;
    //vec4.copy(HitList[i].ObjColor, myCScene.findShade(HitList[i],myCamera));
    //myCScene.findShade(HitList[i],myCamera)
    //vec4.add(PtColor, PtColor, HitList[i].ObjColor);

    vec4.add(PtHitPtWorld, PtHitPtWorld, HitList[i].hitPtWorld);
    vec4.add(PtHitPtModel, PtHitPtModel, HitList[i].hitPtModel);
    PtHitTime = PtHitTime + HitList[i].t0;
    //console.log(HitList[i].t0)
    PtJT_obj = PtJT_obj + HitList[i].JTObj;
    vec4.add(PtSurfNorm, PtSurfNorm, HitList[i].surfNorm);
    vec4.add(PtWldRay, PtWldRay, HitList[i].wldRay);
    vec4.add(PtModRay, PtModRay, HitList[i].modRay);


  }

  //vec4.add(PtColor,PtColor,PtColorHit);
  //vec4.divideScale(PtColor,PtColor,jitterAmt * jitterAmt);



  // vec4.divideScale(PtColor,PtColor,jitterAmt * jitterAmt);
  //console.log(PtColor);

  vec4.divideScale(PtHitPtWorld,PtHitPtWorld,HitList.length);
  vec4.divideScale(PtHitPtModel,PtHitPtModel,HitList.length);
  vec4.divideScale(PtSurfNorm,PtSurfNorm,HitList.length);
  vec4.divideScale(PtWldRay,PtWldRay,HitList.length);
  vec4.divideScale(PtModRay,PtModRay,HitList.length);
  //vec4.divideScale(lamp0ClrTemp,lamp0ClrTemp,HitList.length);
  //vec4.divideScale(lamp1ClrTemp,lamp1ClrTemp,HitList.length);
  //console.log(PtHitPtWorld);
  PtHitTime = PtHitTime / HitList.length;
  //console.log(PtHitTime);

  PtJT_obj = HitList[0].JTObj;

  //console.log(PtColor);

  CHitObj = new CHit(PtJT_obj, PtHitPtWorld, PtHitPtModel, PtColor, PtHitTime, PtSurfNorm, PtWldRay ,PtModRay);
  CHitObj.jitterList = HitList
  //CHitObj = new CHit(HitList[0].JTObj, HitList[0].hitPtWorld, HitList[0].hitPtModel, HitList[0].ObjColor, HitList[0].t0);
  //vec4.copy(CHitObj.lamp0Clr, lamp0ClrTemp);
  //vec4.copy(CHitObj.lamp1Clr, lamp1ClrTemp);
  return CHitObj;

}

var Light1On = true;
var Light2On = true;

var jitterAmt = 1;


CImgBuf.prototype.clearfBuf = function() {
  for(var j=0; j< this.ySiz; j ++) {            // for the j-th row of pixels
    for(var i=0; i< this.xSiz; i ++) {          // and the i-th pixel on that row,
      var idx = (j*this.xSiz + i)*this.pixSiz;  // Array index at pixel (i,j)
      this.fBuf[idx   ] = 0;//*div*div;  // bright blue
      this.fBuf[idx +1] = 0;//*div*div;
      this.fBuf[idx +2] = 0;//*div*div;
    }
  }
}

var globalRecursionDepth = 1;
CImgBuf.prototype.makeRayTracedImage = function() {
//==============================================================================
// TEMPORARY!!!!
// THIS FUNCTION SHOULD BE A MEMBER OF YOUR CScene OBJECTS (when you make them),
// and NOT a member of CImgBuf OBJECTS!
//
// Create an image by Ray-tracing.   (called when you press 'T' or 't')
console.log("tracing start!");
  var eyeRay = new CRay();	// the ray we trace from our camera for each pixel
  var myCam = new CCamera();	// the 3D camera that sets eyeRay values

  myCam.rayLookAt(g_EyeX, g_EyeY, g_EyeZ, g_AtX, g_AtY, g_AtZ, 0, 0, 1);

	var hit = 0;

  var div = 1/jitterAmt;
	//console.log("gets to makeRayTracedImage: " + this.ySiz);
  for(var j=0; j< this.ySiz; j ++) {						// for the j-th row of pixels
  	for(var i=0; i< this.xSiz; i ++) {					// and the i-th pixel on that row,
	  	var idx = (j*this.xSiz + i)*this.pixSiz;	// Array index at pixel (i,j)


                  // create ray for pixel (i,j)
      myCam.setEyeRay(eyeRay,i,j);
      myCScene = new CScene();
      nearestHitPt = myCScene.traceRay(eyeRay, myCam, this, div, i, j);


        //console.log(nearestHitPt == myHitList.HitList[0])
        //if (myHitList.HitList.length > 0){
        if (nearestHitPt != 0){
          //recursionDepth = 2;
          //myCScene.findShade(nearestHitPt, myCam);
          //nearestHitPt = nearestHitPt;
          this.fBuf[idx   ] = nearestHitPt.ObjColor[0];//*div*div;  // bright blue
          this.fBuf[idx +1] = nearestHitPt.ObjColor[1];//*div*div;
          this.fBuf[idx +2] = nearestHitPt.ObjColor[2];//*div*div;


          //this.RayTraceShadow(eyeRay, myHitList.HitList[0].HitX,myHitList.HitList[0].HitY,myHitList.HitList[0].HitZ);
          //shadeing = this.shade;

          //console.log(myHitList.HitList[0].ObjColor)
        }else{
            this.fBuf[idx   ] = mygapColor[0];  // bright blue
            this.fBuf[idx +1] = mygapColor[1];
            this.fBuf[idx +2] = mygapColor[2];//*div*div;



        }

      }
  	}
  this.float2int();		// create integer image from floating-point buffer.
  //console.log(this.fBuf);
}



function sortHitt0(a,b){
  if(a.t0 < b.t0){
    return -1;
  }else{
    return 1;
  }

}
