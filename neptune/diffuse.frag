#version 330 core
layout (location = 1) out vec3 velocity;

// IN u0
// OUT u1

in vec2 tex_coord;

uniform sampler2D u0;
uniform sampler2D u1;
uniform sampler2D s0;
uniform sampler2D s1;

uniform vec2 grid_num;
uniform float alpha;
uniform float r_beta;
uniform float delta_time;

void main() {
	vec2 u_left = texture(u0, tex_coord - vec2(1,0)/grid_num).xy;
	vec2 u_right = texture(u0, tex_coord + vec2(1,0)/grid_num).xy;
	vec2 u_bot = texture(u0, tex_coord - vec2(0,1)/grid_num).xy;
	vec2 u_top = texture(u0, tex_coord + vec2(0,1)/grid_num).xy;

	vec2 u_cent = texture(u0, tex_coord).xy;

	velocity = vec3((u_left + u_right + u_bot + u_top + alpha * u_cent) * r_beta, 0);
}

/*
	DIFFUSION JACOBI SOLVER

	x_{i,j}'=( x_{i-1,j} + x_{i+1,j} + x_{i,j-1} + x_{i,j+1} + \alpha*b_{i,j} )/ \beta
		* one iteration of jacobi iteration
	x = u
	b = u
	alpha = (grid_size)^2/(viscosity*delta_time)
	beta = 4 + alpha
*/