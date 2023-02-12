#include "Shader.h"

Shader::Shader(const char* vert_path, const char* frag_path) {
    frag_file = std::string(frag_path);
    std::string vert_str;
    std::string frag_str;
    std::ifstream vert_file;
    std::ifstream frag_file;

    // Load code from files
    vert_file.exceptions(std::ifstream::failbit | std::ifstream::badbit);
    frag_file.exceptions(std::ifstream::failbit | std::ifstream::badbit);
    try {
        vert_file.open(vert_path);
        frag_file.open(frag_path);

        std::stringstream vert_stream, frag_stream;

        vert_stream << vert_file.rdbuf();
        frag_stream << frag_file.rdbuf();

        vert_file.close();
        frag_file.close();

        vert_str = vert_stream.str();
        frag_str = frag_stream.str();
    }
    catch (std::ifstream::failure& e) {
        std::cout << "dumbass be better" << e.what() << std::endl;
    }
    const char* vert_code = vert_str.c_str();
    const char* frag_code = frag_str.c_str();

    // Compile shaders
    unsigned int vert, frag;

    /* VERT */
    vert = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vert, 1, &vert_code, nullptr);
    glCompileShader(vert);
    checkCompileErrors(vert, "VERTEX");

    /* FRAG */
    frag = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(frag, 1, &frag_code, nullptr);
    glCompileShader(frag);
    checkCompileErrors(frag, "FRAGMENT");

    /* COMPILATION */
    ID = glCreateProgram();
    glAttachShader(ID, vert);
    glAttachShader(ID, frag);
    glLinkProgram(ID);
    checkCompileErrors(ID, "PROGRAM");

    // Cleanup
    glDeleteShader(vert);
    glDeleteShader(frag);
}

void Shader::use() const {
    glUseProgram(this->ID);
}


void Shader::setUniform(const char* name, int value) const {
    glUniform1i(glGetUniformLocation(this->ID, name), value);
}
void Shader::setUniform(const char* name, float value) const {
    glUniform1f(glGetUniformLocation(this->ID, name), value);
}
void Shader::setUniform(const char* name, float v1, float v2) const {
    glUniform2f(glGetUniformLocation(this->ID, name), v1, v2);
}
void Shader::setUniform(const char* name, unsigned int v1, unsigned int v2) const {
    glUniform2ui(glGetUniformLocation(this->ID, name), v1, v2);
}

unsigned int Shader::getID() const {
    return this->ID;
}

void Shader::checkCompileErrors(unsigned int shader, std::string type) {
    int success;
    char log[1024];
    if (type != "PROGRAM") {
        glGetShaderiv(shader, GL_COMPILE_STATUS, &success);
        if (!success) {
            glGetShaderInfoLog(shader, 1024, nullptr, log);
            std::cout << "cant even compile " << this->frag_file << " smh" << type << "\n" << log << std::endl;
        }
    }
    else {
        glGetProgramiv(shader, GL_LINK_STATUS, &success);
        if (!success) {
            glGetProgramInfoLog(shader, 1024, nullptr, log);
            std::cout << "cant even link " << this->frag_file << " smh" << type << "\n" << log << std::endl;
        }
    }
}