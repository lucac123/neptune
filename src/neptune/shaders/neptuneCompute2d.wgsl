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


@group(0) @binding(0) var<storage, read> substanceFieldIn: Field2D;
@group(0) @binding(1) var<storage, read_write> substanceFieldOut: Field2D;

@group(1) @binding(0) var<storage, read> velocityFieldIn: Field2D;
@group(1) @binding(1) var<storage, read_write> velocityFieldOut: Field2D;

@compute
@workgroup_size(16, 16)
fn computeMain(
    @builtin(global_invocation_id) global_invocation_id: vec3<u32>,
) {

    let coord = global_invocation_id.xy;

    let normalizedLocalCoord = vec2f(coord) / vec2f(substanceFieldIn.resolution);
    let worldCoord = normalizedLocalCoord * substanceFieldIn.size + substanceFieldIn.start;

    if (coord.x < substanceFieldIn.resolution.x && coord.y < substanceFieldIn.resolution.y) {
        var index = coordToIndex(coord);
        if ((worldCoord.x*worldCoord.x + worldCoord.y*worldCoord.y) < 1) {
            substanceFieldOut.data[index] = vec3f(1);
        }
        else {
            var newVal: vec3f = vec3f(0);
            for (var i = -1; i < 2; i++) {
                for (var j = -1; j < 2; j++) {
                    if (i != 0 || j != 0) {
                        newVal += substanceFieldIn.data[coordToIndex(vec2u(coord.x+u32(i), coord.y+u32(j)))];
                    }
                }
            }
            substanceFieldOut.data[index] = newVal/f32(8);
        }
        // substanceFieldOut.data[index] = vec3f(1);
    }
}

fn coordToIndex(coord: vec2u) -> u32 {
    return coord.x * substanceFieldIn.resolution.y + coord.y;
}