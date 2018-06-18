//=============================================================================
// allowable values for CGeom.shapeType variable.  Add some of your own!
// const JT_GND_PLANE = 0;  An endless 'ground plane' surface.
// const JT_SPHERE = 1;  A sphere.
// const JT_BOX = 2;  An axis-aligned cube.
// const JT_CYLINDER = 3;  A cylinder with user-settable radius at each end
// const JT_TRIANGLE = 4;  a triangle with 3 vertices.
// const JT_BLOBBIES = 5;  Implicit surface:Blinn-style Gaussian 'blobbies'.
// const DISK = 6;

// function CGeom(shapeSelect) {
//
//     this.shapeType = (shapeSelect == undefined) ? JT_GND_PLANE : shapeSelect;
//
//     this.world2model = mat4.create();
//      this.normal2world = mat4.create();
//
//     this.zGrid = 0.0;  create line-grid on the unbounded plane at z=zGrid
//     this.xgap = 1.0;  line-to-line spacing
//     this.ygap = 1.0;
//     this.lineWidth = 0.1;  fraction of xgap used for grid-line width
//     this.lineColor = vec4.fromValues(0.1, 0.5, 0.1, 1.0);  RGBA green(A==opacity)
//     this.gapColor = vec4.fromValues(0.9, 0.9, 0.9, 1.0);  near-white
//     this.bgColor = vec4.fromValues(0.1, 0.1, 0.1, 1.0);  near-black
//     this.diskColor = vec4.fromValues(0.9, 0.1, 0.1, 1.0);  near-red
//     this.diskRadius = 10;
//     this.diskLineColor = vec4.fromValues(0.1, 0.9, 0.9, 1.0);  near-red
// }

// CGeom.prototype.translate = function(v) {
//     vec3.set(v, -v[0], -v[1], -v[2]);
//     mat4.translate(this.world2model, this.world2model, v);
// }
//
// CGeom.prototype.rotate = function(rad, axis) {
//     vec3.set(axis, -axis[0], -axis[1], -axis[2]);
//     mat4.rotate(this.world2model, this.world2model, rad, axis);
// }
//
// CGeom.prototype.scale = function(v) {
//     v = vec3.fromValues(1/v[0], 1/v[1], 1/v[2]);
//     mat4.scale(this.world2model, this.world2model, v);
// }

// CGeom.prototype.traceGrid = function(inRay) {
//     if (this.shapeType == JT_GND_PLANE) {
//         var t0 = -inRay.orig[2] / inRay.dir[2];
//         var x = inRay.orig[0] + t0 * inRay.dir[0]
//         var y = inRay.orig[1] + t0 * inRay.dir[1]
//         if (t0 <= 0)
//             return -1;
//         if (x - Math.floor(x) < this.lineWidth || y - Math.floor(y) < this.lineWidth)
//             return 1;
//         return 0;
//     }
// }

// CGeom.prototype.traceDisk = function(inRay) {
//     rayT = new CRay();
//
//     vec4.transformMat4(rayT.orig, inRay.orig, this.world2model);
//     vec4.transformMat4(rayT.dir, inRay.dir, this.world2model);
//
//     var t0 = -rayT.orig[2] / rayT.dir[2];
//     if (t0 <= 0)
//         return -1;
//
//     var hitPoint = vec4.create();
//     vec4.scaleAndAdd(hitPoint, rayT.orig, rayT.dir, t0);
//      var x = rayT.orig[0] + t0 * rayT.dir[0]
//      var y = rayT.orig[1] + t0 * rayT.dir[1]
//
//     if (t0 <= 0)
//         return -1;
//     if (hitPoint[0] * hitPoint[0] + hitPoint[1] * hitPoint[1] < this.diskRadius * this.diskRadius){
//         if (hitPoint[0] - Math.floor(hitPoint[0]) < this.lineWidth || hitPoint[1] - Math.floor(hitPoint[1]) < this.lineWidth)
//             return 0;
//         return 1;
//     }
//
//      else if (hitPoint[0] - Math.floor(hitPoint[0]) < this.lineWidth || hitPoint[1] - Math.floor(hitPoint[1]) < this.lineWidth)
//
//     return -1;
//
//     }

//=============================================================================
// allowable values for CGeom.shapeType variable.  Add some of your own!
const JT_GNDPLANE = 0; // An endless 'ground plane' surface.
const JT_SPHERE = 3; // A sphere.
const JT_SPHERE2 = 4;
const JT_SPHERE3 = 1;
const JT_SPHERE4 = 2;
const JT_BOX = 5; // An axis-aligned cube.
const JT_BOX2 = 6;
const JT_BOX3 = 7;
const JT_BOX4 = 8;
const JT_GNDPLANE2 = 9;
const JT_NOTHING = 0;
const JT_GNDPLANE_CHECKBOARD = 100;

const JT_CYLINDER = 50; // A cylinder with user-settable radius at each end
//                          and user-settable length.  radius of 0 at either
//                          end makes a cone; length of 0 with nonzero
//                          radius at each end makes a disk.

// const JT_DISK     = 20;
// const JT_DISK1    = 30;

// const JT_TRIANGLE = 60;     a triangle with 3 vertices.
// const JT_BLOBBIES = 70;     Implicit surface:Blinn-style Gaussian 'blobbies'.

const JT_HITLIST_MAX = 10;
var checkBoard = false;

var matlSel = MATL_RED_PLASTIC; // see keypress(): 'm' key changes matlSel
var matl0 = new Material(matlSel);

function CGeom(shapeSelect) {
    this.gapColor = vec4.fromValues(100 / 255, 100 / 255, 105 / 255, 1.0); // near-white
    if (g_show1) {

        switch (shapeSelect) {

            case JT_GNDPLANE:
                this.shapeType = JT_GNDPLANE;
                this.world2model = mat4.create();
                this.w2mTranspose = mat4.create();
                this.zGrid = -5; // create line-grid on the unbounded plane at z=zGrid
                this.xgap = 1; // line-to-line spacing
                this.ygap = 1;
                this.lineWidth = 0.1; // fraction of xgap used for grid-line width
                this.hitColor = vec4.fromValues(1, 1, 1, 1.0); // RGBA green(A== opacity)
                break;


            case JT_BOX:
                this.shapeType = JT_BOX;
                this.world2model = mat4.create();
                this.w2mTranspose = mat4.create();
                this.sideWall = 1;
                this.frontWall = 1;
                this.aboveWall = 1;
                this.xgap = Math.pow(0.3, 3); // line-to-line spacing
                this.ygap = Math.pow(0.3, 3);
                this.zgap = Math.pow(0.3, 3);
                this.hitColor = vec4.fromValues(0.8, 0.5, 0.5, 1.0);
                this.rayTranslate(-2, 3, -3);
                this.rayScale(0.5, 0.5, 0.5);
                break;



            case JT_SPHERE:
                this.shapeType = JT_SPHERE;
                this.world2model = mat4.create();
                this.w2mTranspose = mat4.create();
                this.sphereCenter = 0;
                this.sphereRad = 1;
                this.xgap = 0.5;
                this.ygap = 0.5;
                this.zgap = 0.5;
                this.hitColor = vec4.fromValues(0.8, 0.5, 1, 1.0);
                matlSel = (5) % MATL_DEFAULT; // see materials_Ayerdi.js for list
                matl0 = new Material(matlSel); // REPLACE our current material, &
                this.rayTranslate(-2.5,0,-3);
                // this.rayRotate(90,0,0,1);
                break;

            case JT_SPHERE3:
                this.shapeType = JT_SPHERE;
                this.world2model = mat4.create();
                this.w2mTranspose = mat4.create();
                this.sphereCenter = 0;
                this.sphereRad = 1;
                this.xgap = 0.5;
                this.ygap = 0.5;
                this.zgap = 0.5;
                this.hitColor = vec4.fromValues(0.8, 0.5, 1, 1.0);
                matlSel = (18) % MATL_DEFAULT; // see materials_Ayerdi.js for list
                matl0 = new Material(matlSel); // REPLACE our current material, &
                this.rayTranslate(1, 3, -3);
                this.rayRotate(-15, 0, 1, 0);
                // this.rayScale(1, 1, 2);
                break;

            case JT_SPHERE4:
                this.shapeType = JT_SPHERE;
                this.world2model = mat4.create();
                this.w2mTranspose = mat4.create();
                this.sphereRad = 1;
                this.hitColor = vec4.fromValues(1, 1, 1, 1.0);
                matlSel = (9) % MATL_DEFAULT; // see materials_Ayerdi.js for list
                matl0 = new Material(matlSel); // REPLACE our current material, &
                this.rayTranslate(2, 0, -2);
                //this.rayRotate(-35,0,1,0);
                this.rayScale(2, 1, 2);
                break;

        }
    }
}

CGeom.prototype.FindNormal2 = function(shapeType) {

    switch (shapeType) {
        case JT_GNDPLANE:

            this.surfNorm = vec4.fromValues(0.0, 0.0, 1.0, 0.0);
            vec4.transformMat4(this.surfNorm, this.surfNorm, this.w2mTranspose);
            vec4.normalize(this.surfNorm, this.surfNorm);
            break;
        case JT_GNDPLANE2:

            this.surfNorm = vec4.fromValues(0.0, 0.0, 1.0, 0.0);
            vec4.transformMat4(this.surfNorm, this.surfNorm, this.w2mTranspose);
            vec4.normalize(this.surfNorm, this.surfNorm);
            break;

        case JT_GNDPLANE_CHECKBOARD:

            this.surfNorm = vec4.fromValues(0.0, 0.0, 1.0, 0.0);
            vec4.transformMat4(this.surfNorm, this.surfNorm, this.w2mTranspose);
            vec4.normalize(this.surfNorm, this.surfNorm);
            break;

        case JT_SPHERE:

            this.surfNormVec3 = vec3.fromValues(this.hitPtModel[0], this.hitPtModel[1], this.hitPtModel[2]);
            vec3.transformMat4(this.surfNormVec3, this.surfNormVec3, this.w2mTranspose);
            /////console.log(this.surfNorm);
            /////mat4.multiply(this.surfNorm,this.w2mTranspose,this.surfNorm);
            vec3.normalize(this.surfNormVec3, this.surfNormVec3);
            this.surfNorm = vec4.fromValues(this.surfNormVec3[0], this.surfNormVec3[1], this.surfNormVec3[2], 0);

            //this.surfNorm = vec4.fromValues(this.hitPtModel[0], this.hitPtModel[1], this.hitPtModel[2], 0.0);
            //vec4.transformMat4(this.surfNorm, this.surfNorm, this.w2mTranspose);
            //vec4.normalize(this.surfNorm,this.surfNorm);

            break;
        case JT_BOX:
            this.surfNormVec3 = vec3.fromValues(this.wall[0], this.wall[1], this.wall[2]);
            vec3.transformMat4(this.surfNormVec3, this.surfNormVec3, this.w2mTranspose);
            /////console.log(this.surfNorm);
            /////mat4.multiply(this.surfNorm,this.w2mTranspose,this.surfNorm);
            vec3.normalize(this.surfNormVec3, this.surfNormVec3);
            this.surfNorm = vec4.fromValues(this.surfNormVec3[0], this.surfNormVec3[1], this.surfNormVec3[2], 0);

            break;

    }
}

CGeom.prototype.traceGridHelper = function(inRay, sel, myCHitList, shapeInd) {

    myHitListTemp = [];
    switch (sel) {

        case JT_GNDPLANE:
            //console.log(inRay.orig);
            this.hitx;
            this.hity;
            this.hitz;
            this.t0;
            this.hitPtWorld = vec4.create();
            this.hitPtModel = vec4.create();
            this.surfNorm;

            modRay = new CRay();
            vec4.transformMat4(modRay.orig, inRay.orig, this.world2model);
            vec4.transformMat4(modRay.dir, inRay.dir, this.world2model);

            t0 = (this.zGrid - modRay.orig[2]) / modRay.dir[2];
            x0 = modRay.orig[0] + modRay.dir[0] * t0;
            y0 = modRay.orig[1] + modRay.dir[1] * t0;
            z0 = modRay.orig[2] + modRay.dir[2] * t0;
            //console.log("z0: " + z0);
            if (z0 == this.zGrid && t0 > 0) {
                xfrac = (x0 / this.xgap) - Math.floor(x0 / this.xgap);
                yfrac = (y0 / this.ygap) - Math.floor(y0 / this.ygap);
                if (xfrac < this.lineWidth || yfrac < this.lineWidth && !checkBoard) {

                    this.hitColor = this.hitColor;
                    this.gapColor = this.gapColor;

                    t0dir = vec4.create();
                    vec4.scale(t0dir, inRay.dir, t0);
                    vec4.add(this.hitPtWorld, inRay.orig, t0dir);

                    offDir = vec4.create();
                    vec4.scale(offDir, inRay.dir, Math.pow(10, -14));
                    //vec4.subtract(this.hitPtWorld, this.hitPtWorld, offDir);

                    this.hitPtModel = vec4.fromValues(x0, y0, z0, 1);

                    this.FindNormal2(sel);

                    myCHit = new CHit(shapeInd, this.hitPtWorld, this.hitPtModel, this.hitColor, t0, this.surfNorm, inRay, modRay);
                    //CHit(JT_obj,hitPtWorld,hitPtModel,EyeRay,color,hitTime)
                    if (myCHitList) {
                        myCHitList.HitList.push(myCHit);
                    }

                    return 0;
                } else {

                    return 1
                }
            } else {
                return -1
            }

            break;
        case JT_GNDPLANE2:
            //console.log(inRay.orig);
            this.hitx;
            this.hity;
            this.hitz;
            this.t0;
            this.hitPtWorld = vec4.create();
            this.hitPtModel = vec4.create();
            this.surfNorm;

            modRay = new CRay();
            vec4.transformMat4(modRay.orig, inRay.orig, this.world2model);
            vec4.transformMat4(modRay.dir, inRay.dir, this.world2model);

            t0 = (this.zGrid - modRay.orig[2]) / modRay.dir[2];
            x0 = modRay.orig[0] + modRay.dir[0] * t0;
            y0 = modRay.orig[1] + modRay.dir[1] * t0;
            z0 = modRay.orig[2] + modRay.dir[2] * t0;
            //console.log("z0: " + z0);
            if (z0 == this.zGrid && t0 > 0) {
                xfrac = (x0 / this.xgap) - Math.floor(x0 / this.xgap);
                yfrac = (y0 / this.ygap) - Math.floor(y0 / this.ygap);

                this.hitColor = this.hitColor;
                this.gapColor = this.gapColor;

                t0dir = vec4.create();
                vec4.scale(t0dir, inRay.dir, t0);
                vec4.add(this.hitPtWorld, inRay.orig, t0dir);

                offDir = vec4.create();
                vec4.scale(offDir, inRay.dir, Math.pow(10, -14));
                //vec4.subtract(this.hitPtWorld, this.hitPtWorld, offDir);

                this.hitPtModel = vec4.fromValues(x0, y0, z0, 1);

                this.FindNormal2(sel);

                myCHit = new CHit(shapeInd, this.hitPtWorld, this.hitPtModel, this.hitColor, t0, this.surfNorm, inRay, modRay);
                //CHit(JT_obj,hitPtWorld,hitPtModel,EyeRay,color,hitTime)
                if (myCHitList) {
                    myCHitList.HitList.push(myCHit);
                }

            } else {
                return -1
            }

            break;

        case JT_GNDPLANE_CHECKBOARD:
            //console.log(inRay.orig);
            this.hitPtWorld = vec4.create();
            this.hitPtModel = vec4.create();
            this.surfNorm;
            modRay = new CRay();
            vec4.transformMat4(modRay.orig, inRay.orig, this.world2model);
            vec4.transformMat4(modRay.dir, inRay.dir, this.world2model);

            t0 = (this.zGrid - modRay.orig[2]) / modRay.dir[2];
            x0 = modRay.orig[0] + modRay.dir[0] * t0;
            y0 = modRay.orig[1] + modRay.dir[1] * t0;
            z0 = modRay.orig[2] + modRay.dir[2] * t0;
            //console.log("z0: " + z0);
            if (z0 == this.zGrid && t0 > 0) {
                if (true) {

                    t0dir = vec4.create();
                    vec4.scale(t0dir, inRay.dir, t0);
                    vec4.add(this.hitPtWorld, inRay.orig, t0dir);

                    offDir = vec4.create();
                    vec4.scale(offDir, inRay.dir, Math.pow(10, -14));
                    //vec4.subtract(this.hitPtWorld, this.hitPtWorld, offDir);

                    this.hitPtModel = vec4.fromValues(x0, y0, z0, 1);

                    this.FindNormal2(sel);

                    myCHit = new CHit(shapeInd, this.hitPtWorld, this.hitPtModel, this.hitColor, t0, this.surfNorm, inRay, modRay);
                    //CHit(JT_obj,hitPtWorld,hitPtModel,EyeRay,color,hitTime)
                    if (myCHitList) {
                        myCHitList.HitList.push(myCHit);
                    }
                }
            } else {}

            break;


        case JT_BOX:
            this.hitx;
            this.hity;
            this.hitz;
            this.t0;
            this.hitPtWorld = vec4.create();
            this.hitPtModel = vec4.create();
            this.surfNorm;

            HitListTemp = [];

            modRay = new CRay();
            vec4.transformMat4(modRay.orig, inRay.orig, this.world2model);
            vec4.transformMat4(modRay.dir, inRay.dir, this.world2model);

            t0 = (this.sideWall - modRay.orig[0]) / modRay.dir[0];
            x0 = modRay.orig[0] + modRay.dir[0] * t0;
            y0 = modRay.orig[1] + modRay.dir[1] * t0;
            z0 = modRay.orig[2] + modRay.dir[2] * t0;
            if (t0 > 0) {
                if (y0 * y0 <= this.frontWall && z0 * z0 <= this.aboveWall && t0 > 0) {
                    this.wall = vec4.fromValues(1, 0, 0, 0);
                    this.hitx = x0;
                    this.hity = y0;
                    this.hitz = z0;
                    this.t0 = t0;
                    this.hitColor = vec4.fromValues(0.2, 0.4, 0.8, 1);

                    t0dir = vec4.create();
                    vec4.scale(t0dir, inRay.dir, t0);
                    vec4.add(this.hitPtWorld, inRay.orig, t0dir);

                    this.hitPtModel = vec4.fromValues(x0, y0, z0, 1);
                    this.FindNormal2(sel);
                    //console.log("sphere")
                    //console.log(myHitList);
                    myCHit = new CHit(shapeInd, this.hitPtWorld, this.hitPtModel, this.hitColor, t0, this.surfNorm, inRay, modRay);

                    //if(myCHitList){
                    //  myCHitList.HitList.push(myCHit);
                    //}
                    HitListTemp.push(myCHit);

                    //return 1;
                }
            }
            myCHitList.HitList = myCHitList.HitList;

            t0 = (-this.sideWall - modRay.orig[0]) / modRay.dir[0];
            x0 = modRay.orig[0] + modRay.dir[0] * t0;
            y0 = modRay.orig[1] + modRay.dir[1] * t0;
            z0 = modRay.orig[2] + modRay.dir[2] * t0;
            if (t0 > 0)
                if (y0 * y0 <= this.frontWall && z0 * z0 <= this.aboveWall && t0 > 0) {

                    this.wall = vec4.fromValues(-1, 0, 0, 0);
                    this.hitx = x0;
                    this.hity = y0;
                    this.hitz = z0;
                    this.t0 = t0;
                    this.hitColor = vec4.fromValues(0.8, 0.4, 0.8, 1);

                    t0dir = vec4.create();
                    vec4.scale(t0dir, inRay.dir, t0);
                    vec4.add(this.hitPtWorld, inRay.orig, t0dir);

                    this.hitPtModel = vec4.fromValues(x0, y0, z0, 1);
                    this.FindNormal2(sel);
                    //console.log("sphere")
                    //console.log(myHitList);
                    myCHit = new CHit(shapeInd, this.hitPtWorld, this.hitPtModel, this.hitColor, t0, this.surfNorm, inRay, modRay);

                    HitListTemp.push(myCHit);
                    //return 1;
                }
            else {}

            t0 = (this.frontWall - modRay.orig[1]) / modRay.dir[1];
            x0 = modRay.orig[0] + modRay.dir[0] * t0;
            y0 = modRay.orig[1] + modRay.dir[1] * t0;
            z0 = modRay.orig[2] + modRay.dir[2] * t0;
            if (t0 > 0) {
                if (x0 * x0 <= this.sideWall && z0 * z0 <= this.aboveWall && t0 > 0) {

                    this.wall = vec4.fromValues(0, 1, 0, 0);
                    this.hitx = x0;
                    this.hity = y0;
                    this.hitz = z0;
                    this.t0 = t0;

                    t0dir = vec4.create();
                    vec4.scale(t0dir, inRay.dir, t0);
                    vec4.add(this.hitPtWorld, inRay.orig, t0dir);

                    this.hitPtModel = vec4.fromValues(x0, y0, z0, 1);
                    this.FindNormal2(sel);
                    //console.log("sphere")
                    //console.log(myHitList);
                    myCHit = new CHit(shapeInd, this.hitPtWorld, this.hitPtModel, this.hitColor, t0, this.surfNorm, inRay, modRay);

                    //if(myCHitList){
                    //  myCHitList.HitList.push(myCHit);
                    //}
                    HitListTemp.push(myCHit);
                    //return 1;
                } else {}
            }

            t0 = (-this.frontWall - modRay.orig[1]) / modRay.dir[1];
            x0 = modRay.orig[0] + modRay.dir[0] * t0;
            y0 = modRay.orig[1] + modRay.dir[1] * t0;
            z0 = modRay.orig[2] + modRay.dir[2] * t0;
            if (t0 > 0) {
                if (x0 * x0 <= this.sideWall && z0 * z0 <= this.aboveWall && t0 > 0) {

                    this.wall = vec4.fromValues(0, -1, 0, 0);
                    this.hitx = x0;
                    this.hity = y0;
                    this.hitz = z0;
                    this.t0 = t0;
                    this.hitColor = vec4.fromValues(0.3, 0.1, 0.3, 1)

                    t0dir = vec4.create();
                    vec4.scale(t0dir, inRay.dir, t0);
                    vec4.add(this.hitPtWorld, inRay.orig, t0dir);

                    this.hitPtModel = vec4.fromValues(x0, y0, z0, 1);
                    this.FindNormal2(sel);
                    //console.log("sphere")
                    //console.log(myHitList);
                    myCHit = new CHit(shapeInd, this.hitPtWorld, this.hitPtModel, this.hitColor, t0, this.surfNorm, inRay, modRay);

                    //if(myCHitList){
                    //  myCHitList.HitList.push(myCHit);
                    //}
                    HitListTemp.push(myCHit);
                    //return 1;
                } else {}
            }

            t0 = (this.frontWall - modRay.orig[2]) / modRay.dir[2];
            x0 = modRay.orig[0] + modRay.dir[0] * t0;
            y0 = modRay.orig[1] + modRay.dir[1] * t0;
            z0 = modRay.orig[2] + modRay.dir[2] * t0;
            if (t0 > 0) {
                if (x0 * x0 <= this.sideWall && y0 * y0 <= this.aboveWall && t0 > 0) {

                    this.wall = vec4.fromValues(0, 0, 1, 0);
                    this.hitx = x0;
                    this.hity = y0;
                    this.hitz = z0;
                    this.t0 = t0;

                    t0dir = vec4.create();
                    vec4.scale(t0dir, inRay.dir, t0);
                    vec4.add(this.hitPtWorld, inRay.orig, t0dir);

                    this.hitPtModel = vec4.fromValues(x0, y0, z0, 1);
                    this.FindNormal2(sel);
                    //console.log("sphere")
                    //console.log(myHitList);
                    myCHit = new CHit(shapeInd, this.hitPtWorld, this.hitPtModel, this.hitColor, t0, this.surfNorm, inRay, modRay);

                    //if(myCHitList){
                    //  myCHitList.HitList.push(myCHit);
                    //}
                    HitListTemp.push(myCHit);
                    //return 1;
                } else {}
            }

            t0 = (-this.frontWall - modRay.orig[2]) / modRay.dir[2];
            x0 = modRay.orig[0] + modRay.dir[0] * t0;
            y0 = modRay.orig[1] + modRay.dir[1] * t0;
            z0 = modRay.orig[2] + modRay.dir[2] * t0;
            if (t0 > 0) {
                if (x0 * x0 <= this.sideWall && y0 * y0 <= this.aboveWall && t0 > 0) {

                    this.wall = vec4.fromValues(0, 0, -1, 0);
                    this.hitx = x0;
                    this.hity = y0;
                    this.hitz = z0;
                    this.t0 = t0;

                    t0dir = vec4.create();
                    vec4.scale(t0dir, inRay.dir, t0);
                    vec4.add(this.hitPtWorld, inRay.orig, t0dir);

                    this.hitPtModel = vec4.fromValues(x0, y0, z0, 1);
                    this.FindNormal2(sel);
                    //console.log("sphere")
                    //console.log(myHitList);
                    myCHit = new CHit(shapeInd, this.hitPtWorld, this.hitPtModel, this.hitColor, t0, this.surfNorm, inRay, modRay);

                    //if(myCHitList){
                    //  myCHitList.HitList.push(myCHit);
                    //}
                    HitListTemp.push(myCHit);
                    //return 1;
                } else {
                    //return 0;
                }
            }

            HitListTemp = HitListTemp.sort(sortHitt0);
            if (HitListTemp.length > 0) {
                myCHitList.HitList.push(HitListTemp[0]);
                //console.log(HitListTemp.length);
            }

            break;
        case JT_SPHERE:

            this.hitx;
            this.hity;
            this.hitz;
            this.t0;

            this.hitPtWorld = vec4.create();
            this.hitPtModel = vec4.create();
            this.surfNorm = vec4.create();

            this.hitPtWorld1 = vec4.create();
            this.hitPtModel1 = vec4.create();
            this.surfNorm1 = vec4.create();

            HitListTemp = [];

            modRay = new CRay();
            vec4.transformMat4(modRay.orig, inRay.orig, this.world2model);
            vec4.transformMat4(modRay.dir, inRay.dir, this.world2model);
            //console.log(modRay.orig)

            torg = modRay.orig;
            tdir = modRay.dir;
            r2s = vec4.fromValues(0 - torg[0], 0 - torg[1], 0 - torg[2], 0);
            //console.log(r2s)
            L2 = vec4.dot(r2s, r2s);

            tcaS = vec4.dot(tdir, r2s);

            if (L2 > Math.pow(this.sphereRad, 2)) {
                if (tcaS < 0) {
                    return 0;
                } else {}
            }

            DL2 = vec4.dot(tdir, tdir);

            tca2 = tcaS * tcaS / DL2;

            LM2 = L2 - tca2;
            if (LM2 > Math.pow(this.sphereRad, 2)) {
                //console.log("missed")
                return 0
            } else {
                Lhc2 = Math.pow(this.sphereRad, 2) - LM2;
                if (L2 > Math.pow(this.sphereRad, 2)) {
                    t0 = tcaS / DL2 - Math.sqrt(Lhc2 / DL2);

                    t1 = tcaS / DL2 + Math.sqrt(Lhc2 / DL2);

                    t0 = Math.min(t1, t0);

                    x0 = modRay.orig[0] + modRay.dir[0] * t0;
                    y0 = modRay.orig[1] + modRay.dir[1] * t0;
                    z0 = modRay.orig[2] + modRay.dir[2] * t0;

                    x1 = modRay.orig[0] + modRay.dir[0] * t1;
                    y1 = modRay.orig[1] + modRay.dir[1] * t1;
                    z1 = modRay.orig[2] + modRay.dir[2] * t1;

                    //console.log(t1 < t0);

                    this.hitx = x0;
                    this.hity = y0;
                    this.hitz = z0;
                    this.t0 = t0;

                    t0dir = vec4.create();
                    vec4.scale(t0dir, inRay.dir, t0);
                    vec4.add(this.hitPtWorld, inRay.orig, t0dir);

                    offDir = vec4.create();
                    vec4.scale(offDir, inRay.dir, Math.pow(10, -14));
                    //vec4.subtract(this.hitPtWorld, this.hitPtWorld, offDir);

                    this.hitPtModel = vec4.fromValues(x0, y0, z0, 1);
                    this.FindNormal2(sel);
                    //console.log("sphere")
                    //console.log(myHitList);
                    myCHit = new CHit(shapeInd, this.hitPtWorld, this.hitPtModel, this.hitColor, t0, this.surfNorm, inRay, modRay);
                    myCHit.entering = true;
                    //if(myCHitList){
                    //  myCHitList.HitList.push(myCHit);
                    //}
                    HitListTemp.push(myCHit);
                    //myHitList.HitList.push();

                    //console.log(myHitList);

                    this.hit1x = x1;
                    this.hit1y = y1;
                    this.hit1z = z1;
                    this.t10 = t1;

                    t0dir1 = vec4.create();
                    vec4.scale(t0dir1, inRay.dir, t1);
                    vec4.add(this.hitPtWorld, inRay.orig, t0dir1);

                    offDir = vec4.create();
                    vec4.scale(offDir, inRay.dir, Math.pow(10, -14));
                    //vec4.subtract(this.hitPtWorld, this.hitPtWorld, offDir);

                    this.hitPtModel = vec4.fromValues(x1, y1, z1, 1);

                    this.FindNormal2(sel);

                    myCHit = new CHit(shapeInd, this.hitPtWorld, this.hitPtModel, this.hitColor, t1, this.surfNorm, inRay, modRay);
                    myCHit.entering = false;
                    //if(myCHitList){
                    //  myCHitList.HitList.push(myCHit);
                    //}
                    HitListTemp.push(myCHit);
                    //myHitList.HitList.push();

                    //console.log("hit sphere")
                    //console.log("sphere");
                    //console.log(myHitList);

                    //return 1

                } else {
                    t0 = (tcaS / DL2) + Math.sqrt(Lhc2 / DL2)

                    x0 = modRay.orig[0] + modRay.dir[0] * t0;
                    y0 = modRay.orig[1] + modRay.dir[1] * t0;
                    z0 = modRay.orig[2] + modRay.dir[2] * t0;

                    this.hitx = x0;
                    this.hity = y0;
                    this.hitz = z0;
                    this.t0 = t0;

                    t0dir = vec4.create();
                    vec4.scale(t0dir, inRay.dir, t0);
                    vec4.add(this.hitPtWorld, inRay.orig, t0dir);

                    offDir = vec4.create();
                    vec4.scale(offDir, inRay.dir, Math.pow(10, -14));
                    //vec4.subtract(this.hitPtWorld, this.hitPtWorld, offDir);

                    this.hitPtModel = vec4.fromValues(x0, y0, z0, 1);
                    this.FindNormal2(sel);

                    myCHit = new CHit(shapeInd, this.hitPtWorld, this.hitPtModel, this.hitColor, t0, this.surfNorm, inRay, modRay);
                    myCHit.entering = false;
                    //if(myCHitList){
                    //  myCHitList.HitList.push(myCHit);
                    //}
                    HitListTemp.push(myCHit);
                    //myHitList.HitList.push();
                    //return 1
                }

                HitListTemp = HitListTemp.sort(sortHitt0);
                // for (var i = 0; i < HitListTemp.length; i++){
                //   myCHitList.HitList.push(HitListTemp[i]);
                // }
                if (HitListTemp.length > 0) {
                    myCHitList.HitList.push(HitListTemp[0]);
                    //  console.log(HitListTemp.length);
                }

            }

            break;
    }

}

CGeom.prototype.rayLoadIdentity = function(x, y, z) {
    //this.world2model.rotate(angle,x,y,z);
    this.world2model = mat4.create();
    this.w2mTranspose = mat4.create();
    //mat4.copy(this.world2model, this.mtran);
    //console.log(this.mtran);
}

CGeom.prototype.rayTranslate = function(x, y, z) {
    //this.world2model.rotate(angle,x,y,z);
    this.mtran = mat4.create();
    this.mtran[12] = -x;
    this.mtran[13] = -y;
    this.mtran[14] = -z;

    mat4.multiply(this.world2model, this.mtran, this.world2model);
    mat4.copy(this.w2mTranspose, this.world2model);
    mat4.transpose(this.w2mTranspose, this.world2model);

    //console.log("this.mtran: " + this.mtran);
    //console.log("this.world2model: " + this.world2model)
    //mat4.copy(this.world2model, this.mtran);
    //console.log(this.mtran);
}

CGeom.prototype.rayRotate = function(angle, x, y, z) {
    //this.world2model.rotate(angle,x,y,z);

    len2 = x * x + y * y + z * z;
    if (len2 != 1) {
        if (len2 < Math.pow(10, -15)) {
            return;
            console.log("not unit");
        }
        len2 = Math.sqrt(len2); // find actual vector length, then
        x = x / len2; // normalize the vector.
        y = y / len2;
        z = z / len2;
    }

    var c = Math.cos(-angle * Math.PI / 180);
    var s = Math.sin(-angle * Math.PI / 180);

    this.mrot = mat4.create();

    this.mrot[0] = x * x * (1 - c) + c;
    this.mrot[1] = y * x * (1 - c) + z * s;
    this.mrot[2] = z * x * (1 - c) - y * s;

    this.mrot[4] = x * y * (1 - c) - z * s;
    this.mrot[5] = y * y * (1 - c) + c;
    this.mrot[6] = z * y * (1 - c) + x * s;

    this.mrot[8] = x * z * (1 - c) + y * s;
    this.mrot[9] = y * z * (1 - c) - x * s;
    this.mrot[10] = z * z * (1 - c) + c;

    mat4.multiply(this.world2model, this.mrot, this.world2model);
    mat4.copy(this.w2mTranspose, this.world2model);
    mat4.transpose(this.w2mTranspose, this.world2model);

    //console.log("this.world2model for rotate: " + this.world2model)
    //console.log("finish rotate")
}

CGeom.prototype.rayScale = function(sx, sy, sz) {
    //this.world2model.rotate(angle,x,y,z);

    this.mscl = mat4.create();
    this.mscl[0] = 1 / sx;
    this.mscl[5] = 1 / sy;
    this.mscl[10] = 1 / sz;

    mat4.multiply(this.world2model, this.mscl, this.world2model);

    mat4.copy(this.w2mTranspose, this.world2model);
    mat4.transpose(this.w2mTranspose, this.world2model);

}
