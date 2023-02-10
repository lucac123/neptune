#version 330 core
out vec2 result;

in vec2 texel;

uniform sampler2DRect field;

uniform int scale;

void main() {
	vec2 size = textureSize(field);
	vec2 offset = vec2(0,0);
	if (texel.x == 0)
		offset.x = 1;
	else if (texel.x == size.x-1)
		offset.x = -1;
	else if (texel.y == 0)
		offset.y = 1;
	else if (texel.y == size.y-1)
		offset.y = -1;

	result = texture(field, texel + scale * offset).xy;
}