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

struct Input {
    amount: vec3f,
    position: vec2f, // World coordinates
    radius: f32, // World coordinates
}


@group(0) @binding(0) var<storage, read> fieldIn: Field2D;
@group(0) @binding(1) var<storage, read_write> fieldOut: Field2D;

@group(1) @binding(0) var<uniform> input: Input;

@compute
@workgroup_size(16, 16)
fn addToField2d(
    @builtin(global_invocation_id) global_invocation_id: vec3<u32>,
) {

    let coord = global_invocation_id.xy;

    let normalizedLocalCoord = vec2f(coord) / vec2f(fieldIn.resolution);
    let worldCoord = normalizedLocalCoord * fieldIn.size + fieldIn.start;

    // Ensure active thread
    if (coord.x < fieldIn.resolution.x && coord.y < fieldIn.resolution.y) {
        var index = coordToIndex(coord);

        var amt: vec3f = fieldIn.data[index];
        var gaussian: f32 = exp(
            -1 
            * pow(
                    length(worldCoord - input.position),
                    2,
                )
            * (1 / input.radius) 
        );
        amt += gaussian * input.amount;
        
        fieldOut.data[index] = amt;
    }
}

fn coordToIndex(coord: vec2u) -> u32 {
    return coord.x * fieldIn.resolution.y + coord.y;
}