# neptune
A real-time fluid simulation implementing Jos Stam's "Stable Fluids" [^fn1] solver, and computed on the GPU based on the techniques described by Mark J Harris in _GPU Gems_ [^fn2].

## Examples
![*gif* Viscosity Constant: 0.00001, Diffusion Constant: 0.00001](images/neptune_v_00001_d_00001.gif "Viscosity Constant: 0.00001, Diffusion Constant: 0.00001")
![*gif* Viscosity Constant: 0.00001, Diffusion Constant: 0.0005](images/neptune_v_00001_d_0005.gif "Viscosity Constant: 0.00001, Diffusion Constant: 0.0005")
![*gif* Viscosity Constant: 100, Diffusion Constant: 0.0005](images/neptune_v_100_d_0005.gif "Viscosity Constant: 100, Diffusion Constant: 0.0005")

See demos for video files

## Implementation Details
Implementation stores velocity fields and substance density fields for each timestep, and operates on them using fragment shaders, rendering the result of each operation to a framebuffer bound to a texture.

[^fn1]: Stam, Jos. "Stable fluids." Proceedings of the 26th annual conference on Computer graphics and interactive techniques. 1999. https://pages.cs.wisc.edu/~chaol/data/cs777/stam-stable_fluids.pdf
[^fn2]: Harris, Mark J. "Fast fluid dynamics simulation on the GPU." SIGGRAPH Courses 220.10.1145 (2005): 1198555-1198790. https://developer.nvidia.com/gpugems/gpugems/part-vi-beyond-triangles/chapter-38-fast-fluid-dynamics-simulation-gpu
