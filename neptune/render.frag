#version 330 core
out vec4 color;

in vec2 tex_coord;

uniform sampler2D u;
uniform sampler2D s;

void main() {
	vec3 velocity = texture(u, tex_coord).xyz;
	float concentration = texture(s, tex_coord).r;

	color = vec4(concentration, concentration, concentration, 1);
}