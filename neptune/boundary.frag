#version 330 core
out vec2 result;

in vec2 texel;

uniform sampler2DRect field;

uniform int scale;

void main() {
	vec2 size = textureSize(field);
	vec2 offset = vec2(0,0);
	int scale_temp = scale;
	if (texel.x < 1)
		offset.x = 1;
	else if (texel.x > size.x-1)
		offset.x = -1;
	else if (texel.y < 1)
		offset.y = 1;
	else if (texel.y > size.y-1)
		offset.y = -1;
	else
		scale_temp = 1;

	result = scale_temp * texture(field, texel + offset).xy;
}