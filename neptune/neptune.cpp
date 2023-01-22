#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include "Shader.h"

void framebuffer_size_callback(GLFWwindow* window, int width, int height);
void processInput(GLFWwindow* window);

const unsigned int WIDTH = 1920;
const unsigned int HEIGHT = 1080;

const unsigned int GRID_HEIGHT = 1920;
const unsigned int GRID_WIDTH = 1080;

int main() {
	glfwInit();
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
	glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

	// Create window
	GLFWwindow* window = glfwCreateWindow(WIDTH, HEIGHT, "Neptune", nullptr, nullptr);
	if (window == nullptr) {
		std::cout << "average rice window creator" << std::endl;
		glfwTerminate();
		return -1;
	}
	glfwMakeContextCurrent(window);
	glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);

	// Initialize glad
	if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
		std::cout << "didn't get glad got mad" << std::endl;
		return -1;
	}

	Shader rtt_shader("square.vert", "rtt.frag");
	Shader sim_shader("square.vert", "sim.frag");

	sim_shader.use();
	glUniform1i(glGetUniformLocation(sim_shader.getID(), "rtt_texture"), 0);

	float vertices[] = {
		// position		texture
		 1,	 1,	 0,		1,	1,
		 1,	-1,	 0,		1,	0,
		-1,	-1,	 0,		0,	0,
		-1,	 1,	 0,		0,	1
	};
	unsigned int indices[] = {
		0, 1, 3,
		1, 2, 3 
	};

	/*
	* VERTEX ARRAY OBJECT: maintained by OpenGL internal state,
	*		contains vertex data stored in other buffers:
	*	VERTEX BUFFER OBJECT: vertex data
	*	ELEMENT BUFFER OBJECT: index data
	*/
	unsigned int VAO, VBO, EBO;
	glGenVertexArrays(1, &VAO);
	glGenBuffers(1, &VBO);
	glGenBuffers(1, &EBO);

	glBindVertexArray(VAO);

	glBindBuffer(GL_ARRAY_BUFFER, VBO);
	glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);

	// Define data in vertex buffer object
	glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)0);
	glEnableVertexAttribArray(0);

	// texture attribute
	glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)0);
	glEnableVertexAttribArray(1);


	/* RENDER TO TARGET */
	unsigned int rtt_buffer;
	glGenFramebuffers(1, &rtt_buffer);
	glBindFramebuffer(GL_FRAMEBUFFER, rtt_buffer);

	unsigned int rtt_texture;
	glGenTextures(1, &rtt_texture);
	
	glBindTexture(GL_TEXTURE_2D, rtt_texture);

	glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, GRID_WIDTH, GRID_HEIGHT, 0, GL_RGB, GL_UNSIGNED_BYTE, 0);

	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);

	glFramebufferTexture(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, rtt_texture, 0);

	unsigned int draw_buffers[1] = {GL_COLOR_ATTACHMENT0};
	glDrawBuffers(1, draw_buffers);

	if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE) {
		std::cout << "L framebuffer creator" << std::endl;
		return false;
	}

	glBindVertexArray(VAO);

	glClearColor(1,1,1,1);
	while (!glfwWindowShouldClose(window)) {
		processInput(window);

		
		glBindFramebuffer(GL_FRAMEBUFFER, rtt_buffer);
		glClear(GL_COLOR_BUFFER_BIT);
		//glViewport(0, 0, GRID_WIDTH, GRID_HEIGHT);

		rtt_shader.use();
		glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
		

		glBindFramebuffer(GL_FRAMEBUFFER, 0);
		glClear(GL_COLOR_BUFFER_BIT);
		sim_shader.use();
		glBindTexture(GL_TEXTURE_2D, rtt_texture);
		glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);


		glfwSwapBuffers(window);
		glfwPollEvents();
	}

	glDeleteVertexArrays(1, &VAO);
	glDeleteBuffers(1, &VBO);
	glDeleteBuffers(1, &EBO);

	glDeleteFramebuffers(1, &rtt_buffer);

	glfwTerminate();
	return 0;
}


void processInput(GLFWwindow* window) {
	if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
		glfwSetWindowShouldClose(window, true);
}

void framebuffer_size_callback(GLFWwindow* window, int width, int height) {
	glViewport(0, 0, width, height);
}