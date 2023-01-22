#version 330 core
out vec4 color;

in vec2 tex_coord;

uniform sampler2D rtt_texture;
uniform float delta_time;
uniform vec2 cursor_pos;

void main() {
	vec3 col = texture(rtt_texture, tex_coord).rgb;

	float distance = 0;
	if (cursor_pos != vec2(0,0))
		distance = sqrt(pow(tex_coord.x-cursor_pos.x,2)+pow(tex_coord.y-cursor_pos.y,2));

	col = vec3(col.r-0.5*distance, col.g-0.5*distance, col.b-0.5*distance);

	color = vec4(col, 1);
}