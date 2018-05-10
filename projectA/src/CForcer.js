function avoidMinMax(n) {
	var mi = 1.0;
	var ma = 8.0;
	if (Math.abs(n) < ma && Math.abs(n) > mi) return n;
	if (Math.abs(n) > ma) {
		return n > 0 ? ma : -ma;
	}
	else {
		return n > 0 ? mi : -mi;
	}
}


const F_NONE      = 0;       // Non-existent force: ignore this CForcer object
const F_MOUSE     = 1;       // Spring-like connection to the mouse cursor; lets
                            // you 'grab' and 'wiggle' one particle(or several).
const F_GRAV_E    = 2;       // Earth-gravity: pulls all particles 'downward'.
const F_GRAV_P    = 3;       // Planetary-gravity; particle-pair (e0,e1) attract
                            // each other with force== grav* mass0*mass1/ dist^2
const F_WIND      = 4;       // Blowing-wind-like force-field;fcn of 3D position
const F_BUBBLE    = 5;       // Constant inward force towards centerpoint if
                            // particle is > max_radius away from centerpoint.
const F_DRAG      = 6;       // Viscous drag -- proportional to neg. velocity.
const F_SPRING    = 7;       // ties together 2 particles; distance sets force
const F_SPRINGSET = 8;       // a big collection of identical springs; lets you
                            // make cloth & rubbery shapes as one force-making
                            // object, instead of many many F_SPRING objects.
const F_CHARGE    = 9;       // attract/repel by charge and inverse distance;
                            // applies to all charged particles.
const F_BOIDFORWARD = 10;
const F_MAXKINDS  = 11;      // 'max' is always the LAST name in our list;

function CForcer(type) {
	this.forceType = type;
	this.down = new Float32Array(3);
	this.gravConst = 9.8;

	this.mag = 1;
	this.x = gravity_x;
	this.y = gravity_y;
	this.z = gravity_z;

	if (this.forceType == F_WIND) {
		this.x = tonado_x;
		this.y = tonado_y;
		this.z = tonado_z;
	}
	if (this.forceType == F_CHARGE) {
		this.x = boid_x;
		this.y = boid_y;
		this.z = boid_z;
	}
	if (this.forceType == F_SPRING) {
		this.x = spring_x;
		this.y = spring_y;
		this.z = spring_z;
	}
}

CForcer.prototype.applyGravity = function(p) {
	p.val[PART_Z_FTOT] -= this.gravConst;
}

CForcer.prototype.applyWind = function(p) {
	var distanceX = p.val[PART_XPOS] - this.x;
	var distanceY = p.val[PART_YPOS] - this.y;
	var distanceZ = p.val[PART_ZPOS] - this.z;
	if (Math.abs(distanceX) < 0.1) distanceX = Math.sign(Math.random()*2-1)*0.1;
	if (Math.abs(distanceY) < 0.1) distanceY = Math.sign(Math.random()*2-1)*0.1;
	if (Math.abs(distanceZ) < 0.1) distanceZ = Math.sign(Math.random()*2-1)*0.1;

	var dist_2 = distanceX*distanceX + distanceY*distanceY + distanceZ*distanceZ;
	var dist = Math.sqrt(dist_2);

	var h_dist_2 = distanceX*distanceX + distanceY*distanceY;
	var h_dist = Math.sqrt(h_dist_2);

	var F1 = vec4.fromValues(-distanceY,  distanceX, 0.0, 1.0);
	vec4.scale(F1, F1, 1/h_dist_2*10/3.0);

	var F2 = vec4.fromValues(-distanceX, -distanceY, 0.0, 1.0);
	vec4.scale(F2, F2, 1/dist_2*10/3.0);

	var F3 = vec4.fromValues(0.0, 0.0, 0.5, 1.0);
	vec4.scale(F3, F3, 1/h_dist);

	var tempF = vec4.create();
	vec4.add(tempF, tempF, F1);
	vec4.add(tempF, tempF, F2);
	vec4.add(tempF, tempF, F3);

	p.val[PART_X_FTOT] += tempF[0];
	p.val[PART_Y_FTOT] += tempF[1];
	p.val[PART_Z_FTOT] += tempF[2];
	p.val[PART_Z_FTOT] += this.gravConst / 10.0 * 9;
}

CForcer.prototype.applyCharge = function(p, center, lead) {
	var F1 = 2.0;
	var F2 = 1.0;
	var F3 = 2.0;

	var leave_center_x = avoidMinMax(center[0]-p.val[PART_XPOS]);
	var leave_center_y = avoidMinMax(center[1]-p.val[PART_YPOS]);
	var leave_center_z = avoidMinMax(center[2]-p.val[PART_ZPOS]);

	// add center force
	p.val[PART_X_FTOT] += F1*leave_center_x*Math.abs(leave_center_x);
	p.val[PART_Y_FTOT] += F1*leave_center_y*Math.abs(leave_center_y);
	p.val[PART_Z_FTOT] += F1*leave_center_z*Math.abs(leave_center_z);

	// leave center force
	p.val[PART_X_FTOT] += F2/(leave_center_x*leave_center_x*(leave_center_x/Math.abs(leave_center_x)));
	p.val[PART_Y_FTOT] += F2/(leave_center_y*leave_center_y*(leave_center_y/Math.abs(leave_center_y)));
	p.val[PART_Z_FTOT] += F2/(leave_center_z*leave_center_z*(leave_center_z/Math.abs(leave_center_z)));

	// follow general velocity
	var lead_dis_x = lead.val[PART_XPOS]-p.val[PART_XPOS];
	var lead_dis_y = lead.val[PART_YPOS]-p.val[PART_YPOS];
	var lead_dis_z = lead.val[PART_ZPOS]-p.val[PART_ZPOS];

	var lead_sp_x = lead.val[PART_XVEL]-p.val[PART_XVEL];
	var lead_sp_y = lead.val[PART_YVEL]-p.val[PART_YVEL];
	var lead_sp_z = lead.val[PART_ZVEL]-p.val[PART_ZVEL];

	p.val[PART_X_FTOT] += F3*lead_dis_x*Math.abs(lead_dis_x);
	p.val[PART_Y_FTOT] += F3*lead_dis_y*Math.abs(lead_dis_y);
	p.val[PART_Z_FTOT] += F3*lead_dis_z*Math.abs(lead_dis_z);
}

CForcer.prototype.applySpring = function(p, q) {
	var dis_x = q.val[PART_XPOS] - p.val[PART_XPOS];
	var dis_y = q.val[PART_YPOS] - p.val[PART_YPOS];
	var dis_z = q.val[PART_ZPOS] - p.val[PART_ZPOS];
	var dis = Math.max(Math.sqrt(dis_x*dis_x+dis_y*dis_y+dis_z*dis_z), 0.1);

	dis_x /= dis;
	dis_y /= dis;
	dis_z /= dis;

	var mag = (dis - springLength) * springRate;

	p.val[PART_X_FTOT] += mag * dis_x;
	p.val[PART_Y_FTOT] += mag * dis_y;
	p.val[PART_Z_FTOT] += mag * dis_z;

	q.val[PART_X_FTOT] -= mag * dis_x;
	q.val[PART_Y_FTOT] -= mag * dis_y;
	q.val[PART_Z_FTOT] -= mag * dis_z;

	// var xtmp = p.val[PART_XVEL] - q.val[PART_XVEL];
	// var ytmp = p.val[PART_YVEL] - q.val[PART_YVEL];
	// var ztmp = p.val[PART_ZVEL] - q.val[PART_ZVEL];
    //
	// mag = (xtmp * dis_x + ytmp * dis_y + ztmp * dis_z) * 0.8;
    //
	// p.val[PART_X_FTOT] -= mag * dis_x;
	// p.val[PART_Y_FTOT] -= mag * dis_y;
	// p.val[PART_Z_FTOT] -= mag * dis_z;
    //
	// q.val[PART_X_FTOT] += mag * dis_x;
	// q.val[PART_Y_FTOT] += mag * dis_y;
	// q.val[PART_Z_FTOT] += mag * dis_z;
}

CForcer.prototype.applyMouse = function(p) {
	var dis_x = p.val[PART_XPOS] - g_mouse_x;
	var dis_y = p.val[PART_YPOS] - g_mouse_y;
	var dis = Math.sqrt(dis_x*dis_x + dis_y*dis_y);
	dis = Math.max(dis, 0.1);
	var f = boid_speed * boid_speed / dis;
	p.val[PART_X_FTOT] += f*dis_x/dis;
	p.val[PART_Y_FTOT] += f*dis_y/dis;
}
