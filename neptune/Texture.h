#pragma once
#include <glad/glad.h>

class Texture
{
private:
	unsigned int ID;
	GLenum texture;

public:
	Texture(int format, int width, int height);

	void bind(GLenum texture = GL_TEXTURE0);
	void unbind();

	unsigned int getID() const; //Returns ID corresponding with this texture
};

