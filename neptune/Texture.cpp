#include "Texture.h"

Texture::Texture(int format, int width, int height) {
	glGenTextures(1, &this->ID);

	this->bind();
	glTexImage2D(GL_TEXTURE_RECTANGLE, 0, format, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, nullptr);
	glTexParameteri(GL_TEXTURE_RECTANGLE, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_RECTANGLE, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_RECTANGLE, GL_TEXTURE_WRAP_R, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_RECTANGLE, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
	this->unbind();
}

void Texture::bind(GLenum texture) {
	this->texture = texture;
	glActiveTexture(this->texture);
	glBindTexture(GL_TEXTURE_RECTANGLE, this->ID);
}

void Texture::unbind() {
	if (!this->texture) {
		glActiveTexture(this->texture);
		this->texture = 0;
		glBindTexture(GL_TEXTURE_RECTANGLE, 0);
	}
}

unsigned int Texture::getID() const{
	return this->ID;
}