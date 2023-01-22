#version 330 core
out vec4 color;

in vec2 tex_coord;

uniform sampler2D rtt_texture;
uniform float delta_time;

void main() {
	vec4 col = texture(rtt_texture, vec2(tex_coord.x-delta_time*10, tex_coord.y+delta_time*10));

	color = vec4(sin(delta_time), 0, 0, 0);
}