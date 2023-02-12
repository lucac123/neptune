#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include "Shader.h"
#include "Texture.h"
#include "FrameBuffer.h"

void framebuffer_size_callback(GLFWwindow* window, int width, int height);
void mouse_button_callback(GLFWwindow* window, int button, int action, int mods);
void mouse_callback(GLFWwindow* window, double x, double y);
void processInput(GLFWwindow* window);

unsigned int WINDOW_WIDTH = 1080;
unsigned int WINDOW_HEIGHT = 720;

// SIM CONSTANTS
const float CELL_SIZE = 10;
const unsigned int GRID_NUM[] = { 1080, 720 };

const float force_multiplier = 1000;
const float r_force_radius = 1.0 / 100;
float force[2] = { 0,0 };

const float splat_multiplier = 0.3;
const float r_splat_radius = 1.0 / 300;

bool is_click = false;
float mouse_x = 0;
float mouse_y = 0;

float diffusion_constant = 0.0000001;
float viscosity = 0.0001;
float diffuse_iterations = 50; // 20-50
float dissipate_iterations = 50;

float project_iterations = 80; // 40-80

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
	glfwSetCursorPosCallback(window, mouse_callback);

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
	Shader subtract_gradient("quad.vert", "subtract_gradient.frag");
	Shader swap("quad.vert", "swap.frag");

	Shader add_source("quad.vert", "add_source.frag");

	Shader render("quad.vert", "render.frag");

	/* SCREEN QUAD */
	//float screen_quad[] = {
	//	// position		texture
	//	 1,	 1,			GRID_NUM[0],	GRID_NUM[1],
	//	 1,	-1,			GRID_NUM[0],	0,
	//	-1,	 1,			0,				GRID_NUM[1],
	//	-1,	-1,			0,				0,
	//	-1,	 1,			0,				GRID_NUM[1],
	//	 1,	-1,			GRID_NUM[0],	0
	//};
	float screen_quad[] = {
		// position		texture
		 1,	 1,			1,	1,
		 1,	-1,			1,	0,
		-1,	 1,			0,	1,
		-1,	-1,			0,	0,
		-1,	 1,			0,	1,
		 1,	-1,			1,	0
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
		*			is_force - true when click
		*			force - force vector
		*			force_pos - position of click
		*			r_force_radius - 1/(force radius)
		*/
		data_framebuffer.bindTexture(velocity1.getID());
		velocity0.bind();
		add_force.use();
		add_force.setUniform("size", (float)GRID_NUM[0], (float)GRID_NUM[1]);
		add_force.setUniform("in_velocity", 0);
		add_force.setUniform("delta_time", delta_time);
		add_force.setUniform("is_force", is_click);
		add_force.setUniform("force", force[0], force[1]);
		add_force.setUniform("force_pos", mouse_x, mouse_y);
		add_force.setUniform("r_force_radius", r_force_radius);

		runShader();

		/* Advect 
		*	shader: advect
		*		in - velocity1
		*		out - velocity0
		*		parameters:
		*			delta_time - timestep
		*/
		data_framebuffer.bindTexture(velocity0.getID());
		velocity1.bind();
		advect.use();
		advect.setUniform("size", (float)GRID_NUM[0], (float)GRID_NUM[1]);
		advect.setUniform("in_quantity", 0);
		advect.setUniform("velocity", 0);
		advect.setUniform("delta_time", delta_time);

		runShader();

		


		/* Diffuse
		*	loop:
		*		shader: jacobi
		*			in - velocity0
		*			out - velocity1
		*		shader: jacobi
		*			in - velocity1
		*			out - velocity0
		*			parameters:
		*				delta_time - timestep
		*				alpha - (cell size)^2/(viscosity * timestep)
		*				beta - 4 + alpha
		*/
		jacobi.use();
		jacobi.setUniform("size", (float)GRID_NUM[0], (float)GRID_NUM[1]);
		jacobi.setUniform("input_x", 0);
		jacobi.setUniform("input_b", 0);
		float alpha = CELL_SIZE * CELL_SIZE / (viscosity * delta_time);
		jacobi.setUniform("alpha", alpha);
		jacobi.setUniform("r_beta", 1/(alpha + 4));

		for (int i = 0; i < diffuse_iterations/2; i++) {
			data_framebuffer.bindTexture(velocity1.getID());
			velocity0.bind();
			runShader();

			data_framebuffer.bindTexture(velocity0.getID());
			velocity1.bind();
			runShader();
		}

		/* Project
		*	shader: divergence
		*		in - velocity0
		*		out - velocity_div
		*		parameters:
		*			r_cell_size - 1/cell size */
		data_framebuffer.bindTexture(velocity_div.getID());
		velocity0.bind();
		divergence.use();
		divergence.setUniform("size", (float)GRID_NUM[0], (float)GRID_NUM[1]);
		divergence.setUniform("v_field", 0);
		divergence.setUniform("r_cell_size", 1 / (float)CELL_SIZE);
		runShader();

		/*	loop:					// Pressure
		*		shader: jacobi
		*			in - pressure0
		*			out - pressure1
		*		shader: jacobi
		*			in - pressure1
		*			out - pressure0 */
		data_framebuffer.bindTexture(pressure0.getID()); //Reset pressure to 0
		glClearColor(0, 0, 0, 0);
		glClear(GL_COLOR_BUFFER_BIT);

		velocity_div.bind(GL_TEXTURE1);
		jacobi.use();
		jacobi.setUniform("size", (float)GRID_NUM[0], (float)GRID_NUM[1]);
		jacobi.setUniform("input_x", 0);
		jacobi.setUniform("input_b", 1);
		jacobi.setUniform("alpha", (float) -1 * (CELL_SIZE * CELL_SIZE));
		jacobi.setUniform("r_beta", 0.25f);
		for (int i = 0; i < project_iterations / 2; i++) {
			data_framebuffer.bindTexture(pressure0.getID());
			pressure1.bind();
			runShader();

			data_framebuffer.bindTexture(pressure1.getID());
			pressure0.bind();
			runShader();
		}

		/*	shader: boundary		// Pressure
		*		in - pressure0
		*		out - pressure1		*/
		//data_framebuffer.bindTexture(pressure1.getID());
		//pressure0.bind();
		//boundary.use();
		//boundary.setUniform("field", 0);
		//boundary.setUniform("scale", 1);
		//runShader();
		/*	shader: swap
		*		in - pressure1
		*		in - pressure0
		*/
		//data_framebuffer.bindTexture(pressure0.getID());
		//pressure1.bind();
		//swap.use();
		//runShader();
		

		/*	shader: subtract_gradient
		*		in - velocity0, pressure0
		*		out - velocity1
		*/
		data_framebuffer.bindTexture(velocity1.getID());
		velocity0.bind(GL_TEXTURE0);
		pressure0.bind(GL_TEXTURE1);
		subtract_gradient.use();
		subtract_gradient.setUniform("size", (float)GRID_NUM[0], (float)GRID_NUM[1]);
		subtract_gradient.setUniform("in_velocity", 0);
		subtract_gradient.setUniform("in_pressure", 1);
		subtract_gradient.setUniform("r_cell_size", 1 / (float)CELL_SIZE);

		runShader();
		//pressure0.unbind();

		/*	shader: swap
		*		in - velocity1
		*		out - velocity0		*/
		data_framebuffer.bindTexture(velocity0.getID());
		velocity1.bind();
		swap.use();
		swap.setUniform("size", (float)GRID_NUM[0], (float)GRID_NUM[1]);
		//runShader();


		/* Boundary
		*	shader: boundary		// Velocity
		*		in - velocity1
		*		out - velocity0 */
		data_framebuffer.bindTexture(velocity0.getID());
		velocity1.bind();
		boundary.use();
		boundary.setUniform("size", (float)GRID_NUM[0], (float)GRID_NUM[1]);
		boundary.setUniform("field", 0);
		boundary.setUniform("scale", -1);
		runShader();

		
		
		

	/** DYE **/
		/* Add Source
		*	shader: add_force
		*		in - substance0
		*		out - substance1
		*/
		data_framebuffer.bindTexture(substance1.getID());
		substance0.bind();
		add_source.use();
		add_source.setUniform("size", (float)GRID_NUM[0], (float)GRID_NUM[1]);
		add_source.setUniform("in_substance", 0);
		add_source.setUniform("time", current_frame);
		add_source.setUniform("is_splat", is_click);
		add_source.setUniform("splat_pos", mouse_x, mouse_y);
		add_source.setUniform("r_splat_radius", r_splat_radius);
		add_source.setUniform("splat_multiplier", splat_multiplier);

		runShader();

		data_framebuffer.bindTexture(substance0.getID());
		substance1.bind();
		swap.use();
		swap.setUniform("size", (float)GRID_NUM[0], (float)GRID_NUM[1]);
		//runShader();

		/* Diffuse
		*	loop:
		*		shader: jacobi
		*			in - substance0
		*			out - substance1
		*		shader: jacobi
		*			in - substance1
		*			out - substance0
		*/
		jacobi.use();
		jacobi.setUniform("size", (float)GRID_NUM[0], (float)GRID_NUM[1]);
		jacobi.setUniform("input_x", 0);
		jacobi.setUniform("input_b", 0);
		alpha = CELL_SIZE * CELL_SIZE / (diffusion_constant * delta_time);
		jacobi.setUniform("alpha", alpha);
		jacobi.setUniform("r_beta", 1 / (4 + alpha));
		for (int i = 0; i < dissipate_iterations / 2; i++) {
			data_framebuffer.bindTexture(substance0.getID());
			substance1.bind(GL_TEXTURE0);
			runShader();

			data_framebuffer.bindTexture(substance1.getID());
			substance0.bind(GL_TEXTURE0);
			runShader();
		}

		/* Advect
		*	shader: advect
		*		in - substance1
		*		out - substance0
		*/
		data_framebuffer.bindTexture(substance0.getID());
		substance1.bind();
		velocity0.bind(GL_TEXTURE1);

		advect.use();
		advect.setUniform("size", (float)GRID_NUM[0], (float)GRID_NUM[1]);
		advect.setUniform("in_quantity", 0);
		advect.setUniform("velocity", 1);
		advect.setUniform("delta_time", delta_time);

		runShader();

		

	/** RENDER **/
		/* Render
		*	shader: render
		*		in - velocity0, substance0
		*/
		data_framebuffer.unbind(); // back to default frame buffer
		velocity1.bind(GL_TEXTURE0); // bind velocity 0 texture to TEXTURE0
		substance0.bind(GL_TEXTURE1);
		
		render.use();
		render.setUniform("size", (float)WINDOW_WIDTH, (float)WINDOW_HEIGHT);
		render.setUniform("velocity", 0); // set texture
		render.setUniform("substance", 1);
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
	WINDOW_WIDTH = width;
	WINDOW_HEIGHT = height;
}

void mouse_button_callback(GLFWwindow* window, int button, int action, int mods) {
	if (button == GLFW_MOUSE_BUTTON_LEFT) {
		if (action == GLFW_PRESS)
			is_click = true;
		else if (action == GLFW_RELEASE)
			is_click = false;
	}
}

void mouse_callback(GLFWwindow* window, double x, double y) {
	float new_x = (x / WINDOW_WIDTH) * GRID_NUM[0];
	float new_y = (1 - y / WINDOW_HEIGHT) * GRID_NUM[1];
	if (mouse_x != new_x || mouse_y != new_y) {
		force[0] = (new_x - mouse_x)*force_multiplier;
		force[1] = (new_y - mouse_y)*force_multiplier;
		mouse_x = new_x;
		mouse_y = new_y;
	}
}

void runShader() {
	glDrawArrays(GL_TRIANGLES, 0, 6);
}