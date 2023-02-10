#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include "Shader.h"
#include "Texture.h"
#include "FrameBuffer.h"

void framebuffer_size_callback(GLFWwindow* window, int width, int height);
void mouse_button_callback(GLFWwindow* window, int button, int action, int mods);
void processInput(GLFWwindow* window);

const unsigned int WINDOW_WIDTH = 1920;
const unsigned int WINDOW_HEIGHT = 1080;

// SIM CONSTANTS
const unsigned int CELL_SIZE = 1;
const unsigned int GRID_NUM[] = { 1920, 1080 };

const float force_magnitude = 10;
const float r_force_radius = 1 / 10;

bool is_click = false;
float mouse_x = 0;
float mouse_y = 0;

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
	glfwSetMouseButtonCallback(window, mouse_button_callback);

	GLFWcursor* cursor = glfwCreateStandardCursor(GLFW_CROSSHAIR_CURSOR);
	glfwSetCursor(window, cursor);

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
		 1,	 1,			GRID_NUM[0],	GRID_NUM[1],
		 1,	-1,			GRID_NUM[0],	0,
		-1,	 1,			0,				GRID_NUM[1],
		-1,	-1,			0,				0,
		-1,	 1,			0,				GRID_NUM[1],
		 1,	-1,			GRID_NUM[0],	0,
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
		*		in - velocity0
		*		out - velocity1
		*		parameters: 
		*			delta_time - timestep
		*			is_impulse - true when click
		*			impulse_magnitude - magnitude of impulse
		*			impulse_pos - position of click
		*			r_impulse_radius - 1/(impulse radius)
		*/
		data_framebuffer.bindTexture(velocity1.getID());
		velocity0.bind();
		add_force.use();
		add_force.setUniform("in_velocity", 0);
		add_force.setUniform("delta_time", delta_time);
		add_force.setUniform("is_impulse", is_click);
		add_force.setUniform("impulse_magnitude", force_magnitude);
		add_force.setUniform("impulse_pos", mouse_x, mouse_y);
		add_force.setUniform("r_impulse_radius", r_force_radius);

		runShader();

		/* Advect 
		*	shader: advect
		*		in - velocity1
		*		out - velocity0
		*/

		/* Diffuse
		*	loop:
		*		shader: jacobi
		*			in - velocity0
		*			out - velocity1
		*		shader: jacobi
		*			in - velocity1
		*			out - velocity0
		*/

		/* Project
		*	shader: divergence
		*		in - velocity1
		*		out - velocity_div
		* 
		*	loop:					// Pressure
		*		shader: jacobi
		*			in - pressure0
		*			out - pressure1
		*		shader: jacobi
		*			in - pressure1
		*			out - pressure0
		* 
		*	shader: subtract
		*		in - velocity1, pressure0
		*		out - velocity0
		*/

		/* Boundary
		*	shader: boundary		// Velocity
		*		in - velocity0
		*		out - velocity1
		*	shader: swap
		*		in - velocity1
		*		out - velocity0		*/
		data_framebuffer.bindTexture(velocity0.getID());
		velocity1.bind();
		swap.use();
		runShader();

		/*	shader: boundary		// Pressure
		*		in - pressure0
		*		out - pressure1
		*	shader: swap
		*		in - pressure1
		*		in - pressure0
		*/

	/** DYE **/
		/* Add Source
		*	shader: add_force
		*		in - substance0
		*		out - substance1
		*/

		/* Advect
		*	shader: advect
		*		in - substance1
		*		out - substance0
		*/

		/* Diffuse
		*	loop:
		*		shader: jacobi
		*			in - substance0
		*			out - substance1
		*		shader: jacobi
		*			in - substance1
		*			out - substance0
		*/

	/** RENDER **/
		/* Render
		*	shader: render
		*		in - velocity0, substance0
		*/
		data_framebuffer.unbind(); // back to default frame buffer
		velocity0.bind(GL_TEXTURE0); // bind velocity 0 texture to TEXTURE0
		
		render.use();
		render.setUniform("velocity", 0); // set texture
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

void mouse_button_callback(GLFWwindow* window, int button, int action, int mods) {
	if (button == GLFW_MOUSE_BUTTON_LEFT) {
		if (action == GLFW_PRESS) {
			is_click = true;
			double x, y;
			glfwGetCursorPos(window, &x, &y);
			mouse_x = (x / WINDOW_WIDTH) * GRID_NUM[0];
			mouse_y = (1 - y/WINDOW_HEIGHT) * GRID_NUM[1];
		}
		else if (action == GLFW_RELEASE)
			is_click = false;
	}
}

void runShader() {
	glDrawArrays(GL_TRIANGLES, 0, 6);
}