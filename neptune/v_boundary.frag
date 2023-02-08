#version 330 core
layout (location = 1) out vec2 velocity;

// IN u0
// OUT u1

in vec2 tex_coord;

uniform sampler2D u0;

uniform vec2 grid_num;

void main() {
	vec2 coord = tex_coord * grid_num;
	// BOUNDARY CONDITIONS
	vec2 offset;
	if (coord.x == 0) {
		offset = vec2(1, 0);
	}
	else if (coord.x == grid_num.x-1) {
		offset = vec2(-1, 0);
	}
	else if (coord.y == 0) {
		offset = vec2(0, 1);
	}
	else if (coord.y == grid_num.y-1) {
		offset = vec2(0, -1);
	}
	velocity = texture(u0, (coord+offset)/grid_num).xy;
}