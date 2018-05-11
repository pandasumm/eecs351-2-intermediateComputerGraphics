const NU_SOLV_EULER       = 0;       // Euler integration: forward,explicit,...
const NU_SOLV_MIDPOINT    = 1;       // Midpoint Method (see Pixar Tutorial)
const NU_SOLV_ADAMS_BASH  = 2;       // Adams-Bashforth Explicit Integrator
const NU_SOLV_RUNGEKUTTA  = 3;       // Arbitrary degree, set by 'solvDegree'

const NU_SOLV_BACK_EULER  = 4;       // Iterative implicit solver;'back-winding'
const NU_SOLV_BACK_MIDPT  = 5;

const NU_SOLV_VERLET      = 6;       // Verlet semi-implicit integrator;
const NU_SOLV_VEL_VERLET  = 7;       // 'Velocity-Verlet'semi-implicit integrator
const NU_SOLV_MAX         = 8;       // number of solver types available.

var g_solver = NU_SOLV_EULER;
var g_render = 0;
var g_mouse = 0;
var g_mouse_x = 0;
var g_mouse_y = 0;

function CPartSys() {
	this.forces = [];
	this.forces.push(new CForcer(F_GRAV_P));
	this.forces.push(new CForcer(F_WIND));
	this.forces.push(new CForcer(F_CHARGE));
	this.forces.push(new CForcer(F_SPRING));
	this.forces.push(new CForcer(F_MOUSE));
	// this.forces.push(new CForcer(F_CHARGE4));

	this.walls = [];
	this.walls.push(new CWall(WTYPE_VBOX_IN));
	this.walls.push(new CWall(WTYPE_VCYL_IN));
	this.walls.push(new CWall(WTYPE_DEAD));
	this.walls.push(new CWall(WTYPE_VBALL_IN));
	this.walls.push(new CWall(WTYPE_VBALL_OUT));
	this.walls.push(new CWall(WTYPE_GROUND));
	this.walls.push(new CWall(WTYPE_VCYL_OUT));
	this.walls.push(new CWall(WTYPE_STICK));
	this.walls.push(new CWall(WTYPE_SLOT));
	this.walls.push(new CWall(WTYPE_VBALL_OUT));
	this.walls.push(new CWall(WTYPE_VCYL_OUT));
	this.walls.push(new CWall(WTYPE_VBOX_OUT));

	this.walls[9].x += moveDistance;
	this.walls[10].x -= moveDistance;
	this.walls[11].x -= moveDistance;


	this.ps     = this.initPS();
	this.psdot  = this.initPS();
	this.ps1    = this.initPS();
	this.psM    = this.initPS();
	this.psMdot = this.initPS();
	this.psB    = this.initPS();
	this.psBdot = this.initPS();
}

CPartSys.prototype.initPS = function() {
	s = [];
	for (var i = 0; i < partCount; i++) {
		s.push(new CPart(GRAVITY));
	}

	for (var i = 0; i < tonadoCount; i++) {
		s.push(new CPart(TORNADO));
	}

	for (var i = 0; i < boidCount; i++) {
		s.push(new CPart(FLOCK));
	}

	for (var i = 0; i < flameCount; i++) {
		s.push(new CPart(FIRE));
	}

	for (var i = 0; i < springCount; i++) {
		s.push(new CPart(SPRING));
	}
	return s;
}

var boid_center_x = boid_x;
var boid_center_y = boid_y;
var boid_center_z = boid_z;

var boid_speed_x = 0.0;
var boid_speed_y = boid_speed;
var boid_speed_z = 0.0;


CPartSys.prototype.applyAllForces = function(s) {
		// apply all forces except a state varibale, and compute all forces for particle in that state

		var boid_sum_x = 0;
		var boid_sum_y = 0;
		var boid_sum_z = 0;

		var boid_speed_sum_x = 0;
		var boid_speed_sum_y = 0;
		var boid_speed_sum_z = 0;

		for (var idx = 0; idx < boidCount; idx++) {
			var j = partCount + tonadoCount + idx;
			boid_sum_x += s[j].val[PART_XPOS];
			boid_sum_y += s[j].val[PART_YPOS];
			boid_sum_z += s[j].val[PART_ZPOS];
		}

		var boid_center = [boid_sum_x / boidCount, boid_sum_y / boidCount, boid_sum_z / boidCount];
		var lead = new CPart(FLOCK);

		for (var j = 0; j < s.length; j++) {
			s[j].val[PART_X_FTOT] = 0;
			s[j].val[PART_Y_FTOT] = 0;
			s[j].val[PART_Z_FTOT] = 0;

			for (var i = 0; i < this.forces.length; i++) {
				if (this.forces[i].forceType == F_GRAV_P && s[j].appliedForces.indexOf(F_GRAV_P) >= 0) {
					this.forces[i].applyGravity(s[j]);
				}

				if (this.forces[i].forceType == F_WIND && s[j].appliedForces.indexOf(F_WIND) >= 0) {
					this.forces[i].applyWind(s[j]);
				}

				if (g_mouse == 0 && this.forces[i].forceType == F_CHARGE && s[j].appliedForces.indexOf(F_CHARGE) >= 0) {
					var xdis = s[j].val[PART_XPOS]-0.0;
					var ydis = s[j].val[PART_YPOS]-0.0;
					var dis = Math.sqrt(xdis*xdis + ydis*ydis);

					var leadID = partCount+tonadoCount+1;
					if (j == leadID) {
						var f = boid_speed * boid_speed / dis;
						s[j].val[PART_X_FTOT] += -f*xdis/dis;
						s[j].val[PART_Y_FTOT] += -f*ydis/dis;
						lead = s[j];
					} else {
						this.forces[i].applyCharge(s[j], boid_center, lead);
					}
				}

				if (this.forces[i].forceType == F_SPRING && s[j].appliedForces.indexOf(F_SPRING) >= 0) {
					var target = j - 1;
					// if (s[target].partType != SPRING || s[j].val[PART_YPOS] != s[target].val[PART_YPOS]) continue;
                    if (s[target].partType != SPRING) continue;

					this.forces[i].applySpring(s[j], s[target]);
				}
				if (g_mouse == 1 && this.forces[i].forceType == F_MOUSE && s[j].appliedForces.indexOf(F_MOUSE) >= 0) {
					this.forces[i].applyMouse(s[j]);
				}
			}
		}
}

CPartSys.prototype.dotMaker = function(s0, s0dot) {
	for (var j = 0; j < s0.length; j++) {
		s0dot[j].val[PART_XVEL] = s0[j].val[PART_X_FTOT]/s0[j].val[PART_MASS];
		s0dot[j].val[PART_YVEL] = s0[j].val[PART_Y_FTOT]/s0[j].val[PART_MASS];
		s0dot[j].val[PART_ZVEL] = s0[j].val[PART_Z_FTOT]/s0[j].val[PART_MASS];

		s0dot[j].val[PART_XPOS] = s0[j].val[PART_XVEL];
		s0dot[j].val[PART_YPOS] = s0[j].val[PART_YVEL];
		s0dot[j].val[PART_ZPOS] = s0[j].val[PART_ZVEL];
	}
}

CPartSys.prototype.eulerAdd = function(s1, s0, s0dot, interval, multiple) {
	for (var i = 0; i < s0.length; i++) {
		s1[i].val[PART_XVEL] = s0[i].val[PART_XVEL] + s0dot[i].val[PART_XVEL]*interval*multiple;
		s1[i].val[PART_YVEL] = s0[i].val[PART_YVEL] + s0dot[i].val[PART_YVEL]*interval*multiple;
		s1[i].val[PART_ZVEL] = s0[i].val[PART_ZVEL] + s0dot[i].val[PART_ZVEL]*interval*multiple;

		s1[i].val[PART_XPOS] = s0[i].val[PART_XPOS] + s0dot[i].val[PART_XPOS]*interval*multiple;
		s1[i].val[PART_YPOS] = s0[i].val[PART_YPOS] + s0dot[i].val[PART_YPOS]*interval*multiple;
		s1[i].val[PART_ZPOS] = s0[i].val[PART_ZPOS] + s0dot[i].val[PART_ZPOS]*interval*multiple;
	}
}

CPartSys.prototype.copy = function(s1, s2) {
	for (var i = 0; i < s1.length; i++) {
		for (var j = 0; j < PART_MAXVAR; j++) {
			s2[i].val[j] = s1[i].val[j];
		}
	}
}


CPartSys.prototype.solver = function(timeStep) {
	if (g_solver == NU_SOLV_EULER) {
		this.applyAllForces(this.ps);
		this.dotMaker(this.ps, this.psdot);
		this.eulerAdd(this.ps1, this.ps, this.psdot, timeStep, 1);
	}

	if (g_solver == NU_SOLV_MIDPOINT) {
		this.copy(this.ps, this.psM);
		// this.copy(this.ps, this.psdot);
		// this.copy(this.ps, this.ps1);

		this.applyAllForces(this.ps);
		this.dotMaker(this.ps, this.psdot);
		this.eulerAdd(this.psM, this.ps, this.psdot, timeStep, 0.5);

		this.applyAllForces(this.psM);
		this.dotMaker(this.psM, this.psMdot);
		this.eulerAdd(this.ps1, this.ps, this.psMdot, timeStep, 1);
	}

	if (g_solver == NU_SOLV_BACK_EULER) {
		this.copy(this.ps, this.psM);
		this.copy(this.ps, this.psB);

		this.applyAllForces(this.ps);
		this.dotMaker(this.ps, this.psdot);
		this.eulerAdd(this.psM, this.ps, this.psdot, timeStep, 1);

		this.applyAllForces(this.psM);
		this.dotMaker(this.psM, this.psMdot);
		this.eulerAdd(this.psB, this.ps, this.psMdot, timeStep, -1);

		for (var i = 0; i < this.ps.length; i++) {
			this.ps1[i].val[PART_XVEL] = this.psM[i].val[PART_XVEL] + (this.ps[i].val[PART_XVEL] - this.psB[i].val[PART_XVEL]) / 2;
			this.ps1[i].val[PART_YVEL] = this.psM[i].val[PART_YVEL] + (this.ps[i].val[PART_YVEL] - this.psB[i].val[PART_YVEL]) / 2;
			this.ps1[i].val[PART_ZVEL] = this.psM[i].val[PART_ZVEL] + (this.ps[i].val[PART_ZVEL] - this.psB[i].val[PART_ZVEL]) / 2;

			this.ps1[i].val[PART_XPOS] = this.psM[i].val[PART_XPOS] + (this.ps[i].val[PART_XPOS] - this.psB[i].val[PART_XPOS]) / 2;
			this.ps1[i].val[PART_YPOS] = this.psM[i].val[PART_YPOS] + (this.ps[i].val[PART_YPOS] - this.psB[i].val[PART_YPOS]) / 2;
			this.ps1[i].val[PART_ZPOS] = this.psM[i].val[PART_ZPOS] + (this.ps[i].val[PART_ZPOS] - this.psB[i].val[PART_ZPOS]) / 2;
		}
	}

	if (g_solver == NU_SOLV_BACK_MIDPT) {
		this.copy(this.ps, this.psM);
		this.copy(this.ps, this.psB);

		this.applyAllForces(this.ps);
		this.dotMaker(this.ps, this.psdot);
		this.eulerAdd(this.psM, this.ps, this.psdot, timeStep, 1);

		this.applyAllForces(this.psM);
		this.dotMaker(this.psM, this.psMdot);
		this.eulerAdd(this.psB, this.ps, this.psMdot, timeStep, -0.5);

		this.applyAllForces(this.psB);
		this.dotMaker(this.psB, this.psBdot);
		this.eulerAdd(this.ps1, this.ps, this.psBdot, timeStep, 1);
	}
}

CPartSys.prototype.StateVecSwap = function(s0, s1) {
	for (var i = 0; i < s0.length; i++) {
		var temp = {};
		temp = s0[i].val;
		s0[i].val = s1[i].val;
		s1[i].val = temp;
	}
}

CPartSys.prototype.UpdateColor = function(s) {

    j = partCount + tonadoCount+ boidCount;
	for (var i = 0; i < flameCount; i++) {
		s[j+i].val[PART_R] = s[j+i].val[PART_ZPOS]/4 + 0.5;
        s[j+i].val[PART_G] = s[j+i].val[PART_ZPOS]/4;
        s[j+i].val[PART_B] = s[j+i].val[PART_ZPOS]/5;
	}
    // console.log("updating color")
}


CPartSys.prototype.doConstraint = function(ps, ps0) {
	for(var i = 0; i < ps.length; i++) {			// for every particle in s0 state:
		for (var j = 0; j < this.walls.length; j++) {
			if (this.walls[j].wallType == WTYPE_VBOX_IN && ps[i].appliedWall.indexOf(WTYPE_VBOX_IN) >= 0) {
				this.walls[j].byBox(ps[i], ps0[i]);
			}
			if (this.walls[j].wallType == WTYPE_VCYL_IN && ps[i].appliedWall.indexOf(WTYPE_VCYL_IN) >= 0) {
				this.walls[j].byCylinder(ps[i], ps0[i]);
			}
			if (this.walls[j].wallType == WTYPE_VBALL_IN && ps[i].appliedWall.indexOf(WTYPE_VBALL_IN) >= 0) {
				this.walls[j].byBall(ps[i], ps0[i]);
			}
			if (this.walls[j].wallType == WTYPE_VBALL_OUT && ps[i].appliedWall.indexOf(WTYPE_VBALL_OUT) >= 0) {
				this.walls[j].byBallOut(ps[i], ps0[i]);
			}
			if (this.walls[j].wallType == WTYPE_VCYL_OUT && ps[i].appliedWall.indexOf(WTYPE_VCYL_OUT) >= 0) {
				this.walls[j].byCylOut(ps[i], ps0[i]);
			}
			if (this.walls[j].wallType == WTYPE_VBOX_OUT && ps[i].appliedWall.indexOf(WTYPE_VBOX_OUT) >= 0) {
				this.walls[j].byBoxOut(ps[i], ps0[i], 2);
			}
			if (this.walls[j].wallType == WTYPE_STICK && ps[i].appliedWall.indexOf(WTYPE_STICK) >= 0) {
				var target = i - 1;
				// if (ps[target].partType != SPRING || ps[i].val[PART_YPOS] != ps[target].val[PART_YPOS]) continue;
                if (ps[target].partType != SPRING) continue;
				// var flag = ((target - toSpringCount) / springInterval) % 2 ? 1 : 1;
				this.walls[j].byStick(ps[i], ps0[i], ps[target],ps0[target], springLength);
			}
			if (this.walls[j].wallType == WTYPE_SLOT && ps[i].appliedWall.indexOf(WTYPE_SLOT) >= 0) {
				var n = i - toSpringCount;
				// if (n == springInterval) console.log("hp");
				if (n % springInterval != springInterval-1) continue;
				var local_y = spring_y + springLength * parseInt(n / springInterval);
				var local_z = spring_z + springLength * 1.5 * (springInterval);
				this.walls[j].bySlot(ps[i], vec3.fromValues(spring_x, local_y, local_z));
			}

		}
	}
}
