#version 330 core
out vec3 color;

in vec2 tex_coord;

uniform sampler2D u0;
uniform sampler2D u1;
uniform sampler2D s0;
uniform sampler2D s1;


uniform float delta_time;
uniform vec2 cursor_pos;

void main() {
	vec3 col = texture(u0, tex_coord).rgb;

	color = vec3(col.r, 1, 0);
}