#version 330 core
out vec3 result;

in vec2 texel;

uniform sampler2DRect input_x;
uniform sampler2DRect input_b;

uniform float alpha;
uniform float r_beta;

void main() {
	vec3 left = texture(input_x, texel + vec2(-1,0)).xyz;
	vec3 right = texture(input_x, texel + vec2(1,0)).xyz;
	vec3 bottom = texture(input_x, texel + vec2(0,-1)).xyz;
	vec3 top = texture(input_x, texel + vec2(0,1)).xyz;

	vec3 b = texture(input_b, texel).xyz;

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