#version 330 core
layout (location = 0) out vec3 u0color;

in vec2 tex_coord;

uniform sampler2D u0;
uniform sampler2D u1;
uniform sampler2D s0;
uniform sampler2D s1;

void main() {
	u0color = vec3(0.25, 0.25, 0.25);
}