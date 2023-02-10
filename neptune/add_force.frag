#version 330 core
out vec2 velocity;

in vec2 texel;

uniform sampler2DRect in_velocity;

uniform float delta_time;

uniform bool is_force;
uniform vec2 force;
uniform vec2 force_pos;
uniform float r_force_radius;

void main() {
	velocity = texture(in_velocity, texel).xy;

	if (is_force) {
		vec2 computed_force = force*delta_time;
		float splat = exp(-1*pow(length(texel-force_pos),2)*r_force_radius);
		velocity += computed_force * splat;
	}
}