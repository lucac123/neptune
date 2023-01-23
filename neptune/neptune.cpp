#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include "Shader.h"


void framebuffer_size_callback(GLFWwindow* window, int width, int height);
void processInput(GLFWwindow* window);
void mouse_button_callback(GLFWwindow* window, int button, int action, int mods);

const unsigned int RENDER_FRAMEBUFFER = 0;

const unsigned int WIDTH = 1920;
const unsigned int HEIGHT = 1080;

const unsigned int GRID_WIDTH = 1920;
const unsigned int GRID_HEIGHT = 1080;

const unsigned int GRID_NUM_X = 1920;
const unsigned int GRID_NUM_Y = 1080;

bool mouse_press = false;

void configure_texture(); // utility function to avoid duplicated code. Do not call at the wrong time.

// FLUID PROPERTIES
const float diffusion_const = 1;
const float dissipation_rate = 1;
const float viscosity = 1;

// splat
const int splat_radius = 100;
const float splat_amount = 100;
const float impulse_magnitude = 100;


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
	glfwSetMouseButtonCallback(window, mouse_button_callback);

	GLFWcursor* cursor = glfwCreateStandardCursor(GLFW_CROSSHAIR_CURSOR);
	glfwSetCursor(window, cursor);

	// Initialize glad
	if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
		std::cout << "didn't get glad got mad" << std::endl;
		return -1;
	}

	Shader add_force("square.vert", "add_force.frag");
	Shader advect("square.vert", "advect.frag");
	Shader diffuse("square.vert", "diffuse.frag");
	Shader project("square.vert", "project.frag");

	Shader add_source("square.vert", "add_source.frag");
	Shader dissipate("square.vert", "dissipate.frag");

	Shader render("square.vert", "render.frag");

	
	add_force.use();
	glUniform1i(glGetUniformLocation(add_force.getID(), "u0"), 0);
	glUniform1i(glGetUniformLocation(add_force.getID(), "u1"), 1);
	glUniform1i(glGetUniformLocation(add_force.getID(), "s0"), 2);
	glUniform1i(glGetUniformLocation(add_force.getID(), "s1"), 3);

	advect.use();
	glUniform1i(glGetUniformLocation(advect.getID(), "u0"), 0);
	glUniform1i(glGetUniformLocation(advect.getID(), "u1"), 1);
	glUniform1i(glGetUniformLocation(advect.getID(), "s0"), 2);
	glUniform1i(glGetUniformLocation(advect.getID(), "s1"), 3);

	add_source.use();
	glUniform1i(glGetUniformLocation(add_source.getID(), "u0"), 0);
	glUniform1i(glGetUniformLocation(add_source.getID(), "u1"), 1);
	glUniform1i(glGetUniformLocation(add_source.getID(), "s0"), 2);
	glUniform1i(glGetUniformLocation(add_source.getID(), "s1"), 3);

	render.use();
	glUniform1i(glGetUniformLocation(render.getID(), "u0"), 0);
	glUniform1i(glGetUniformLocation(render.getID(), "u1"), 1);
	glUniform1i(glGetUniformLocation(render.getID(), "s0"), 2);
	glUniform1i(glGetUniformLocation(render.getID(), "s1"), 3);


	float vertices[] = {
		// position		texture
		 1,	 1,			1,	1,
		 1,	-1,			1,	0,
		-1,	-1,			0,	0,
		-1,	 1,			0,	1
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
	glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), &vertices, GL_STATIC_DRAW);

	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), &indices, GL_STATIC_DRAW);

	// Define data in vertex buffer object
	glEnableVertexAttribArray(0);
	glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*)0);

	// texture attribute
	glEnableVertexAttribArray(1);
	glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), (void*)(2*sizeof(float)));


	// Render to target frame buffer
	unsigned int data_framebuffer;
	glGenFramebuffers(1, &data_framebuffer);
	glBindFramebuffer(GL_FRAMEBUFFER, data_framebuffer);
	unsigned int draw_buffers[4] = {GL_COLOR_ATTACHMENT0, GL_COLOR_ATTACHMENT1, GL_COLOR_ATTACHMENT2, GL_COLOR_ATTACHMENT3};
	glDrawBuffers(4, draw_buffers);

	/*	DEFINE GRIDS
	*	Grids represented as textures, two for each field to allow changes and then swapping
	*		grid_u0		-->		velocity field
	*		grid_u1		-->		velocity field
	* 
	*		grid_s0		-->		scalar substance field
	*		grid_s1		-->		scalar substance field
	*/
	unsigned int grid_u0, grid_u1, grid_s0, grid_s1;
	glGenTextures(1, &grid_u0);
	glGenTextures(1, &grid_u1);
	glGenTextures(1, &grid_s0);
	glGenTextures(1, &grid_s1);
	
	glBindTexture(GL_TEXTURE_2D, grid_u0);
	glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB16F, GRID_WIDTH, GRID_HEIGHT, 0, GL_RGB, GL_UNSIGNED_BYTE, 0);
	configure_texture();
	glBindTexture(GL_TEXTURE_2D, grid_u1);
	glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB16F, GRID_WIDTH, GRID_HEIGHT, 0, GL_RGB, GL_UNSIGNED_BYTE, 0);
	configure_texture();


	glBindTexture(GL_TEXTURE_2D, grid_s0);
	glTexImage2D(GL_TEXTURE_2D, 0, GL_RED, GRID_WIDTH, GRID_HEIGHT, 0, GL_RED, GL_UNSIGNED_BYTE, 0);
	configure_texture();
	glBindTexture(GL_TEXTURE_2D, grid_s1);
	glTexImage2D(GL_TEXTURE_2D, 0, GL_RED, GRID_WIDTH, GRID_HEIGHT, 0, GL_RED, GL_UNSIGNED_BYTE, 0);
	configure_texture();


	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, grid_u0, 0);
	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT1, GL_TEXTURE_2D, grid_u1, 0);

	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT2, GL_TEXTURE_2D, grid_s0, 0);
	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT3, GL_TEXTURE_2D, grid_s1, 0);

	if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE) {
		std::cout << "L framebuffer creator" << std::endl;
		return false;
	}

	glBindVertexArray(VAO);

	//render.use();
	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, grid_u0);
	glActiveTexture(GL_TEXTURE1);
	glBindTexture(GL_TEXTURE_2D, grid_u1);
	glActiveTexture(GL_TEXTURE2);
	glBindTexture(GL_TEXTURE_2D, grid_s0);
	glActiveTexture(GL_TEXTURE3);
	glBindTexture(GL_TEXTURE_2D, grid_s1);

	
	float last_frame = static_cast<float>(glfwGetTime());
	float delta_time = 0, mouse_x = 0, mouse_y = 0;
	while (!glfwWindowShouldClose(window)) {
		float current_frame = static_cast<float>(glfwGetTime());
		delta_time = current_frame - last_frame;
		last_frame = current_frame;
		if (mouse_press) {
			double x, y;
			glfwGetCursorPos(window, &x, &y);
			mouse_x = x;
			mouse_y = HEIGHT - y;
		}

		processInput(window);

		glBindFramebuffer(GL_FRAMEBUFFER, data_framebuffer);
		glViewport(0, 0, GRID_WIDTH, GRID_HEIGHT);

		//glActiveTexture(GL_TEXTURE0);
		//glBindTexture(GL_TEXTURE_2D, 0);
		/* Complete calculations, transfer data between shaders, etc. */
		add_force.use();
		glUniform1f(glGetUniformLocation(add_force.getID(), "delta_time"), delta_time);
		glUniform2f(glGetUniformLocation(add_force.getID(), "grid_num"), GRID_NUM_X, GRID_NUM_Y);
		glUniform1i(glGetUniformLocation(add_force.getID(), "is_impulse"), mouse_press);
		glUniform2f(glGetUniformLocation(add_force.getID(), "impulse_pos"), mouse_x * (GRID_NUM_X / GRID_WIDTH), mouse_y * (GRID_NUM_Y / GRID_HEIGHT));
		glUniform1f(glGetUniformLocation(add_force.getID(), "r_impulse_radius"), 1/(float)splat_radius);
		glUniform1f(glGetUniformLocation(add_force.getID(), "impulse_magnitude"), impulse_magnitude);

		glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);

		//glBindTexture(GL_TEXTURE_2D, grid_u0);
		/*advect.use();
		glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);*/
		
		add_source.use();
		glUniform1f(glGetUniformLocation(add_source.getID(), "delta_time"), delta_time);
		glUniform2f(glGetUniformLocation(add_source.getID(), "grid_num"), GRID_NUM_X, GRID_NUM_Y);

		glUniform1i(glGetUniformLocation(add_source.getID(), "is_splat"), mouse_press);
		glUniform2f(glGetUniformLocation(add_source.getID(), "splat_pos"), mouse_x * (GRID_NUM_X/GRID_WIDTH), mouse_y * (GRID_NUM_Y/GRID_HEIGHT));
		glUniform1f(glGetUniformLocation(add_source.getID(), "r_splat_radius"), 1/(float)splat_radius);
		glUniform1f(glGetUniformLocation(add_source.getID(), "splat_amount"), splat_amount);

		glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);


		glBindFramebuffer(GL_FRAMEBUFFER, RENDER_FRAMEBUFFER);
		glViewport(0, 0, WIDTH, HEIGHT);
		glClear(GL_COLOR_BUFFER_BIT);
		/* Render substance */

		render.use();
		glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);

		
		/*glBindFramebuffer(GL_FRAMEBUFFER, rtt_fbo);

		glViewport(0, 0, GRID_WIDTH, GRID_HEIGHT);
		glClear(GL_COLOR_BUFFER_BIT);

		rtt_shader.use();
		glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
		

		glBindFramebuffer(GL_FRAMEBUFFER, rtt_fbo);
		glViewport(0, 0, WIDTH, HEIGHT);
		glClear(GL_COLOR_BUFFER_BIT);


		sim_shader.use();
		glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);

		glBindFramebuffer(GL_FRAMEBUFFER, 0);
		glViewport(0, 0, WIDTH, HEIGHT);
		glClear(GL_COLOR_BUFFER_BIT);
		rtt_shader.use();
		glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);

		if (mouse_press) {
			double x, y;
			glfwGetCursorPos(window, &x, &y);
			glUniform2f(glGetUniformLocation(sim_shader.getID(), "cursor_pos"), (float)x/WIDTH, (float)(1-y/HEIGHT));
		}
		else {
			glUniform2f(glGetUniformLocation(sim_shader.getID(), "cursor_pos"), (float)0, (float)0);
		}

		glUniform1f(glGetUniformLocation(sim_shader.getID(), "delta_time"), delta_time);*/


		glfwSwapBuffers(window);
		glfwPollEvents();
	}

	glDeleteVertexArrays(1, &VAO);
	glDeleteBuffers(1, &VBO);
	glDeleteBuffers(1, &EBO);

	glDeleteFramebuffers(1, &data_framebuffer);

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
		if (action == GLFW_PRESS)
			mouse_press = true;
		else if (action == GLFW_RELEASE)
			mouse_press = false;
	}
}

void configure_texture() {
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_R, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
}