#version 330 core
layout (location = 0) out vec2 velocity;

// IN u1, p
// OUT u0

in vec2 tex_coord;

uniform sampler2D u1;
uniform sampler2D p;

uniform vec2 grid_num;
uniform float r_grid_size;

void main() {
	float p_left = texture(p, tex_coord - vec2(1,0)/grid_num).x;
	float p_right = texture(p, tex_coord + vec2(1,0)/grid_num).x;
	float p_bot = texture(p, tex_coord - vec2(0,1)/grid_num).x;
	float p_top = texture(p, tex_coord + vec2(0,1)/grid_num).x;

	vec2 u = texture(u1, tex_coord).xy;

	velocity = u - 0.5 * r_grid_size * vec2(p_right - p_left, p_top - p_bot);
}
