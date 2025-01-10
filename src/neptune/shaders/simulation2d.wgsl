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

struct SimulationEnvironment {
    viscosity: f32,
};

struct UniversalParameters {
    deltaTime: f32,
}

@group(0) @binding(0) var<storage, read> fieldIn: Field2D;
@group(0) @binding(1) var<storage, read_write> fieldOut: Field2D;

@group(1) @binding(0) var<uniform> universalParams: UniversalParameters;

@compute
@workgroup_size(16, 16)
fn advect(
    @builtin(global_invocation_id) global_invocation_id: vec3<u32>,
) {
    let coord = global_invocation_id.xy;

    // Ensure active thread
    if (coord.x < fieldIn.resolution.x && coord.y < fieldIn.resolution.y) {
        let curIndex = localCoordToIndex(coord, fieldIn.resolution);
        let curWorldPos = localToWorldCoord(
            coord, 
            fieldIn.resolution, 
            fieldIn.start, 
            fieldIn.size
        );

        let oldWorldPos = curWorldPos - fieldIn.data[curIndex].xy * universalParams.deltaTime;
        let oldIndex = worldCoordToIndex(
            oldWorldPos, 
            fieldIn.resolution,
            fieldIn.start,
            fieldIn.size,
        );

        fieldOut.data[curIndex] = sampleField(oldWorldPos);
        // fieldOut.data[curIndex] = fieldIn.data[oldIndex];
    }
}

/**
 * Linear interpolate from old field position
 */
fn sampleField(worldCoord: vec2f) -> vec3f {
    let normalizedCoord = worldCoordToNormalized(worldCoord, fieldIn.start, fieldIn.size);
    
    let floatLocalCoord = worldCoordToLocalFloat(
        worldCoord, 
        fieldIn.resolution,
        fieldIn.start,
        fieldIn.size,
    );

    let coord00 = vec2u(floatLocalCoord);
    let coord10 = vec2u(coord00.x+1, coord00.y);
    let coord01 = vec2u(coord00.x, coord00.y+1);
    let coord11 = vec2u(coord00.x+1, coord00.y+1);

    let index00 = localCoordToIndex(coord00, fieldIn.resolution);
    let index10 = localCoordToIndex(coord10, fieldIn.resolution);
    let index01 = localCoordToIndex(coord01, fieldIn.resolution);
    let index11 = localCoordToIndex(coord11, fieldIn.resolution);

    let val00 = fieldIn.data[index00];
    let val10 = fieldIn.data[index10];
    let val01 = fieldIn.data[index01];
    let val11 = fieldIn.data[index11];

    let distance00 = length(vec2f(coord00) - floatLocalCoord);
    let distance10 = length(vec2f(coord10) - floatLocalCoord);
    let distance01 = length(vec2f(coord01) - floatLocalCoord);
    let distance11 = length(vec2f(coord11) - floatLocalCoord);

    let totalDistance = distance00 + distance10 + distance01 + distance11;

    let weight00 = distance00 / totalDistance;
    let weight10 = distance10 / totalDistance;
    let weight01 = distance01 / totalDistance;
    let weight11 = distance11 / totalDistance;

    return weight00 * val00
        + weight10 * val10
        + weight01 * val01
        + weight11 * val11;
}

@compute
@workgroup_size(16, 16)
fn diffuse() {

}

@compute
@workgroup_size(16, 16)
fn computePressure() {

}

@compute
@workgroup_size(16, 16)
fn subtractPressureGradient() {

}

/**
 * Perform single step of jacobi iteration
 */
fn jacobi (
    left: vec3f, 
    right: vec3f, 
    top: vec3f, 
    bottom: vec3f, 
    b: vec3f, 
    alpha: f32,
    beta: f32,
) -> vec3f {
    return (left + right + bottom + top + alpha * b) / beta;
}

/**
 * Get index into field from coord and resolution
 */
fn localCoordToIndex(coord: vec2u, resolution: vec2u) -> u32 {
    return coord.x * resolution.y + coord.y;
}

fn localToNormalizedCoord(coord: vec2u, resolution: vec2u) -> vec2f {
    return vec2f(coord) / vec2f(resolution);
}

fn normalizedToLocalCoord(normalizedCoord: vec2f, resolution: vec2u) -> vec2u {
    return vec2u(normalizedCoord * vec2f(resolution));
}

fn normalizedToLocalCoordFloat(normalizedCoord: vec2f, resolution: vec2u) -> vec2f {
    return normalizedCoord * vec2f(resolution);
}

fn normalizedToWorldCoord(normalizedCoord: vec2f, start: vec2f, size: vec2f) -> vec2f {
    return normalizedCoord * size + start;
}

fn worldCoordToNormalized(worldCoord: vec2f, start: vec2f, size: vec2f) -> vec2f {
    return (worldCoord - start) /size;
}

fn localToWorldCoord(coord: vec2u, resolution: vec2u, start: vec2f, size: vec2f) -> vec2f {
    return normalizedToWorldCoord(
        localToNormalizedCoord(coord, resolution),
        start,
        size,
    );
}

fn worldCoordToLocal(coord: vec2f, resolution: vec2u, start: vec2f, size: vec2f) -> vec2u {
    return normalizedToLocalCoord(
        worldCoordToNormalized(coord, start, size),
        resolution,
    );
}

fn worldCoordToLocalFloat(coord: vec2f, resolution: vec2u, start: vec2f, size: vec2f) -> vec2f {
    return normalizedToLocalCoordFloat(
        worldCoordToNormalized(coord, start, size),
        resolution,
    );
}

fn worldCoordToIndex(coord: vec2f, resolution: vec2u, start: vec2f, size: vec2f) -> u32 {
    return localCoordToIndex(
        worldCoordToLocal(coord, resolution, start, size),
        resolution,
    );
}
