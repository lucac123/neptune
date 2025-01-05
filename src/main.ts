/**
 * Load shader code from external file
 */
async function loadShader(shaderName: string): Promise<string> {
  try {
    const response = await fetch(`shaders/${shaderName}.wgsl`);
    return await response.text();
  } catch {
    throw new Error(`Failed to load shader ${shaderName}`);
  }
}

/**
 * Initial entry point
 */
async function main(): Promise<void> {
  const GRID_SIZE = 32;

  const canvas = document.querySelector("canvas");
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error(`Expected HTMLCanvasElement, recieved ${canvas}`);
    return;
  }

  canvas.setAttribute("width", "500px");
  canvas.setAttribute("height", "500px");

  if (!navigator.gpu) {
    throw new Error("WebGPU not supported in this browser.");
  }

  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: "high-performance",
  });
  if (!adapter) {
    throw new Error("No appropriate GPUAdapter found.");
  }

  console.log(adapter.info);

  const device = await adapter.requestDevice();
  if (!device) {
    throw new Error("No appropriate GPUDevice foujnd.");
  }

  const context = canvas.getContext("webgpu");
  if (!context) {
    throw new Error("Failed to get webgpu context from canvas element");
  }

  const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device: device,
    format: canvasFormat,
  });

  const vertices = new Float32Array([
    // X,   Y,
    -0.8, -0.8, 0.8, -0.8, 0.8, 0.8, -0.8, -0.8, 0.8, 0.8, -0.8, 0.8,
  ]);

  const vertexBuffer = device.createBuffer({
    label: "Cell Vertices",
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(vertexBuffer, 0, vertices);

  const vertexBufferLayout: GPUVertexBufferLayout = {
    arrayStride: 8,
    attributes: [
      {
        format: "float32x2",
        offset: 0,
        shaderLocation: 0,
      },
    ],
  };

  const shaderCode = await loadShader("cell_shader");
  const cellShaderModule = device.createShaderModule({
    label: "Cell shader",
    code: shaderCode,
  });

  const cellPipeline = device.createRenderPipeline({
    label: "Cell pipeline",
    layout: "auto",
    vertex: {
      module: cellShaderModule,
      entryPoint: "vertexMain",
      buffers: [vertexBufferLayout],
    },
    fragment: {
      module: cellShaderModule,
      entryPoint: "fragmentMain",
      targets: [
        {
          format: canvasFormat,
        },
      ],
    },
  });

  const uniformArray = new Float32Array([GRID_SIZE, GRID_SIZE]);
  const uniformBuffer = device.createBuffer({
    label: "Grid uniforms",
    size: uniformArray.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

  const bindGroup = device.createBindGroup({
    label: "Cell renderer bind group",
    layout: cellPipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: { buffer: uniformBuffer },
      },
    ],
  });

  /**
   * Clear canvas
   */
  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        clearValue: { r: 0, g: 0, b: 0.4, a: 1 },
        storeOp: "store",
      },
    ],
  });

  pass.setPipeline(cellPipeline);
  pass.setVertexBuffer(0, vertexBuffer);

  pass.setBindGroup(0, bindGroup);

  pass.draw(vertices.length / 2, GRID_SIZE * GRID_SIZE);

  pass.end();
  device.queue.submit([encoder.finish()]);
}

/**
 * Run main function after DOM fully loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  main();
});
