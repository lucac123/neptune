#version 330 core
out vec3 out_value;

in vec2 texel;

uniform sampler2DRect in_value;

void main() {
	out_value = texture(in_value, texel).xyz;
}