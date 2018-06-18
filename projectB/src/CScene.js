function CScene() {
}

CScene.prototype.traceRay = function(eyeRay, myCam, myCImgBuf, div,i,j){
      myHitList = new CHitList(eyeRay);
      for (var t = 0; t < JT_HITLIST_MAX; t++){
        var myGeom = new CGeom(t);
        mygapColor = myGeom.gapColor;
        myHitListPt = new CHitList(eyeRay);
        for (var a=0; a < 1/div; a++){
          for (var b=0; b < 1/div; b++){
            var posX = i + a*div;
            var posY = j + b*div;
            myCam.setEyeRay(eyeRay,posX,posY);
            myGeom.traceGridHelper(eyeRay,myGeom.shapeType,myHitListPt,t); 
          }
        }
        if(myHitListPt.HitList.length > 0){
          myHit = myCImgBuf.findPtValue(myHitListPt.HitList, myGeom, myCam);
          myHitList.HitList.push(myHit);
        }

    }

    myHitList.HitList = myHitList.HitList.sort(sortHitt0);


    if (myHitList.HitList.length > 0){
      this.CHitList = myHitList.HitList;
      this.findAvgColor(myHitList.HitList[0],myGeom,myCam)
      return myHitList.HitList[0];
    }else{
      return 0;
    }

}


CScene.prototype.findAvgColor = function(CHit,myGeom, myCamera){
  PtColor = vec4.create();
  HitList = CHit.jitterList
  var gapAmt = jitterAmt * jitterAmt - HitList.length;
  vec4.scale(PtColor, myGeom.gapColor, gapAmt);

  for(var i  = 0; i < HitList.length; i++){
    myCScene = new CScene();
    recursionDepth = globalRecursionDepth;
    myCScene.findShade(HitList[i],myCamera)
    vec4.add(PtColor, PtColor, HitList[i].ObjColor);
  }

  vec4.divideScale(PtColor,PtColor,jitterAmt * jitterAmt);

  vec4.copy(CHit.ObjColor,PtColor);

}

CScene.prototype.findShade = function(CHit,myCamera){

  var lamp0 = new CLight(0);
  var lamp1 = new CLight(1);
  lamp0Clr = vec4.create();
  lamp1Clr = vec4.create();
  hitPtClr = vec4.create();


  viewRay = new CRay();
  vec4.copy(viewRay.orig, myCamera.eyePt);
  rayDir = vec4.create();
  vec4.subtract(rayDir, CHit.hitPtWorld, viewRay.orig);
  vec4.normalize(rayDir,rayDir);

  actualHitPt = vec4.fromValues(0,0,0,1);
  offDir = vec4.create();
  vec4.scale(offDir,rayDir, Math.pow(10,-3));
  vec4.subtract(actualHitPt, CHit.hitPtWorld, offDir);

  vec4.copy(viewRay.dir,rayDir);

  normal = vec4.create()
  vec4.copy(normal,CHit.surfNorm);

  reflectRay = new CRay();
  vec4.copy(reflectRay.orig, actualHitPt);
  rayDirNeg = vec4.create();
  vec4.negate(rayDirNeg,rayDir)
  reflectRay.dir = reflect(rayDir, normal);


  refractRay = new CRay();
  vec4.copy(refractRay.orig, actualHitPt);

  normalNeg = vec4.create();
  vec4.negate(normalNeg,CHit.surfNorm);
  negNcrossS1 = vec4.create();
  vec4.cross(negNcrossS1,normalNeg,rayDir);

  a = vec4.create();
  vec4.multiply(a,CHit.surfNorm,negNcrossS1);
  //console.log(a)
  if(CHit.entering){
    vec4.scale(a,a,1.000293/1.6);
  }else{
    vec4.scale(a,a,1.6/1.000293);
  }


  NcrossS1 = vec4.create();
  vec4.cross(NcrossS1,CHit.surfNorm,rayDir);
  b = vec4.create();
  if(CHit.entering){
    vec4.scale(b,CHit.surfNorm,Math.sqrt(1-vec4.dot(NcrossS1,NcrossS1) * Math.pow(1.000293/1.6,2)))
  }else{
    vec4.scale(b,CHit.surfNorm,Math.sqrt(1-vec4.dot(NcrossS1,NcrossS1) * Math.pow(1.6/1.000293,2)))
  }



  vec4.subtract(refractRay.dir, a,b);


  this.ShadowRayOrigTemp = vec4.create();
  vec4.scale(this.ShadowRayOrigTemp,rayDir, Math.pow(10,-1));
  if(Light1On){
    lamp0.LightOn(CHit,myCamera);
    vec4.copy(lamp0Clr,lamp0.PtColor);
    vec4.add(hitPtClr,hitPtClr,lamp0Clr);
  }
  if(Light2On ){
    lamp1.LightOn(CHit,myCamera);
    vec4.copy(lamp1Clr,lamp1.PtColor);
    vec4.add(hitPtClr,hitPtClr,lamp1Clr);
  }

  if(CHit.JTObj == JT_SPHERE3 && g_show1 != 1){
    this.refractRayClr = vec4.create();

      this.findRefractColor(CHit, refractRay, myCamera);
      vec4.scale(hitPtClr, hitPtClr, 0.5);
      vec4.add(hitPtClr, hitPtClr, this.refractRayClr);
  }

  vec4.copy(CHit.ObjColor, hitPtClr);





  if(recursionDepth > 0 && CHit.JTObj != JT_GNDPLANE && CHit.JTObj != JT_BOX && CHit.JTObj != JT_BOX2 && CHit.JTObj != JT_SPHERE){
    if(CHit.JTObj == JT_BOX4){
      this.reflectRayClr = vec4.create();
      vec4.copy(this.reflectRayClr, hitPtClr);
      this.findReflectColor(CHit, reflectRay, myCamera);
      vec4.copy(CHit.ObjColor, this.reflectRayClr);
    }else{
      this.reflectRayClr = vec4.create();
      this.findReflectColor(CHit, reflectRay, myCamera);
      vec4.scale(CHit.ObjColor, CHit.ObjColor, 0.5);
      vec4.add(CHit.ObjColor, CHit.ObjColor, this.reflectRayClr);
    }

  }

}


CScene.prototype.findRefractColor = function(CHit, reflectRay, myCamera){

  var lamp0 = new CLight(0);
  var lamp1 = new CLight(1);
  lamp0Clr = vec4.create();
  lamp1Clr = vec4.create();

  var clearColor = vec4.create();

  myHitListPt3 = new CHitList(reflectRay);
  for (var t = 0; t < JT_HITLIST_MAX; t++){
    var myGeom = new CGeom(t);
    myGeom.traceGridHelper(reflectRay,myGeom.shapeType,myHitListPt3,t);           // trace ray to the grid
  }
  myHitListPt3.HitList = myHitListPt3.HitList.sort(sortHitt0);

  if(myHitListPt3.HitList.length > 1 && myHitListPt3.HitList[1].JTObj != CHit.JTObj){//&& myHitListPt.HitList[1].t0 > 0){
    recursionDepth = recursionDepth - 1;
    nearestPt2 = myHitListPt3.HitList[1];
    this.findShade(nearestPt2,myCamera);
    vec4.copy(this.refractRayClr, nearestPt2.ObjColor);
    vec4.scale(this.refractRayClr, this.refractRayClr, 0.5);

  }else{
    vec4.copy(this.refractRayClr, myGeom.gapColor);
    vec4.scale(this.refractRayClr, this.refractRayClr, 0.8);
  }

}

CScene.prototype.findReflectColor = function(CHit, reflectRay, myCamera){

  var lamp0 = new CLight(0);
  var lamp1 = new CLight(1);
  lamp0Clr = vec4.create();
  lamp1Clr = vec4.create();

  var clearColor = vec4.create();

  myHitListPt2 = new CHitList(reflectRay);
  for (var t = 0; t < JT_HITLIST_MAX; t++){
    var myGeom = new CGeom(t);
    myGeom.traceGridHelper(reflectRay,myGeom.shapeType,myHitListPt2,t);           // trace ray to the grid
  }
  myHitListPt2.HitList = myHitListPt2.HitList.sort(sortHitt0);

  if(myHitListPt2.HitList.length > 1 && myHitListPt2.HitList[1].JTObj != CHit.JTObj){//&& myHitListPt.HitList[1].t0 > 0){
    recursionDepth = recursionDepth - 1;
    nearestPt = myHitListPt2.HitList[1];
    vec4.copy(myHitListPt2.HitList[1].ObjColor, clearColor);
    vec4.copy(this.reflectRayClr, clearColor);

    this.findShade(nearestPt,myCamera)
    vec4.copy(this.reflectRayClr, nearestPt.ObjColor);

      vec4.scale(this.reflectRayClr, this.reflectRayClr, 0.3);

  }else{
    vec4.copy(this.reflectRayClr, myGeom.gapColor);
    vec4.scale(this.reflectRayClr, this.reflectRayClr, 0.3);
  }
}


CScene.prototype.Shadow = function(CHit, lampInd){
  inShadow = false;
  return inShadow
}



function CHit(JT_obj,hitPtWorld,hitPtModel,color,hitTime, surfNorm, inRay, modRay) {

  this.HitX = hitPtWorld[0];
  this.HitY = hitPtWorld[1];
  this.HitZ = hitPtWorld[2];
  this.hitPtWorld = hitPtWorld;
  this.hitPtModel = hitPtModel;
  this.JTObj = JT_obj;
  this.wldRay = inRay;
  this.modRay = modRay;
  this.eyeToHitDis;// = Math.sqrt((x- g_EyeX)^2 + (y-g_EyeY)^2 + (z-g_EyeZ)^2)
  this.ObjColor = color;
  this.t0 = hitTime;
  this.surfNorm = surfNorm;
  this.lamp0Clr = vec4.create();
  this.lamp1Clr = vec4.create();
  this.recursionDepth;
  this.jitterList = [];
  this.entering = false;
}



function CHitList(inRay) {
  this.HitList = []
}
