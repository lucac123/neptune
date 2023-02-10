#version 330 core
out vec3 quantity;

in vec2 texel;

uniform sampler2DRect in_quantity;
uniform sampler2DRect velocity;

uniform float delta_time;

void main() {
	vec2 last_coord = texel - texture(velocity, texel).xy * delta_time;
	quantity = texture(in_quantity, last_coord).xyz;
}