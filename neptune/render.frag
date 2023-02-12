#version 330 core
out vec4 color;

in vec2 texel;

uniform sampler2DRect velocity;
uniform sampler2DRect substance;

uniform uvec2 size;

float sigmoid(float val,float scale);

void main() {
	//UPDATED texel
	vec2 new_texel = texel;
	ivec2 texSize = textureSize(substance);
	new_texel = texel / size * texSize;

	// VELOCITY
	/*
	color = texture(velocity, new_texel);
	color.r = sigmoid(color.r,0.03);
	color.b = sigmoid(color.g,0.03);
	color.g = 0;
	//*/

	// substance
	color = texture(substance, new_texel);
}

float sigmoid(float val, float scale) {
	return 1/(1+exp(-1*scale*val));
}