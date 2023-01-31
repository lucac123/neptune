#version 330 core
layout (location = 5) out float div;

// IN u1
// OUT div

in vec2 tex_coord;

uniform sampler2D u0;
uniform sampler2D u1;
uniform sampler2D s0;
uniform sampler2D s1;

uniform vec2 grid_num;
uniform float r_grid_size;

void main() {
	vec2 u_left = texture(u1, tex_coord - vec2(1,0)/grid_num).xy;
	vec2 u_right = texture(u1, tex_coord + vec2(1,0)/grid_num).xy;
	vec2 u_bot = texture(u1, tex_coord - vec2(0,1)/grid_num).xy;
	vec2 u_top = texture(u1, tex_coord + vec2(0,1)/grid_num).xy;

	div = 0.5 * r_grid_size * ((u_right.x-u_left.x) + (u_top.y-u_bot.y));
}