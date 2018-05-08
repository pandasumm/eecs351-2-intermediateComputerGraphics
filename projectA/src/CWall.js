const WTYPE_DEAD    = 0;   // DEAD CONSTRAINT!!!  Abandoned, not in use, no
                            // meaningful values, available for re-use.
// Basic 'Wall' constraints;
//----------------------------
const WTYPE_GROUND   = 1;  // y=0 ground-plane; Kbouncy=0; keeps particle y>=0.
const WTYPE_XWALL_LO = 2;  // planar X wall; keeps particles >= xmin
const WTYPE_XWALL_HI = 3;  // planar X wall; keeps particles <= xmax
const WTYPE_YWALL_LO = 4;  // planar Y wall; keeps particles >= ymin
const WTYPE_YWALL_HI = 5;  // planar Y wall; keeps particles <= ymax
const WTYPE_ZWALL_LO = 6;  // planar Z wall; keeps particles >= zmin
const WTYPE_ZWALL_HI = 7;  // planar Z wall; keeps particles <= zmax
const WTYPE_WALL_GEN = 8;  // Generic wall; a plane that passes thru point at
                            // xpos,ypos,zpos, perpendicular to surface normal
                            // nx,ny,nz. Keep particle set on 'normal' side.
// Distance constraints
//----------------------------
const WTYPE_STICK    = 9;  // Connects 2 particles with fixed-length separation
                            // between particles whose indices are held in e0,e1
                            // (e.g. particles at pS0[e0] and pS0[e1] )
const WTYPE_PULLEY   = 10;  // Keep constant sum-of-distances for 3 particles
                            // A,B,Pivot:  ||A-Pivot||+||B-Pivot|| = dmax.
const WTYPE_ANCHOR   = 11;  // Lock one particle at location xpos,ypos,zpos

// Particle-Volume constraints;
//----------------------------
// (solid volume centered on one movable particle; no other particles allowed
//  inside that volume)
//  NOTE! does not affect encased particle's collisions with obstacle-volume
//        constraints defined below, e.g. solid sphere, solid box, etc.
const WTYPE_PBALL    = 12;  // solid sphere centered at particle with index e0;
                            // no other particles allowed closer than 'radmin'
                            // to the e0 particle.
                            // (NOTE: e0 is a state-vector index: pS0[e0] )
const WTYPE_PBOX     = 13;  // solid, axis-aligned box centered at the particle
                            // with index e0. Box width, height, length ==
                            //  +/-xmax, +/-ymax, +/-zmax, centered at location
                            // of particle pS0[e0].  No other particle allowed
                            // within the box.
// Obstacle-Volume constraints;
//---------------------------
    // solid shapes that keep particle sets OUTSIDE:
const WTYPE_VBOX_OUT  = 14;  // solid box; (xmin,xmax,ymin,ymax,zmin,zmax)
const WTYPE_VBALL_OUT = 15;  // solid sphere at xpos,ypos,zpos; radius radmin
const WTYPE_VCYL_OUT  = 16;  // solid cylinder at xpos,ypos,zpos; radius radmin,
                            // cylinder length dmin, along direction nx,ny,nz
const WTYPE_VMESH_OUT = 17  // solid shape formed by vertex buffer object...
    // hollow shapes that keep particle sets INSIDE:
const WTYPE_VBOX_IN   = 18;  // hollow box; (xmin,xmax,ymin,ymax,zmin,zmax)
const WTYPE_VBALL_IN  = 19;  // hollow sphere at xpos,ypos,zpos, radius dmax
const WTYPE_VCYL_IN   = 20;  // solid cylinder at xpos,ypos,zpos; radius radmax,
                            // cylinder length dmax
const WTYPE_VMESH_IN  = 21  // hollow shape formed by vertex buffer object....

// Surface constraints; restrict particle set to the surface of a shape:
//----------------------------
const WTYPE_SPLANE    = 22;  // Plane thru point xpos,ypos,zpos; normal nx,ny,nz
const WTYPE_SDISK     = 23;  // circular disk,radius radmax, in plane thru point
                            // xpos,ypos,zpos with surface normal nx,ny,nz.
const WTYPE_SBOX      = 24;  // surface of box (xmin,xmax,ymin,ymax,zmin,zmax)
const WTYPE_SBALL     = 25;  // surface of sphere at xpos,ypos,zpos;radius radmax
const WTYPE_SCYL      = 26;  // solid cylinder at xpos,ypos,zpos; radius radmax,
                            // cylinder length dmax, along direction nx,ny,nz
const WTYPE_SMESH     = 27;  // lock selected particles to a VBO's surface

// Line constraints; restrict particles to a 1-D path in 3D
//----------------------------
const WTYPE_SLOT      = 28;   // line thru point xpos,ypos,zpos in direction of
                            // normal vector nx,ny,nz, length dmax.
const WTYPE_MAXVAR    = 29;   // Number of CPart particle types available.

function CWall(type) {
    if (type == undefined) type = WTYPE_VBOX_IN;
	this.wallType = type;

	this.x = gravity_x;
	this.y = gravity_y;
	this.z = gravity_z;
	this.r = 3.0;

	if (this.wallType == WTYPE_VBOX_IN) {
		this.x = gravity_x;
		this.y = gravity_y;
		this.z = gravity_z;
	} else
	if (this.wallType == WTYPE_VCYL_IN) {
		this.x = tonado_x;
		this.y = tonado_y;
		this.z = tonado_z;
	} else
	if (this.wallType == WTYPE_DEAD) {
		this.x = boid_x;
		this.y = boid_y;
		this.z = boid_z;
	} else
	if (this.wallType == WTYPE_VBALL_IN) {
		this.x = flame_x;
		this.y = flame_y;
		this.z = flame_z + 2.0;
	} else
	if (this.wallType == WTYPE_GROUND) {
		this.x = spring_x;
		this.y = spring_y;
		this.z = spring_z;
	} else
	if (this.wallType == WTYPE_VBALL_OUT) {
		this.x = flame_x;
		this.y = flame_y;
		this.z = flame_z + 2.0;
	} else
	if (this.wallType == WTYPE_VCYL_IN) {
		this.x = tonado_x;
		this.y = tonado_y;
		this.z = tonado_z;
	} else
	if (this.wallType == WTYPE_VBOX_OUT) {
		this.x = -moveDistance;
		this.y = 0;
		this.z = 1;
	}



	this.xmin = this.x-1;
	this.ymin = this.y-1;
	this.zmin = this.z-1;
	this.xmax = this.xmin+2;
	this.ymax = this.ymin+2;
	this.zmax = this.zmin+2;

	this.r = 2.0;
}

CWall.prototype.byBox = function(s, s0) {
	if(s.val[PART_XPOS] < this.xmin && s.val[PART_XVEL] < 0.0) {
		s.val[PART_XVEL] = s0.val[PART_XVEL]*g_drag;
		if (s.val[PART_XVEL] < 0.0) s.val[PART_XVEL] *= -g_rest;
		// bounce on left wall.
	}
	else if (s.val[PART_XPOS] > this.xmax && s.val[PART_XVEL] > 0.0) {
			s.val[PART_XVEL] = s0.val[PART_XVEL]*g_drag;
			if (s.val[PART_XVEL] > 0.0) s.val[PART_XVEL] *= -g_rest;
			// bounce on right wall
	}

	if(s.val[PART_YPOS] < this.ymin && s.val[PART_YVEL] < 0.0) {
		s.val[PART_YVEL] = s0.val[PART_YVEL]*g_drag;
		if (s.val[PART_YVEL] < 0.0) s.val[PART_XVEL] *= -g_rest;
		// bounce on floor
	}
	else if( s.val[PART_YPOS] > this.ymax && s.val[PART_YVEL] > 0.0) {
		s.val[PART_YVEL] = s0.val[PART_YVEL]*g_drag;
		if (s.val[PART_YVEL] > 0.0) s.val[PART_YVEL] *= -g_rest;
		// bounce on ceiling
	}

	if(s.val[PART_ZPOS] < this.zmin && s.val[PART_ZVEL] < 0.0) {
		s.val[PART_ZVEL] = s0.val[PART_ZVEL]*g_drag;
		if (s.val[PART_ZVEL] < 0.0) s.val[PART_ZVEL] *= -g_rest;
		// bounce on floor
	}
	else if( s.val[PART_ZPOS] > this.zmax && s.val[PART_ZVEL] > 0.0) {
		s.val[PART_ZVEL] = s0.val[PART_ZVEL]*g_drag;
		if (s.val[PART_ZVEL] > 0.0) s.val[PART_ZVEL] *= -g_rest;
		// bounce on ceiling
	}

	if(s.val[PART_YPOS] <   this.ymin) s.val[PART_YPOS] = this.ymin;
	if(s.val[PART_XPOS] <   this.xmin) s.val[PART_XPOS] = this.xmin;
	if(s.val[PART_ZPOS] <   this.zmin) s.val[PART_ZPOS] = this.zmin;
	if(s.val[PART_XPOS] >=  this.xmax) s.val[PART_XPOS] = this.xmax;
	if(s.val[PART_YPOS] >=  this.ymax) s.val[PART_YPOS] = this.ymax;
	if(s.val[PART_ZPOS] >=  this.zmax) s.val[PART_ZPOS] = this.zmax;
}

CWall.prototype.byCylinder = function(s, s0) {
	if(s.val[PART_ZPOS] < this.zmin && s.val[PART_ZVEL] < 0.0) {
		s.val[PART_ZVEL] = s0.val[PART_ZVEL]*g_drag;
		if (s.val[PART_ZVEL] < 0.0) s.val[PART_ZVEL] *= -g_rest;
		// bounce on floor
	}
	else if( s.val[PART_ZPOS] > this.zmax && s.val[PART_ZVEL] > 0.0) {
		s.val[PART_ZVEL] = s0.val[PART_ZVEL]*g_drag;
		if (s.val[PART_ZVEL] > 0.0) s.val[PART_ZVEL] *= -g_rest;
	}

	var dis_x = s.val[PART_XPOS] - this.x;
	var dis_y = s.val[PART_YPOS] - this.y;
	var dis = Math.sqrt(dis_x*dis_x + dis_y*dis_y);
	if (dis > 1.0) {
		s.val[PART_XPOS] = s0.val[PART_XPOS];
		s.val[PART_YPOS] = s0.val[PART_YPOS];

		s.val[PART_XVEL] = -s0.val[PART_XVEL]*g_drag;
		s.val[PART_YVEL] = -s0.val[PART_YVEL]*g_drag;
	}
}

CWall.prototype.byBall = function(s, s0) {

	var dis_x = s.val[PART_XPOS] - this.x;
	var dis_y = s.val[PART_YPOS] - this.y;
	var dis_z = s.val[PART_ZPOS] - this.z;

	var dis = Math.sqrt(dis_x*dis_x + dis_y*dis_y + dis_z*dis_z);
	if (dis > 3) {
		s.val[PART_XPOS] = s0.val[PART_XPOS];
		s.val[PART_YPOS] = s0.val[PART_YPOS];
		s.val[PART_ZPOS] = s0.val[PART_ZPOS];

		s.val[PART_XVEL] = -s0.val[PART_XVEL]*g_drag;
		s.val[PART_YVEL] = -s0.val[PART_YVEL]*g_drag;
		s.val[PART_ZVEL] = -s0.val[PART_ZVEL]*g_drag;
	}
}

CWall.prototype.byBallOut = function(s, s0) {
	var dis_x = s.val[PART_XPOS] - this.x;
	var dis_y = s.val[PART_YPOS] - this.y;
	var dis_z = s.val[PART_ZPOS] - this.z;

	var dis = Math.sqrt(dis_x*dis_x + dis_y*dis_y + dis_z*dis_z);
	if (dis < 3) {
		s.val[PART_XPOS] = s0.val[PART_XPOS];
		s.val[PART_YPOS] = s0.val[PART_YPOS];
		s.val[PART_ZPOS] = s0.val[PART_ZPOS];

		s.val[PART_XVEL] = -s0.val[PART_XVEL]*g_drag*g_rest*0.3;
		s.val[PART_YVEL] = -s0.val[PART_YVEL]*g_drag*g_rest*0.3;
		s.val[PART_ZVEL] = -s0.val[PART_ZVEL]*g_drag*g_rest*0.3;
	}
}

CWall.prototype.byCylOut = function(s, s0) {

	var dis_x = s.val[PART_XPOS] - this.x;
	var dis_y = s.val[PART_YPOS] - this.y;
	var dis = Math.sqrt(dis_x*dis_x + dis_y*dis_y);
	if (dis < 1.0 && s.val[PART_ZPOS] > this.zmin && s.val[PART_ZPOS] < this.zmax) {
		s.val[PART_XPOS] = s0.val[PART_XPOS];
		s.val[PART_YPOS] = s0.val[PART_YPOS];
		s.val[PART_ZPOS] = s0.val[PART_ZPOS];

		s.val[PART_XVEL] = -s0.val[PART_XVEL]*g_drag*g_rest;
		s.val[PART_YVEL] = -s0.val[PART_YVEL]*g_drag*g_rest;
		s.val[PART_ZVEL] = -s0.val[PART_ZVEL]*g_drag*g_rest;
	}
}

CWall.prototype.byBoxOut = function(s, s0, r) {
	if (s.val[PART_XPOS] > this.x-r && s.val[PART_XPOS] < this.x+r
	&& s.val[PART_YPOS] > this.y-r && s.val[PART_YPOS] < this.y+r
	&& s.val[PART_ZPOS] > this.z-r && s.val[PART_ZPOS] < this.y+r) {
		s.val[PART_XPOS] = s0.val[PART_XPOS];
		s.val[PART_YPOS] = s0.val[PART_YPOS];
		s.val[PART_ZPOS] = s0.val[PART_ZPOS];

		s.val[PART_XVEL] = -s0.val[PART_XVEL]*g_drag;
		s.val[PART_YVEL] = -s0.val[PART_YVEL]*g_drag;
		s.val[PART_ZVEL] = -s0.val[PART_ZVEL]*g_drag;
	}
}

CWall.prototype.byStick = function(e1, z1, e0, z0, dist) {

	if (e1.val[PART_ZPOS] - e0.val[PART_ZPOS] < 0.5 * dist) {
		if (e1.val[PART_ZVEL] < 0) {
			e1.val[PART_ZVEL] = -z1.val[PART_ZVEL]*g_drag;
		}
		// e1.val[PART_ZPOS] = e0.val[PART_ZPOS] + 0.5 * dist;
	}
	else if (e1.val[PART_ZPOS] - e0.val[PART_ZPOS] > 2.0 * dist) {
		if (e1.val[PART_ZVEL] > 0) {
			e1.val[PART_ZVEL] = -z1.val[PART_ZVEL]*g_drag;
		}
		// e1.val[PART_ZPOS] = e0.val[PART_ZPOS] + 2.0 * dist;
	}
}

CWall.prototype.bySlot = function(e1, center) {
	e1.val[PART_XPOS] = center[0];
	e1.val[PART_YPOS] = center[1];
	e1.val[PART_ZPOS] = center[2];
}
