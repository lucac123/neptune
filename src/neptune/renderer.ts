interface State {}
interface Camera {}

const PLANE_VERTICES = new Float32Array([
  -0.8, -0.8, 0.8, -0.8, 0.8, 0.8,

  -0.8, -0.8, -0.8, 0.8, 0.8, 0.8,
]);

export class Renderer {
  private vertices: Float32Array;
  private vertexBuffer: GPUBuffer;
  private pipeline: GPURenderPipeline;
  //   private bindGroup: GPUBindGroup;

  private device: GPUDevice;

  constructor(device: GPUDevice, canvasFormat: GPUTextureFormat) {
    this.device = device;
    this.vertices = PLANE_VERTICES;
    this.vertexBuffer = this.device.createBuffer({
      label: "2D Renderer Vertices",
      size: this.vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(this.vertexBuffer, 0, this.vertices);

    const vertexBufferLayout: GPUVertexBufferLayout = {
      arrayStride: 2 * 4,
      attributes: [
        {
          format: "float32x2",
          offset: 0,
          shaderLocation: 0,
        },
      ],
    };

    const shaderModule = this.device.createShaderModule({
      label: "2D Renderer Shader Module",
      code: `
        @vertex
        fn vertexMain(@location(0) pos: vec2f) ->
            @builtin(position) vec4f {
            return vec4f(pos, 0, 1);
        }

        @fragment
            fn fragmentMain() -> @location(0) vec4f {
            return vec4f(1, 0, 0, 1);
        }
        `,
    });

    this.pipeline = this.device.createRenderPipeline({
      label: "2D Renderer Pipeline",
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
        buffers: [vertexBufferLayout],
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fragmentMain",
        targets: [
          {
            format: canvasFormat,
          },
        ],
      },
    });
  }

  public render(
    renderView: GPUTextureView,
    dimensions: number,
    state: State,
    camera: Camera
  ) {
    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: renderView,
          loadOp: "clear",
          clearValue: { r: 0.5, g: 0.2, b: 0.5, a: 1 },
          storeOp: "store",
        },
      ],
    });

    pass.setPipeline(this.pipeline);
    pass.setVertexBuffer(0, this.vertexBuffer);

    // pass.setBindGroup(0, this.bindGroup);

    pass.draw(this.vertices.length / 2);

    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }
}
