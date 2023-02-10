#pragma once
#include <glad/glad.h>
class FrameBuffer
{
private:
	unsigned int ID;
	unsigned int* draw_buffers;

public:
	FrameBuffer(unsigned int num_attachments);
	~FrameBuffer();

	void bind() const;
	void unbind() const;

	void bindTexture(unsigned int tex_id, unsigned int attachment = 0) const;
	void unbindTexture(unsigned int attachment = 0) const;

	unsigned int getID() const;
};

