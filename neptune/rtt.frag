#version 330 core
out vec4 FragColor;


in vec2 tex_coord;

uniform sampler2D sim_texture;

void main() {
	FragColor = texture(sim_texture, tex_coord);
	FragColor = vec4(tex_coord*0.1+0.4,(tex_coord.x+tex_coord.y)*0.05+0.4,0.5);
}