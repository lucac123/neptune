#version 330 core
layout (location = 3) out float out_concentration;

in vec2 tex_coord;

uniform sampler2D u0;
uniform sampler2D u1;
uniform sampler2D s0;
uniform sampler2D s1;

uniform vec2 grid_num;
uniform float delta_time;

uniform bool is_splat;
uniform vec2 splat_pos;
uniform float r_splat_radius;
uniform float splat_amount;

void main() {
	vec2 coord = tex_coord * grid_num;
	float concentration = texture(s0, tex_coord).r;
	float splat = 0;

	if (is_splat) {
		float distance = length(coord-splat_pos);
		splat = 1/distance * 100;
		splat = splat_amount * (exp(-1 * pow(distance, 2)*r_splat_radius));
	}
	out_concentration = concentration + delta_time * splat;
}

//void main() {
//	vec2 coord = tex_coord * grid_num;
//	float force;
//	vec2 direction;
//	vec2 v = texture(u0, tex_coord).xy;
//	if (impulse) {
//		float distance = length(coord-impulse_pos);
//		force = impulse_magnitude * (exp(-1 * pow(distance, 2)*r_impulse_radius));
//		direction = normalize(coord-impulse_pos);
//	}
//
//	velocity = vec3(v + delta_time * force * direction, 0);
//}