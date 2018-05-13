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

    p.val[PART_X_FTOT] =  5* (distanceY);
	p.val[PART_Y_FTOT] =  5* (-distanceX);
    p.val[PART_X_FTOT] += 5* ( (2-p.val[PART_ZPOS] )*(-distanceX));
    p.val[PART_Y_FTOT] += 5* ( (2-p.val[PART_ZPOS] )*(-distanceY));

    p.val[PART_Z_FTOT] = -4.832/p.val[PART_MASS]
	p.val[PART_Z_FTOT] += Math.abs(distanceX)*10 + Math.abs(distanceY)*10 - 4*p.val[PART_ZPOS]
}

CForcer.prototype.applyCharge = function(p, center, lead) {
	var F1 = 2.0;
	var F2 = 1.0;
	var F3 = 2.0;

	var leave_center_x = avoidMinMax(center[PART_XPOS]-p.val[PART_XPOS]);
	var leave_center_y = avoidMinMax(center[PART_YPOS]-p.val[PART_YPOS]);
	var leave_center_z = avoidMinMax(center[PART_ZPOS]-p.val[PART_ZPOS]);

	p.val[PART_X_FTOT] += F1*leave_center_x*Math.abs(leave_center_x);
	p.val[PART_Y_FTOT] += F1*leave_center_y*Math.abs(leave_center_y);
	p.val[PART_Z_FTOT] += F1*leave_center_z*Math.abs(leave_center_z);

	p.val[PART_X_FTOT] += F2/(leave_center_x*Math.abs(leave_center_x));
	p.val[PART_Y_FTOT] += F2/(leave_center_y*Math.abs(leave_center_y));
	p.val[PART_Z_FTOT] += F2/(leave_center_z*Math.abs(leave_center_z));

	var lead_dis_x = lead.val[PART_XPOS]-p.val[PART_XPOS];
	var lead_dis_y = lead.val[PART_YPOS]-p.val[PART_YPOS];
	var lead_dis_z = lead.val[PART_ZPOS]-p.val[PART_ZPOS];

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

}
