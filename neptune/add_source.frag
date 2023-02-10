#version 330 core
out vec3 substance;

in vec2 texel;

uniform sampler2DRect in_substance;

uniform float time;

uniform bool is_splat;
uniform vec2 splat_pos;
uniform float r_splat_radius;
uniform float splat_multiplier;

void main() {
	substance = texture(in_substance, texel).xyz;

	if (is_splat) {
		float pi = 3.14159;
		float red = 0.5*sin(time)+0.6;
		float green = 0.5*sin(time+(2*pi/3))+0.6;
		float blue = 0.5*sin(time+(4*pi/3))+0.6;
		vec3 amount = splat_multiplier * vec3(red,green,blue);
		float splat = exp(-1*pow(length(texel-splat_pos),2)*r_splat_radius);
		substance += amount * splat;
	}
}