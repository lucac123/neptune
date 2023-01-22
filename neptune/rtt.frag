#version 330 core
layout (location = 0) out vec3 color;

in vec2 tex_coord;

void main() {
	color = vec3(tex_coord*0.1+0.4,(tex_coord.x+tex_coord.y)*0.05+0.4);
}