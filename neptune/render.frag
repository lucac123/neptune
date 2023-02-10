#version 330 core
out vec4 color;

in vec2 texel;

uniform sampler2DRect velocity;
uniform sampler2DRect substance;

void main() {
	color = texture(substance, texel);

}