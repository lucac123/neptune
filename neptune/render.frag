#version 330 core
out vec4 color;

in vec2 tex_coord;

uniform sampler2D u0;
uniform sampler2D u1;
uniform sampler2D s0;
uniform sampler2D s1;

void main() {
	vec3 velocity = texture(u0, tex_coord).xyz;
	float concentration = texture(s1, tex_coord).r;
	vec3 s_vec = vec3(concentration, concentration, concentration);

	vec3 v_check = vec3(0,0,0);

	if (velocity.x > 0)
		v_check += vec3(1,0,0);
	if (velocity.y > 0)
		v_check += vec3(0,1,0);
	if (velocity.x < 0)
		v_check += vec3(0,0,0.5);
	if (velocity.y < 0)
		v_check += vec3(0, 0, 0.5);

	color = vec4(velocity, 1);
}