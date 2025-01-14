/**
 * Camera structure
 */
struct Camera {
    // Projection matrix: view space --> clip space
    projection: mat4x4f,
    // View matrix: world space --> view space
    view: mat4x4f,
};

/**
 * Model structure
 */
struct Model {
    // Model matrix: local spcae --> world space
    model: mat4x4f,
};

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


@group(0) @binding(0) var<uniform> model: Model;
@group(1) @binding(0) var<uniform> camera: Camera;

struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec2f,
}

@vertex
fn vertexMain(@location(0) pos: vec2f) -> VertexOut {
    var out = VertexOut();
    let worldPosition: vec4f = model.model * vec4f(pos, 0, 1);
    out.position = camera.projection * camera.view * worldPosition;
    out.worldPosition = worldPosition.xy;
    return out;
}

@group(2) @binding(0) var<storage, read> field: Field2D;
@fragment
fn fragmentMain(vertexOut: VertexOut) -> @location(0) vec4f {
    let fieldValue = getFieldValue(vertexOut.worldPosition);

    var color = vec3f(0);
    // render velocity
    // color.r = clamp(fieldValue.x, 0, 1);
    // color.g = clamp(fieldValue.y, 0, 1);
    // color.b = - (clamp(fieldValue.x, -1, 0) + clamp(fieldValue.y, -1, 0));
    // color *= 1;

    // render substance
    color = fieldValue;

    return vec4f(
        color, 
        1,
    );
}

fn getFieldValue(worldPosition: vec2f) -> vec3f {
    let normalizedFieldCoord = (worldPosition - field.start) / vec2f(field.size);
    let fieldCoord = vec2u(vec2f(field.resolution) * normalizedFieldCoord);

    if (normalizedFieldCoord.x < 0 || normalizedFieldCoord.y < 0 
    || normalizedFieldCoord.x >= 1 || normalizedFieldCoord.y >= 1) {
        return vec3f(0);
    }

    let index = fieldCoord.x * field.resolution.y + fieldCoord.y;
    
    return field.data[index];
}