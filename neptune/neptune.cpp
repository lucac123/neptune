#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include "Shader.h"

void framebuffer_size_callback(GLFWwindow* window, int width, int height);
void processInput(GLFWwindow* window);

const unsigned int WIDTH = 1920;
const unsigned int HEIGHT = 1080;

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

	Shader sim_shader("square.vert", "rtt.frag");

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


	sim_shader.use();
	glBindVertexArray(VAO);

	while (!glfwWindowShouldClose(window)) {
		processInput(window);

		glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
		glClear(GL_COLOR_BUFFER_BIT);

		glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);

		glfwSwapBuffers(window);
		glfwPollEvents();
	}

	glDeleteVertexArrays(1, &VAO);
	glDeleteBuffers(1, &VBO);
	glDeleteBuffers(1, &EBO);

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