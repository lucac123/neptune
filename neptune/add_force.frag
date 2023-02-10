#version 330 core
out vec2 velocity;

in vec2 texel;

uniform sampler2DRect in_velocity;

uniform float delta_time;

uniform bool is_impulse;
uniform float impulse_magnitude;
uniform vec2 impulse_pos;
uniform float r_impulse_radius;

void main() {
	velocity = texture(in_velocity, texel).xy;

	if (is_impulse) {
		float distance = length(texel-impulse_pos);
		float force = impulse_magnitude * (exp(-1 * pow(distance, 2)*r_impulse_radius));;
		vec2 direction = normalize(texel-impulse_pos);
		velocity += delta_time * force * direction;
	}
}