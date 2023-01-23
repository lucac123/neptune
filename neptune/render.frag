#version 330 core
out vec4 color;

in vec2 tex_coord;

uniform sampler2D u0;
uniform sampler2D u1;
uniform sampler2D s0;
uniform sampler2D s1;

void main() {
	vec3 velocity = texture(u0, tex_coord).xyz;
	float concentration = texture(s0, tex_coord).r;
	vec3 s_vec = vec3(concentration, concentration, concentration);

	color = vec4(s_vec, 1);
}