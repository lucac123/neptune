#version 330 core
out vec2 velocity;

in vec2 texel;

uniform sampler2DRect in_velocity;
uniform sampler2DRect in_pressure;

uniform float r_cell_size;

void main() {
	float right = texture(in_pressure, texel + vec2(1,0)).x;
	float left = texture(in_pressure, texel - vec2(1,0)).x;
	float top = texture(in_pressure, texel + vec2(0,1)).x;
	float bottom = texture(in_pressure, texel - vec2(0,1)).x;

	velocity = texture(in_velocity, texel).xy - 0.5 * r_cell_size * vec2(right-left, top-bottom);
}