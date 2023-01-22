#version 330 core
out vec4 color;

in vec2 tex_coord;

uniform sampler2D rtt_texture;

void main() {
	vec3 col = texture(rtt_texture, tex_coord).rgb;
	color = vec4(col, 1);
}