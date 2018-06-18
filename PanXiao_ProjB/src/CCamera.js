function CRay() {
//==============================================================================
// Object for a ray in an unspecified coord. system (usually 'world' coords).
	this.orig = vec4.fromValues(0,0,0,1);			// Ray starting point (x,y,z,w)
																						// (default: at origin
	this.dir = 	vec4.fromValues(0,0,5,0);			// The ray's direction vector
																						// (default: look down -z axis)

}

CRay.prototype.printMe = function() {
//==============================================================================
// print ray's values in the console window:

	if(name == undefined) name = ' ';

	console.log('CRay::' + this.constructor.name + '.origin:\t' + this.orig[0]
	+',\t'+ this.orig[1] +',\t'+ this.orig[2] +',\t'+ this.orig[3]);
	console.log('     ', + this.constructor.name + '.direction:\t' + this.dir[0]
	+',\t'+  this.dir[1] + '\t'+  this.dir[2] +',\t'+ this.dir[3]);
}

function CCamera() {

	this.eyePt = vec4.fromValues(0,0,0,1);
	this.uAxis = vec4.fromValues(1,0,0,0);	// camera U axis == world x axis
  this.vAxis = vec4.fromValues(0,1,0,0);	// camera V axis == world y axis
  this.nAxis = vec4.fromValues(0,0,1,0);	// camera N axis == world z axis.

  this.rayFrustum(Math.tan(15),-Math.tan(15), -1, 1, 1,1);

	this.xmax = 256;			// horizontal,
	this.ymax = 256;			// vertical image resolution.

	this.ufrac = (this.iRight - this.iLeft) / this.xmax;	// pixel tile's width
	this.vfrac = (this.iTop   - this.iBot ) / this.ymax;	// pixel tile's height.
}

CCamera.prototype.rayFrustum = function(left, right, bottom, top, near) {

  this.iNear = near;
  this.iLeft = left;
  this.iRight = right;
  this.iBot =  bottom;
  this.iTop =   top;

}

CCamera.prototype.setEyeRay = function(myeRay, xpos, ypos) {
//==============================================================================
// Set values of a CRay object to specify a ray in world coordinates that
// originates at the camera's eyepoint (its center-of-projection: COP) and aims
// in the direction towards the image-plane location (xpos,ypos) given in units
// of pixels.  The ray's direction vector is *NOT* normalized.
//
// !CAREFUL! Be SURE you understand these floating-point xpos,ypos arguments!
// For the default CCamera (+/-45 degree FOV, xmax,ymax == 256x256 resolution)
// the function call makeEyeRay(0,0) creates a ray to the image rectangle's
// lower-left-most corner at U,V,N = (iLeft,iBot,-1), and the function call
// makeEyeRay(256,256) creates a ray to the image rectangle's upper-left-most
// corner at U,V,N = (iRight,iTop,-1).
//	To get the eye ray for pixel (x,y), DON'T call setEyeRay(myRay, x,y);
//                                   instead call setEyeRay(myRay,x+0.5,y+0.5)
// (Later you will trace multiple eye-rays per pixel to implement antialiasing)
// WHY?
//	-- because the half-pixel offset (x+0.5, y+0.5) traces the ray through the
//     CENTER of the pixel's tile, and not its lower-left corner.
// As we learned in class (and from optional reading "A Pixel is Not a Little
// Square" by Alvy Ray Smith), a pixel is NOT a little square -- it is a
// point-like location, one of many in a grid-like arrangement, where we store
// a neighborhood summary of an image's color(s).  While we could (and often
// do) define that pixel's 'neighborhood' as a small tile of the image plane,
// and summarize its color as the tile's average color, it is not our only
// choice and certainly not our best choice.
// (ASIDE: You can dramatically improve the appearance of a digital image by
//     making pixels  that summarize overlapping tiles by making a weighted
//     average for the neighborhood colors, with maximum weight at the pixel
//     location, and with weights that fall smoothly to zero as you reach the
//     outer limits of the pixel's tile or 'neighborhood'. Google: antialiasing
//     bilinear filter, Mitchell-Netravali piecewise bicubic prefilter, etc).

// Convert image-plane location (xpos,ypos) in the camera's U,V,N coords:
var posU = this.iLeft + xpos*this.ufrac; 	// U coord,
var posV = this.iBot  + ypos*this.vfrac;	// V coord,

 xyzPos = vec4.create();    // make vector 0,0,0,0.
	vec4.scaleAndAdd(xyzPos, xyzPos, this.uAxis, posU); // xyzPos += Uaxis * posU;
	vec4.scaleAndAdd(xyzPos, xyzPos, this.vAxis, posV); // xyzPos += Vaxis * posU;
  vec4.scaleAndAdd(xyzPos, xyzPos, this.nAxis, -this.iNear);

	vec4.copy(myeRay.orig, this.eyePt);
	vec4.copy(myeRay.dir, xyzPos);
}



CCamera.prototype.makeEyeRay = function(PxOrig, xSize, ySize, pixSize) {

  this.PxRayList = [];

  for(var j=0; j< ySize; j ++) {            // for the j-th row of pixels
    for(var i=0; i< xSize; i ++) {          // and the i-th pixel on that row,
      var idx = (j*xSize + i)*pixSize;  // Array index at pixel (i,j)

      xpos = i;
      ypos = j;

      var posU = this.iLeft + xpos*this.ufrac;  // U coord,
      var posV = this.iBot  + ypos*this.vfrac;  // V coord,

      xyzPos = vec4.create();    // make vector 0,0,0,0.
      vec4.scaleAndAdd(xyzPos, xyzPos, this.uAxis, posU); // xyzPos += Uaxis * posU;
      vec4.scaleAndAdd(xyzPos, xyzPos, this.vAxis, posV); // xyzPos += Vaxis * posU;
      vec4.scaleAndAdd(xyzPos, xyzPos, this.nAxis, -this.iNear);

      ray = new CRay()
      vec4.copy(ray.orig, PxOrig);
      vec4.copy(ray.dir, xyzPos);

      this.PxRayList.push(ray);
    }
  }
}



CCamera.prototype.printMe = function() {
//==============================================================================
// print CCamera object's current contents in console window:
	//
	// YOU WRITE THIS (see CRay.prototype.printMe() function above)
	//
	if(name == undefined) name = ' ';

		console.log('CCamera::' + this.constructor.name + '.eye-point:\t' + this.eyePt[0] +',\t'+ this.eyePt[1] +',\t'+ this.eyePt[2] +',\t'+ this.eyePt[3]);
		console.log('     ', + this.constructor.name + '.Camera U axis:\t' + this.uAxis[0] +',\t'+  this.uAxis[1] + '\t'+  this.uAxis[2] +',\t'+ this.uAxis[3]);
		console.log('     ', + this.constructor.name + '.Camera V axis:\t' + this.vAxis[0] +',\t'+  this.vAxis[1] + '\t'+  this.vAxis[2] +',\t'+ this.vAxis[3]);
		console.log('     ', + this.constructor.name + '.Camera N axis:\t' + this.nAxis[0] +',\t'+  this.nAxis[1] + '\t'+  this.nAxis[2] +',\t'+ this.nAxis[3]);

}

CCamera.prototype.rayLookAt = function(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
	var fx, fy, fz, rlf, sx, sy, sz, rls, ux, uy, uz;
	fx = centerX - eyeX;
  	fy = centerY - eyeY;
  	fz = centerZ - eyeZ;
  	//eyeY = eyeY + 1.35;
  	//eyeX = eyeX + 1.35;
  	// Normalize f.
  rlf = 1 / Math.sqrt(fx*fx + fy*fy + fz*fz);
  fx *= rlf;
  fy *= rlf;
  fz *= rlf;

   // Calculate cross product of f and up.
  sx = fy * upZ - fz * upY;
  sy = fz * upX - fx * upZ;
  sz = fx * upY - fy * upX;

  // Normalize s.
  rls = 1 / Math.sqrt(sx*sx + sy*sy + sz*sz);
  sx *= rls;
  sy *= rls;
  sz *= rls;

  // Calculate cross product of s and f.
  ux = sy * fz - sz * fy;
  uy = sz * fx - sx * fz;
  uz = sx * fy - sy * fx;

  this.uAxis[0] = sx;
  this.uAxis[1] = sy;
  this.uAxis[2] = sz;

  this.vAxis[0] = ux;
  this.vAxis[1] = uy;
  this.vAxis[2] = uz;

  this.nAxis[0] = -fx;
  this.nAxis[1] = -fy;
  this.nAxis[2] = -fz;

  this.eyePt[0] = eyeX; // + 0.8;
  this.eyePt[1] = eyeY; // + 0.8;
  this.eyePt[2] = eyeZ; // - 0.45;

  //console.log(this.eyePt);
}



// pandasumm
/*
function CRay() {
    //=============================================================================
    // Object for a ray in an unspecified coord. system (usually 'world' coords).
    this.orig = vec4.fromValues(0, 0, 0, 1); // Ray starting point (x,y,z,w)
    // (default: at origin
    this.dir = vec4.fromValues(0, 0, -1, 0); // The ray's direction vector
    // (default: look down -z axis)
}

CRay.prototype.printMe = function() {
    //=============================================================================
    // print ray's values in the console window:
    if (name == undefined)
        name = ' ';

    console.log('CRay::' + this.constructor.name + '.origin:\t' + this.orig[0] + ',\t' + this.orig[1] + ',\t' + this.orig[2] + ',\t' + this.orig[3]);
    console.log('     ', + this.constructor.name + '.direction:\t' + this.dir[0] + ',\t' + this.dir[1] + '\t' + this.dir[2] + ',\t' + this.dir[3]);
}

function CCamera() {
    this.eyePt = vec4.fromValues(0, 0, 0, 1);
    this.uAxis = vec4.fromValues(1, 0, 0, 0); // camera U axis == world x axis
    this.vAxis = vec4.fromValues(0, 1, 0, 0); // camera V axis == world y axis
    this.nAxis = vec4.fromValues(0, 0, 1, 0); // camera N axis == world z axis.

    this.iNear = 1.0;
    this.iLeft = -1.0;
    this.iRight = 1.0;
    this.iBot = -1.0;
    this.iTop = 1.0;
    // And the lower-left-most corner of the image is at (u,v,n) = (iLeft,iBot,-1).
    this.xmax = 256; // horizontal,
    this.ymax = 256; // vertical image resolution.

    this.ufrac = (this.iRight - this.iLeft) / this.xmax; // pixel tile's width
    this.vfrac = (this.iTop - this.iBot) / this.ymax; // pixel tile's height.
}

// CCamera.prototype.rayLookAt = function(eyePt, aimPt, upVec) {
CCamera.prototype.rayLookAt = function(eyePtX, eyePtY, eyePtZ, aimPtX, aimPtY, aimPtZ, upVecX, upVecY, upVecZ) {
    eyePt = vec3.fromValues(eyePtX, eyePtY, eyePtZ);
    aimPt = vec3.fromValues(aimPtX, aimPtY, aimPtZ);
    upVec = vec3.fromValues(upVecX, upVecY, upVecZ);

    // camera U axis == world x axis
    // camera V axis == world y axis
    // camera N axis == world z axis.

    this.eyePt = eyePt;
    vec4.subtract(this.nAxis, this.eyePt, aimPt); // aim-eye == MINUS N-axis direction
    vec4.normalize(this.nAxis, this.nAxis);         // N-axis vector must have unit length.
    vec3.cross(this.uAxis, upVec, this.nAxis);    // U-axis == upVec cross N-axis
    vec4.normalize(this.uAxis, this.uAxis);         // make it unit-length.
    vec3.cross(this.vAxis, this.nAxis, this.uAxis); // V-axis == N-axis cross U-axis
}

CCamera.prototype.setEyeRay = function(myeRay, xpos, ypos) {
    // Convert image-plane location (xpos,ypos) in the camera's U,V,N coords:
    var posU = this.iLeft + xpos * this.ufrac; // U coord,
    var posV = this.iBot + ypos * this.vfrac; // V coord,

    xyzPos = vec4.create(); // make vector 0,0,0,0.
    vec4.scaleAndAdd(xyzPos, xyzPos, this.uAxis, posU); // xyzPos += Uaxis*posU;
    vec4.scaleAndAdd(xyzPos, xyzPos, this.vAxis, posV); // xyzPos += Vaxis*posU;
    vec4.scaleAndAdd(xyzPos, xyzPos, this.nAxis, -this.iNear);

    vec4.copy(myeRay.orig, this.eyePt);
    vec4.copy(myeRay.dir, xyzPos);
}

CCamera.prototype.makeEyeRay = function(PxOrig, xSize, ySize, pixSize) {

  this.PxRayList = [];

  for(var j=0; j< ySize; j ++) {            // for the j-th row of pixels
    for(var i=0; i< xSize; i ++) {          // and the i-th pixel on that row,
      var idx = (j*xSize + i)*pixSize;  // Array index at pixel (i,j)

      // xpos = i;
      // ypos = j;
      //
      // var posU = this.iLeft + xpos*this.ufrac;  // U coord,
      // var posV = this.iBot  + ypos*this.vfrac;  // V coord,
      ray = new CRay();
      this.setEyeRay(ray, i, j);
      // xyzPos = vec4.create();    // make vector 0,0,0,0.
      // vec4.scaleAndAdd(xyzPos, xyzPos, this.uAxis, posU); // xyzPos += Uaxis * posU;
      // vec4.scaleAndAdd(xyzPos, xyzPos, this.vAxis, posV); // xyzPos += Vaxis * posU;
      // vec4.scaleAndAdd(xyzPos, xyzPos, this.nAxis, -this.iNear);


      // vec4.copy(ray.orig, PxOrig);
      // vec4.copy(ray.dir, xyzPos);

      this.PxRayList.push(ray);
    }
  }
}


CCamera.prototype.printMe = function() {
    //=============================================================================
    // print CCamera object's current contents in console window:
    //
    // YOU WRITE THIS (see CRay.prototype.printMe() function above)
    //
}
*/
