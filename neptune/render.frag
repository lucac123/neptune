#version 330 core
out vec4 color;

in vec2 texel;

uniform sampler2DRect velocity;

void main() {
	color = texture(velocity, texel);

}