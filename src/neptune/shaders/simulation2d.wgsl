/**
 * Field structure
 */
struct Field2D {
    // defines the resolution of each dimension of the field
    resolution: vec2u,
    // defines the bottom left world position of field
    start: vec2f,
    // defines the size in world coords of the field
    size: vec2f,
    // contains the actual data, must be at least length size.x * size.y
    data: array<vec3f>,
};
struct Parameters {
    deltaTime: f32,
    cellSize: f32,
    diffuseAlpha: f32,
    diffuseBeta: f32,
    pressureAlpha: f32,
    pressureBeta: f32,
}


/**
 ** ASSUMES FIELDS A AND B HAVE IDENTICAL METADATA
 */

@group(0) @binding(0) var<uniform> params: Parameters;

@group(1) @binding(0) var<storage, read> fieldAIn: Field2D;
@group(1) @binding(1) var<storage, read_write> fieldAOut: Field2D;

@group(2) @binding(0) var<storage, read> fieldBIn: Field2D;


/**
 * Advect fieldAIn by fieldBIn, writing to fieldAOut
 */
@compute
@workgroup_size(16, 16)
fn advect(
    @builtin(global_invocation_id) global_invocation_id: vec3<u32>,
) {
    let coord = global_invocation_id.xy;

    // Ensure active thread
    if (isValidThread(coord)) {
        let curIndex = gridToIndex(coord);
        let curWorldPos = gridToWorldCoord(coord);

        let oldWorldPos = curWorldPos - fieldBIn.data[curIndex].xy * params.deltaTime;
        let oldIndex = worldToIndex(oldWorldPos);

        fieldAOut.data[curIndex] = sampleFieldA(curWorldPos);
    }
}

/**
 * Diffuse velocity via viscosity, write to field A
 * 
 * fieldA and fieldB should both be velocity
 * 
 * runs a single jacobi iteration step using params.diffuseAlpha and params.diffuseBeta as parameters
 */
@compute
@workgroup_size(16, 16)
fn diffuse(
    @builtin(global_invocation_id) global_invocation_id: vec3<u32>,
) {
    let coord = global_invocation_id.xy;

    // Ensure active thread
    if (isValidThread(coord)) {
        let curIndex = gridToIndex(coord);
        fieldAOut.data[curIndex] = jacobi(coord, params.diffuseAlpha, params.diffuseBeta);
    }
}

/**
 * Compute divergence of field B, output to field A
 */
@compute
@workgroup_size(16, 16)
fn divergence(
    @builtin(global_invocation_id) global_invocation_id: vec3<u32>,
) {
let coord = global_invocation_id.xy;

    // Ensure active thread
    if (isValidThread(coord)) {
        let right = fieldBIn.data[gridToIndex(vec2u(vec2i(coord) + vec2i(1, 0)))].x;
        let left = fieldBIn.data[gridToIndex(vec2u(vec2i(coord) + vec2i(-1, 0)))].x;
        let top = fieldBIn.data[gridToIndex(vec2u(vec2i(coord) + vec2i(0, 1)))].y;
        let bottom = fieldBIn.data[gridToIndex(vec2u(vec2i(coord) + vec2i(0, -1)))].y;

        fieldAOut.data[gridToIndex(coord)] = vec3f(0.5 * ( right - left + top - bottom ) / params.cellSize, 0, 0);
    }
}

/**
 * Compute pressure using jacobi iteration
 * 
 * fieldA should be pressure, fieldB should be divergence of velocity field
 */
@compute
@workgroup_size(16, 16)
fn computePressure(
    @builtin(global_invocation_id) global_invocation_id: vec3<u32>,
) {
let coord = global_invocation_id.xy;

    // Ensure active thread
    if (isValidThread(coord)) {
        let curIndex = gridToIndex(coord);
        fieldAOut.data[curIndex] = jacobi(coord, params.pressureAlpha, params.pressureBeta);
    }
}

/**
 * Subtract gradient of pressure (fieldB) from velocity (fieldA)
 * outputs to fieldA
 */
@compute
@workgroup_size(16, 16)
fn subtractPressureGradient(
    @builtin(global_invocation_id) global_invocation_id: vec3<u32>,
) {
let coord = global_invocation_id.xy;

    // Ensure active thread
    if (isValidThread(coord)) {
        let curIndex = gridToIndex(coord);
        
        let right = fieldBIn.data[gridToIndex(vec2u(vec2i(coord) + vec2i(1, 0)))].x;
        let left = fieldBIn.data[gridToIndex(vec2u(vec2i(coord) + vec2i(-1, 0)))].x;
        let top = fieldBIn.data[gridToIndex(vec2u(vec2i(coord) + vec2i(0, 1)))].x;
        let bottom = fieldBIn.data[gridToIndex(vec2u(vec2i(coord) + vec2i(0, -1)))].x;

        var pressureGradient = vec3f(right-left, top-bottom, 0);
        pressureGradient *= 0.5 / params.cellSize;

        fieldAOut.data[curIndex] = fieldAIn.data[curIndex] - pressureGradient;
    }
}

// **** UTILITY FUNCTIONS ****

/**
 * Perform single step of jacobi iteration
 *
 * treats fieldA as x field
 * treats fieldB as b field
 */
fn jacobi (
    gridCoord: vec2u,
    alpha: f32,
    beta: f32,
) -> vec3f {
    let offsets = array<vec2i, 4>(
        vec2i(-1, 0),
        vec2i(1, 0),
        vec2i(0, -1),
        vec2i(0, 1),
    );
    var neighborhood = mat4x3f();

    for (var i = 0; i < 4; i++) {
        let offset = offsets[i];
        let neighborGridCoord = vec2u(vec2i(gridCoord) + offset);
        neighborhood[i] = fieldAIn.data[gridToIndex(neighborGridCoord)];
    }

    let b = fieldBIn.data[gridToIndex(gridCoord)];
    let neighborhoodSum = neighborhood * vec4f(1);
    return (neighborhoodSum + alpha * b) / beta;
}

// **** SAMPLE INPUT FIELDS ****

/**
 * Sample field A input at world position, linearly interpolating between nearest grid cells
 */
fn sampleFieldA(worldCoord: vec2f) -> vec3f {
    let gridCoordF = worldToGridCoordF(worldCoord);

    if (gridCoordF.x < 0 || gridCoordF.y < 0
        || gridCoordF.x >= f32(fieldAIn.resolution.x) || gridCoordF.y >= f32(fieldAIn.resolution.y)) {
        return vec3f(0);
    }

    let frac = fract(gridCoordF);
    let gridCoord = vec2u(gridCoordF);


    var distances: vec4f = vec4f(0);
    var values: mat4x3f = mat4x3f();

    for (var i: u32 = 0; i < 2; i++) {
        for (var j: u32 = 0; j < 2; j++) {
            let index = 2 * i + j;

            let cmp = vec2f(vec2u(i, j));
            distances[index] = length(cmp - frac);

            let curGridCoord = vec2u(gridCoord.x + i, gridCoord.y + j);
            values[index] = fieldAIn.data[gridToIndex(curGridCoord)];
        }
    }

    return values * normalize(distances);
}

/**
 * Sample field B input at world position, linearly interpolating between nearest grid cells
 */
fn sampleFieldB(worldCoord: vec2f) -> vec3f {
    let gridCoordF = worldToGridCoordF(worldCoord);

    let frac = fract(gridCoordF);
    let gridCoord = vec2u(gridCoordF);

    var distances: vec4f = vec4f(0);
    var values: mat4x3f = mat4x3f();

    for (var i: u32 = 0; i < 2; i++) {
        for (var j: u32 = 0; j < 2; j++) {
            let index = 2 * i + j;

            let cmp = vec2f(vec2u(i, j));
            distances[index] = length(cmp - frac);

            let curGridCoord = vec2u(gridCoord.x + i, gridCoord.y + j);
            values[index] = fieldBIn.data[gridToIndex(curGridCoord)];
        }
    }

    return values * normalize(distances);
}

// **** CHECK THREAD VALIDITY ****
fn isValidThread(
    gridCoord: vec2u,
) -> bool {
    return !(gridCoord.x <= 0 || gridCoord.y <= 0
        || gridCoord.x >= (fieldAIn.resolution.x - 1) || gridCoord.y >= (fieldAIn.resolution.y-1));
}

// **** COORDINATE SYSTEM CONVERSION FUNCTIONS ****
/**
 * Convert grid coord to world coord 
 */
fn gridToWorldCoord(
    gridCoord: vec2u,
) -> vec2f {
    let localCoord = vec2f(gridCoord) / vec2f(fieldAIn.resolution);
    return localCoord * fieldAIn.size + fieldAIn.start;
}

/**
 * Convert world coord to grid coord float
 */
fn worldToGridCoordF(
    worldCoord: vec2f,
) -> vec2f {
    let localCoord = (worldCoord - fieldAIn.start) / fieldAIn.size;
    return localCoord * vec2f(fieldAIn.resolution);
}

/**
 * Convert world coord to grid coord unsigned int
 */
fn worldToGridCoord(
    worldCoord: vec2f,
) -> vec2u {
    return vec2u(worldToGridCoordF(worldCoord));
}

/**
 * Convert grid coord to index
 */
fn gridToIndex(
    gridCoord: vec2u,
) -> u32 {
    return gridCoord.x * fieldAIn.resolution.y + gridCoord.y;
}

/**
 * Convert world coord to index
 */
fn worldToIndex(
    worldCoord: vec2f,
) -> u32 {
    return gridToIndex(worldToGridCoord(worldCoord));
}