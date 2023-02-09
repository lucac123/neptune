#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include "Shader.h"
#include "Texture.h"
#include "FrameBuffer.h"

void framebuffer_size_callback(GLFWwindow* window, int width, int height);
void processInput(GLFWwindow* window);

const unsigned int WINDOW_WIDTH = 1920;
const unsigned int WINDOW_HEIGHT = 1080;

// SIM CONSTANTS
const unsigned int CELL_SIZE = 1;
const unsigned int GRID_NUM[] = { 1920, 1080 };

// utility functions
void runShader();

int main() {
	/* GLFW WINDOW */
	glfwInit();
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
	glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

	GLFWwindow* window = glfwCreateWindow(WINDOW_WIDTH, WINDOW_HEIGHT, "Neptune", nullptr, nullptr);
	if (window == nullptr) {
		std::cout << "average rice window creator" << std::endl;
		glfwTerminate();
		return -1;
	}
	glfwMakeContextCurrent(window);
	glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);

	/* GLAD */
	if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
		std::cout << "didn't get glad got mad" << std::endl;
		return -1;
	}

	/* SHADER */
	Shader add_force("quad.vert", "add_force.frag");
	Shader advect("quad.vert", "advect.frag");
	Shader boundary("quad.vert", "boundary.frag");
	Shader divergence("quad.vert", "divergence.frag");
	Shader jacobi("quad.vert", "jacobi.frag");
	Shader subtract("quad.vert", "subtract.frag");
	Shader swap("quad.vert", "swap.frag");

	Shader render("quad.vert", "render.frag");

	/* SCREEN QUAD */
	float screen_quad[] = {
		// position		texture
		 1,	 1,			1,	1,
		 1,	-1,			1,	0,
		-1,	 1,			0,	1,
		-1,	-1,			0,	0,
		-1,	 1,			0,	1,
		 1,	-1,			1,	0,
	};

	unsigned int quad_vertex_buffer, quad_vertex_array;
	glGenVertexArrays(1, &quad_vertex_array);
	glGenBuffers(1, &quad_vertex_buffer);

	glBindVertexArray(quad_vertex_array);
	glBindBuffer(GL_ARRAY_BUFFER, quad_vertex_buffer);
	glBufferData(GL_ARRAY_BUFFER, sizeof(screen_quad), screen_quad, GL_STATIC_DRAW);

	// Define data in vertex buffer object
	glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*)0);
	glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*)(2*sizeof(float)));
	glEnableVertexAttribArray(0);
	glEnableVertexAttribArray(1);

	/* FRAMEBUFFER */
	FrameBuffer data_framebuffer(1);

	/* TEXTURE */
	Texture velocity0(GL_RG16F, GRID_NUM[0], GRID_NUM[1]);
	Texture velocity1(GL_RG16F, GRID_NUM[0], GRID_NUM[1]);
	Texture pressure0(GL_R16F, GRID_NUM[0], GRID_NUM[1]);
	Texture pressure1(GL_R16F, GRID_NUM[0], GRID_NUM[1]);
	Texture velocity_div(GL_R16F, GRID_NUM[0], GRID_NUM[1]);

	Texture substance0(GL_RGB16F, GRID_NUM[0], GRID_NUM[1]);
	Texture substance1(GL_RGB16F, GRID_NUM[0], GRID_NUM[1]);


	float last_frame = static_cast<float>(glfwGetTime());
	float delta_time = 0;

	while (!glfwWindowShouldClose(window)) {
	/** TIMESTEP **/
		float current_frame = static_cast<float>(glfwGetTime());
		delta_time = current_frame - last_frame;
		last_frame = current_frame;

		processInput(window);

		data_framebuffer.bind();

	/** VELOCITY **/
		/* Add Force
		*	shader: add_force
		*		in - v0
		*		out - v1
		*/


		/* Advect 
		*	shader: advect
		*		in - v1
		*		out - v0
		*/

		/* Diffuse
		*	loop:
		*		shader: jacobi
		*			in - v0
		*			out - v1
		*		shader: jacobi
		*			in - v1
		*			out - v0
		*/

		/* Project
		*	shader: divergence
		*		in - v1
		*		out - v_div
		* 
		*	loop:					// Pressure
		*		shader: jacobi
		*			in - p0
		*			out - p1
		*		shader: jacobi
		*			in - p1
		*			out - p0
		* 
		*	shader: subtract
		*		in - v1, p0
		*		out - v0
		*/

		/* Boundary
		*	shader: boundary		// Velocity
		*		in - v0
		*		out - v1
		*	shader: swap
		*		in - v1
		*		out - v0
		* 
		*	shader: boundary		// Pressure
		*		in - p0
		*		out - p1
		*	shader: swap
		*		in - p1
		*		in - p0
		*/

	/** DYE **/
		/* Add Source
		*	shader: add_force
		*		in - s0
		*		out - s1
		*/

		/* Advect
		*	shader: advect
		*		in - s1
		*		out - s0
		*/

		/* Diffuse
		*	loop:
		*		shader: jacobi
		*			in - s0
		*			out - s1
		*		shader: jacobi
		*			in - s1
		*			out - s0
		*/

	/** RENDER **/
		/* Render
		*	shader: render
		*		in - u0, s0
		*/

		data_framebuffer.unbind();
		render.use();
		runShader();

		glfwSwapBuffers(window);
		glfwPollEvents();
	}

	glDeleteBuffers(1, &quad_vertex_buffer);

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

void runShader() {
	glDrawArrays(GL_TRIANGLES, 0, 6);
}