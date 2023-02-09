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

	void use() const; //Sets OpenGL to use shader
	
	// SET UNIFORMS
	void setUniform(const char* name, int value) const; //Samplers and integers, and booleans
	void setUniform(const char* name, float value) const; //Floats
	void setUniform(const char* name, float v1, float v2) const; //Float vector

	unsigned int getID() const; //Returns the ID corresponding with this shader

private:
	void checkCompileErrors(unsigned int shader, std::string type);
};

