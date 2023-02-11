#version 330 core
out vec4 color;

in vec2 texel;

uniform sampler2DRect velocity;
uniform sampler2DRect substance;

void main() {
	// VELOCITY
	/*
	color = 0.75 * normalize(texture(velocity, texel));
	color.b = color.g;
	color.g = 0.3*color.b;
	//*/

	// substance
	color = texture(substance, texel);
}