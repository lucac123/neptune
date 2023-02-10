#version 330 core
out vec2 result;

in vec2 texel;

uniform sampler2DRect input_x;
uniform sampler2DRect input_b;

uniform float delta_time;
uniform float alpha;
uniform float r_beta;

void main() {
	vec2 left = texture(input_x, texel + vec2(-1,0)).xy;
	vec2 right = texture(input_x, texel + vec2(1,0)).xy;
	vec2 bottom = texture(input_x, texel + vec2(0,-1)).xy;
	vec2 top = texture(input_x, texel + vec2(0,1)).xy;

	vec2 b = texture(input_b, texel).xy;

	result = (left + right + bottom + top + alpha*b) * r_beta;
}

/*
	x_{i,j}'=( x_{i-1,j} + x_{i+1,j} + x_{i,j-1} + x_{i,j+1} + alpha*b_{i,j} )/ beta
					* one iteration of jacobi iteration *

	DIFFUSION JACOBI SOLVER
	x = velocity
	b = velocity
	alpha = (grid_size)^2/(viscosity*delta_time)
	beta = 4 + alpha

	PRESSURE JACOBI SOLVER
	x = pressure
	b = div(velocity)
	alpha = -(grid_size)^2
	beta = 4
*/