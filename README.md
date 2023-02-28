# neptune
A real-time fluid simulation implementing Jos Stam's "Stable Fluids" [^fn1] solver, and computed on the GPU based on the techniques described by Mark J Harris in _GPU Gems_ [^fn2]. Interaction with the GPU is done using OpenGL, based on the setup described in Joey DeVries' online tutorial [^fn3].

## Examples
![*gif* Viscosity Constant: 0.00001, Diffusion Constant: 0.00001](images/neptune_v_00001_d_00001.gif "Viscosity Constant: 0.00001, Diffusion Constant: 0.00001")
![*gif* Viscosity Constant: 0.00001, Diffusion Constant: 0.0005](images/neptune_v_00001_d_0005 "Viscosity Constant: 0.00001, Diffusion Constant: 0.0005")
![*gif* Viscosity Constant: 100, Diffusion Constant: 0.0005](images/neptune_v_100_d_0005 "Viscosity Constant: 100, Diffusion Constant: 0.0005")

[^fn1]: Stam, Jos. "Stable fluids." Proceedings of the 26th annual conference on Computer graphics and interactive techniques. 1999. https://pages.cs.wisc.edu/~chaol/data/cs777/stam-stable_fluids.pdf
[^fn2]: Harris, Mark J. "Fast fluid dynamics simulation on the GPU." SIGGRAPH Courses 220.10.1145 (2005): 1198555-1198790. https://developer.nvidia.com/gpugems/gpugems/part-vi-beyond-triangles/chapter-38-fast-fluid-dynamics-simulation-gpu
[^fn3]: “Welcome to OpenGL.” Learn OpenGL, Extensive Tutorial Resource for Learning Modern OpenGL, https://learnopengl.com/. 
