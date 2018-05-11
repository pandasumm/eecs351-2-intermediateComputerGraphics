// Give meaningful names to array indices for the particle(s) in state vectors.
const PART_XPOS = 0; //  position
const PART_YPOS = 1;
const PART_ZPOS = 2;
const PART_XVEL = 3; //  velocity
const PART_YVEL = 4;
const PART_ZVEL = 5;
const PART_X_FTOT = 6; // force accumulator:'ApplyForces()' fcn clears
const PART_Y_FTOT = 7; // to zero, then adds each force to each particle.
const PART_Z_FTOT = 8;
const PART_R = 9; // color : red,green,blue
const PART_G = 10;
const PART_B = 11;
const PART_MASS = 12; // mass
const PART_DIAM = 13; // on-screen diameter (in pixels)
const PART_RENDMODE = 14; // on-screen appearance (square, round, or soft-round)
const PART_AGE = 15;
const PART_MAXVAR = 16; // Size of array in CPart uses to store its values.

const GRAVITY = 0;
const TORNADO = 1;
const FLOCK = 2;
const FIRE = 3;
const SPRING = 4;

function CPart(type) {
    // if (type == undefined) type = PTYPE_ALIVE;
    this.partType = type;
    this.val = new Float32Array(PART_MAXVAR);
    this.appliedForces = [];
    this.appliedWall = [];
}

CPart.prototype.reset = function() {
    var xcyc = roundRand3D();
    this.val[PART_XVEL] = INIT_VEL * (0.1 + 0.05 * xcyc[0]);
    this.val[PART_YVEL] = INIT_VEL * (0.1 + 0.05 * xcyc[1]);
    this.val[PART_ZVEL] = INIT_VEL * (0.1 + 0.05 * xcyc[2]);
    this.val[PART_X_FTOT] = 0.0;
    this.val[PART_Y_FTOT] = 0.0;
    this.val[PART_Z_FTOT] = 0.0;
    this.val[PART_R] = 0.2 + 0.8 * Math.random();
    this.val[PART_G] = 0.2 + 0.8 * Math.random();
    this.val[PART_B] = 0.2 + 0.8 * Math.random();
    this.val[PART_MASS] = 0.9 + 0.2 * Math.random();
    this.val[PART_MASS] = 1.0;
    this.val[PART_DIAM] = 1.0 + 10.0 * Math.random();
    this.val[PART_RENDMODE] = Math.floor(4.0 * Math.random());
    this.val[PART_AGE] = 0.0;

    xcyc = roundRand3D();
    if (this.partType == GRAVITY) {
        this.val[PART_XPOS] = 0.2 + 0.5 * xcyc[0] + gravity_x;
        this.val[PART_YPOS] = 0.2 + 0.5 * xcyc[1] + gravity_y;
        this.val[PART_ZPOS] = 0.2 + 0.5 * xcyc[2] + gravity_z;

        this.appliedForces = [F_GRAV_P];
        this.appliedWall = [WTYPE_VBOX_IN];
    }
    if (this.partType == TORNADO) {
        this.val[PART_XPOS] = 0.2 + 0.5 * xcyc[0] + tonado_x;
        this.val[PART_YPOS] = 0.2 + 0.5 * xcyc[1] + tonado_y;
        this.val[PART_ZPOS] = 0.2 + 0.5 * xcyc[2] + tonado_z;
        this.appliedForces = [F_WIND];
        this.appliedWall = [WTYPE_VCYL_IN];
    }
    if (this.partType == FLOCK) {
        this.val[PART_XPOS] = 0.2 + 0.5 * xcyc[0] + boid_x;
        this.val[PART_YPOS] = 0.2 + 0.5 * xcyc[1] + boid_y;
        this.val[PART_ZPOS] = 0.2 + 0.5 * xcyc[2] + boid_z;
        this.val[PART_XVEL] = 0;
        this.val[PART_YVEL] = 0;
        this.val[PART_ZVEL] = 0;
        this.appliedForces = [F_CHARGE, F_MOUSE];
        // this.appliedWall = [WTYPE_VBALL_OUT, WTYPE_VCYL_OUT, WTYPE_VBOX_OUT];
    }
    if (this.partType == FIRE) {
        this.val[PART_XPOS] = 0.2 + 0.5 * xcyc[0] + flame_x;
        this.val[PART_YPOS] = 0.2 + 0.5 * xcyc[1] + flame_y;
        this.val[PART_ZPOS] = 0.2 + 0.5 * xcyc[2] + flame_z;
        this.appliedForces = [F_GRAV_P];
        this.appliedWall = [WTYPE_VBALL_IN];
    }
    if (this.partType == SPRING) {
        this.val[PART_XPOS] = 0.0 + spring_x;
        this.val[PART_YPOS] = 0.0 + spring_y;
        this.val[PART_ZPOS] = 0.0 + spring_z;

        this.val[PART_XVEL] = 0;
        this.val[PART_YVEL] = 0;
        this.val[PART_ZVEL] = 0;
        // this.val[PART_XVEL] = 0.2*Math.random();
        // this.val[PART_YVEL] = 0.2*Math.random();
        // this.val[PART_ZVEL] = 0.2*Math.random();
        this.appliedForces = [F_SPRING];
        this.appliedWall = [WTYPE_GROUND, WTYPE_STICK, WTYPE_SLOT, F_GRAV_P];
    }
}

CPart.prototype.makeFire = function() {

    xcyc = roundRand3D();
    this.val[PART_XPOS] = flame_x + 0.2 * xcyc[0]; // 0.0 <= randomRound() < 1.0
    this.val[PART_YPOS] = flame_y + 0.2 * xcyc[1];
    this.val[PART_ZPOS] = flame_z + 0.2 * xcyc[2];

    var alpha = 2 * Math.PI * Math.random();
    var theta = Math.PI / 6 * Math.random();

    var speedup = 30 + 40 * Math.random();

    this.val[PART_XVEL] = INIT_VEL * Math.sin(alpha) * speedup / 7.0;
    this.val[PART_YVEL] = INIT_VEL * Math.cos(alpha) * speedup / 7.0;
    this.val[PART_ZVEL] = INIT_VEL * Math.sin(theta + Math.PI / 3) * speedup / 1.0;

    this.val[PART_DIAM] = 1.0 + 10.0 * Math.random();

    this.val[PART_R] = 0.6 + 0.2 * Math.random();
    this.val[PART_G] = 0.1 + 0.5 * Math.random();
    this.val[PART_B] = 0.1 + 0.5 * Math.random();

    this.val[PART_AGE] = -Math.random();

}

CPart.prototype.makeSpring = function(n) {

    this.val[PART_ZPOS] = spring_z + springLength * 1.5 * (n % springInterval);

    this.val[PART_YPOS] += springLength * parseInt(n / springInterval) + 0.1 * Math.random();
    this.val[PART_XPOS] += 0.5 * Math.random();

    this.val[PART_DIAM] = 15 * springLength;
}

function roundRand3D() {
    do {
        xball = 2.0 * Math.random() - 1.0;
        yball = 2.0 * Math.random() - 1.0;
        zball = 2.0 * Math.random() - 1.0;
    } while (xball * xball + yball * yball + zball * zball >= 1.0);
    ret = new Array(xball, yball, zball);
    return ret;
}

function roundRand2D() {
    //==============================================================================
    var xy = [0, 0];
    do { // 0.0 <= Math.random() < 1.0 with uniform PDF.
        xy[0] = 2.0 * Math.random() - 1.0; // choose an equally-likely 2D point
        xy[1] = 2.0 * Math.random() - 1.0; // within the +/-1, +/-1 square.
    } while (xy[0] * xy[0] + xy[1] * xy[1] >= 1.0); // keep 1st point inside circle
    return xy;
}
