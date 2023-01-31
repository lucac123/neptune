#version 330 core
layout (location = 4) out float pressure;

// IN div, u1
// OUT p

in vec2 tex_coord;

uniform sampler2D p;
uniform sampler2D div;

uniform vec2 grid_num;
uniform float alpha;
uniform float r_beta;

void main() {
	float p_left = texture(p, tex_coord - vec2(1,0)/grid_num).x;
	float p_right = texture(p, tex_coord + vec2(1,0)/grid_num).x;
	float p_bot = texture(p, tex_coord - vec2(0,1)/grid_num).x;
	float p_top = texture(p, tex_coord + vec2(0,1)/grid_num).x;

	float b = texture(div, tex_coord).x;

	pressure = (p_left + p_right + p_bot + p_top + alpha * b) * r_beta;
}
/*
	PRESSURE JACOBI SOLVER

	x_{i,j}'=( x_{i-1,j} + x_{i+1,j} + x_{i,j-1} + x_{i,j+1} + \alpha*b_{i,j} )/ \beta
		* one iteration of jacobi iteration
	x = p
	b = div
	alpha = -(grid_size)^2
	beta = 0.25
*/