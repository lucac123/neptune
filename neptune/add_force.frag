#version 330 core
layout (location = 0) out vec3 velocity;

in vec2 tex_coord;

uniform sampler2D u0;
uniform sampler2D u1;
uniform sampler2D s0;
uniform sampler2D s1;

uniform vec2 grid_num;
uniform float delta_time;

uniform bool impulse;
uniform vec2 impulse_pos;
uniform float r_impulse_radius;
uniform float impulse_magnitude;

void main() {
	vec2 coord = tex_coord * grid_num;
	vec2 force;
	vec2 v = texture(u0, tex_coord).xy;
	if (impulse) {
		float distance = length(coord-impulse_pos);
		force = normalize(coord-impulse_pos) * (impulse_magnitude + exp(pow(distance, 2)*r_impulse_radius));
	}

	velocity = vec3(v+delta_time*force, 0);
}