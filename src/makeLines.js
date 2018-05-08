function makeLines() {
//==============================================================================
	var xcount = 100;			// # of lines to draw in x,y to make the grid.
	var ycount = 100;
	var xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.
 	var xColr = new Float32Array([0.35, 0.4, 0.15]);	// bright yellow
 	var yColr = new Float32Array([0.4, 0.35, 0.15]);	// bright green.

	// Create an (global) array to hold this ground-plane's vertices:
	gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount) + (box_count+springCount+circle_count)*floatsPerVertex);

	var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
	var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))

	// First, step thru x values as we make vertical lines of constant-x:
	for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
		if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
			gndVerts[j  ] = -xymax + (v  )*xgap;	// x
			gndVerts[j+1] = -xymax;								// y
			gndVerts[j+2] = 0.0;									// z
            gndVerts[j+3] = 1.0;
		}
		else {				// put odd-numbered vertices at (xnow, +xymax, 0).
			gndVerts[j  ] = -xymax + (v-1)*xgap;	// x
			gndVerts[j+1] = xymax;								// y
			gndVerts[j+2] = 0.0;									// z
            gndVerts[j+3] = 1.0;
		}
		gndVerts[j+4] = xColr[0];			// red
		gndVerts[j+5] = xColr[1];			// grn
		gndVerts[j+6] = xColr[2];			// blu
        gndVerts[j+7] = 7.0;
	}

	for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
		if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
			gndVerts[j  ] = -xymax;								// x
			gndVerts[j+1] = -xymax + (v  )*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
            gndVerts[j+3] = 1.0;
		}
		else {					// put odd-numbered vertices at (+xymax, ynow, 0).
			gndVerts[j  ] = xymax;								// x
			gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
            gndVerts[j+3] = 1.0;
		}
		gndVerts[j+4] = yColr[0];			// red
		gndVerts[j+5] = yColr[1];			// grn
		gndVerts[j+6] = yColr[2];			// blu
        gndVerts[j+7] = 7.0;
	}

	var size_1 = floatsPerVertex*2*(xcount+ycount);
	var cxmin = -1.0, cymin = -1.0, czmin = 0.0;
	var cxmax = 1.0, cymax = 1.0, czmax = 2.0;

	var tempArray = new Float32Array ([
		cxmin, cymin, czmin, 0.6, 0.5, 0.8, 1.0, 7.0,
		cxmin, cymax, czmin, 0.6, 0.5, 0.8, 1.0, 7.0,
		cxmin, cymax, czmax, 0.6, 0.5, 0.8, 1.0, 7.0,
		cxmin, cymin, czmax, 0.6, 0.5, 0.8, 1.0, 7.0,

		cxmax, cymin, czmax, 0.6, 0.5, 0.8, 1.0, 7.0,
		cxmax, cymax, czmax, 0.6, 0.5, 0.8, 1.0, 7.0,
		cxmax, cymax, czmin, 0.6, 0.5, 0.8, 1.0, 7.0,
		cxmax, cymin, czmin, 0.6, 0.5, 0.8, 1.0, 7.0,

		cxmin, cymin, czmin, 0.6, 0.5, 0.8, 1.0, 7.0,
		cxmin, cymin, czmax, 0.6, 0.5, 0.8, 1.0, 7.0,
		cxmax, cymin, czmax, 0.6, 0.5, 0.8, 1.0, 7.0,
		cxmax, cymin, czmin, 0.6, 0.5, 0.8, 1.0, 7.0,

		cxmax, cymax, czmin, 0.6, 0.5, 0.8, 1.0, 7.0,
		cxmin, cymax, czmin, 0.6, 0.5, 0.8, 1.0, 7.0,
		cxmin, cymax, czmax, 0.6, 0.5, 0.8, 1.0, 7.0,
		cxmax, cymax, czmax, 0.6, 0.5, 0.8, 1.0, 7.0,

		cxmax, cymin, czmax, 0.6, 0.5, 0.8, 1.0, 7.0,
  ]);

  for (var ij = 0; ij < box_count*floatsPerVertex; ij++) {
	  gndVerts[size_1+ij] = tempArray[ij];
  }

  var circleList = [];
  var R = 3.0;
  for (var j = 0; j < 8; j++) {
	  var angle1 = j * Math.PI / 7.0;
	  var ztemp = R * Math.cos(angle1);
	  var r = R * Math.sin(angle1);
	  for (var i = 0; i < 20; i++) {
		  var angle2 = i * 2* Math.PI / 19.0;
		  var xtemp = r * Math.sin(angle2);
		  var ytemp = r * Math.cos(angle2);
		  var temparray = [flame_x+xtemp, flame_y+ytemp, flame_z+ztemp+2.0,
		  1.0, 1.0, 0.0, 1.0, 7.0];
		  circleList = circleList.concat(temparray);
	  }
  }

  R /= 3.0;
  for (var j = 0; j < 8; j++) {
	//   var angle1 = j * Math.PI / 7.0;
	  var ztemp = j * 2 * R / 7.0 - R;
	  var r = R;
	  for (var i = 0; i < 20; i++) {
		  var angle2 = i * 2* Math.PI / 19.0;
		  var xtemp = r * Math.sin(angle2);
		  var ytemp = r * Math.cos(angle2);
		  var temparray = [tonado_x+xtemp, tonado_y+ytemp, tonado_z+ztemp,
		  1.0, 0.0, 1.0, 1.0, 7.0];
		  circleList = circleList.concat(temparray);
	  }
  }


  var size_2 = size_1 + box_count*floatsPerVertex;
  for (var ij = 0; ij < circle_count*floatsPerVertex; ij++) {
	  gndVerts[size_2+ij] = circleList[ij];
  }

  var size_3 = size_2 + circle_count*floatsPerVertex;
  for (var ij = 0; ij < springCount*floatsPerVertex; ij++) {
	  gndVerts[size_2+ij] = 0.0;
  }
}
