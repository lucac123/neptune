#version 330 core
layout (location = 0) out vec3 velocity;

in vec2 tex_coord;

uniform sampler2D u0;
uniform sampler2D u1;
uniform sampler2D s0;
uniform sampler2D s1;


uniform float delta_time;
uniform vec2 grid_num;

void main() {
	vec2 grid_coord = vec2(tex_coord * grid_num);  // grid space coordinates of current fragment
	vec2 last_pos = grid_coord - delta_time * texture(u1, tex_coord).xy;  // grid space coordinates of last position of current fragment
	vec2 new_tex_coord = last_pos/grid_num;  // texture space coordinates of last position of current fragment
	vec2 u = texture(u1, new_tex_coord).xy; // last velocity

	velocity = vec3(u, 0);
}