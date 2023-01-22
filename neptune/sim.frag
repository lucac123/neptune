#version 330 core
out vec4 color;

in vec2 tex_coord;

uniform sampler2D rtt_texture;
uniform float delta_time;

void main() {
	vec4 col = texture(rtt_texture, tex_coord);
	color = col;
}