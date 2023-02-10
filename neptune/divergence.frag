#version 330 core
out float div;

in vec2 texel;

uniform sampler2DRect v_field;

uniform float r_cell_size;

void main() {
	float right = texture(v_field, texel + vec2(1,0)).x;
	float left = texture(v_field, texel + vec2(-1, 0)).x;
	float top = texture(v_field, texel + vec2(0, 1)).y;
	float bottom = texture(v_field, texel + vec2(0, -1)).y;
	div = 0.5 * r_cell_size * ((right-left) + (top-bottom));
}