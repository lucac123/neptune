#version 330 core
out vec4 color;

in vec2 texel;

uniform sampler2DRect velocity;
uniform sampler2DRect substance;

float sigmoid(float val,float scale);

void main() {
	// VELOCITY
	///*
	color = texture(velocity, texel);
	color.r = sigmoid(color.r,0.03);
	color.b = sigmoid(color.g,0.03);
	color.g = 0;
	//*/

	// substance
	//color = texture(substance, texel);
	//color = vec4(texel.x,texel.y,0,0);
}

float sigmoid(float val, float scale) {
	return 1/(1+exp(-1*scale*val));
}