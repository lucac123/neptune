#version 330 core
layout (location = 2) out float out_concentration;

in vec2 tex_coord;

uniform sampler2D u0;
uniform sampler2D u1;
uniform sampler2D s0;
uniform sampler2D s1;

uniform vec2 grid_num;
uniform float delta_time;

uniform bool splat;
uniform vec2 splat_pos;
uniform int splat_radius;
uniform float splat_amount;

void main() {
	vec2 coord = tex_coord * grid_num;
	float concentration = texture(s0, tex_coord).r;
	if (splat) {
		if (length(coord-splat_pos)<splat_radius) {
			concentration += splat_amount;
		}
	}
	out_concentration = concentration;
}