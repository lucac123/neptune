#version 330 core
layout (location = 0) in vec2 in_pos;
layout (location = 1) in vec2 in_texel;

out vec2 texel;

uniform uvec2 size;

void main() {
	gl_Position = vec4(in_pos, 0, 1);
	texel = in_texel*size;
}