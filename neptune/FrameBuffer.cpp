#include "FrameBuffer.h"
#include <iostream>

FrameBuffer::FrameBuffer(unsigned int num_attachments) {
	glGenFramebuffers(1, &this->ID);
	this->bind();
	
	this->draw_buffers = new unsigned int[num_attachments];
	for (int i = 0; i < num_attachments; i++)
		this->draw_buffers[i] = GL_COLOR_ATTACHMENT0 + i;
	glDrawBuffers(num_attachments, this->draw_buffers);


	this->unbind();
}

FrameBuffer::~FrameBuffer() {
	delete[] this->draw_buffers;
	glDeleteFramebuffers(1, &this->ID);
}

void FrameBuffer::bind() const {
	glBindFramebuffer(GL_FRAMEBUFFER, this->ID);
}

void FrameBuffer::unbind() const {
	glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

void FrameBuffer::bindTexture(unsigned int tex_id, unsigned int attachment) const {
	glFramebufferTexture2D(GL_FRAMEBUFFER, draw_buffers[attachment], GL_TEXTURE_RECTANGLE, tex_id, 0);
}

void FrameBuffer::unbindTexture(unsigned int attachment) const {
	glFramebufferTexture2D(GL_FRAMEBUFFER, draw_buffers[attachment], GL_TEXTURE_RECTANGLE, 0, 0);
}

unsigned int FrameBuffer::getID() const {
	return this->ID;
}