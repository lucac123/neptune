#pragma once
#include<glad/glad.h>

#include<string>
#include<fstream>
#include<sstream>
#include<iostream>

class Shader {
private:
	unsigned int ID;	//Unique ID used by OpenGL context

	std::string frag_file;

public:
	Shader(const char* vert_path, const char* frag_path); //Constructor, generates shader using vertex and fragment shader source files.

	void use() const;

	unsigned int getID() const;

private:
	void checkCompileErrors(unsigned int shader, std::string type);
};

