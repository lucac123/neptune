#version 330 core
out vec2 velocity;

in vec2 texel;

uniform sampler2DRect in_velocity;

uniform float delta_time;

void main() {
	vec2 last_coord = texel - texture(in_velocity, texel).xy * delta_time;
	velocity = texture(in_velocity, last_coord).xy;
}