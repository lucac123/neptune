#version 330 core
layout (location = 1) out vec3 velocity;

in vec2 tex_coord;

uniform sampler2D u0;
uniform sampler2D u1;
uniform sampler2D s0;
uniform sampler2D s1;

uniform vec2 grid_num;
uniform float delta_time;

uniform bool is_impulse;
uniform vec2 impulse_pos;
uniform float r_impulse_radius;
uniform float impulse_magnitude;

void main() {
	vec2 coord = tex_coord * grid_num;
	float force;
	vec2 direction;
	vec2 v = texture(u0, tex_coord).xy;
	if (is_impulse) {
		float distance = length(coord-impulse_pos);
		force = impulse_magnitude * (exp(-1 * pow(distance, 2)*r_impulse_radius));
		direction = normalize(coord-impulse_pos);
	}

	velocity = vec3(v + delta_time * force * direction, 0);
}