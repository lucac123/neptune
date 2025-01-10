import shaderCode from "bundle-text:./shaders/render2d.wgsl";

interface Mesh {
  getVertexBuffer(): GPUBuffer;
  getVertexCount(): number;
  getBindGroup(): GPUBindGroup;
}
interface FieldManager {
  getRenderBindGroup(): GPUBindGroup;
}
interface Camera {
  getBindGroup(): GPUBindGroup;
}

export class Renderer2D {
  private device: GPUDevice;

  private pipeline: GPURenderPipeline;

  constructor(device: GPUDevice, targetFormat: GPUTextureFormat) {
    this.device = device;

    const shaderModule = this.device.createShaderModule({
      label: "2D Renderer Shader Module",
      code: shaderCode,
    });

    const bindGroupLayouts = [
      this.device.createBindGroupLayout({
        label: "Model Uniforms",
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.VERTEX,
            buffer: {
              type: "uniform",
            },
          },
        ],
      }),
      this.device.createBindGroupLayout({
        label: "Camera Uniorms",
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.VERTEX,
            buffer: {
              type: "uniform",
            },
          },
        ],
      }),
      this.device.createBindGroupLayout({
        label: "Field buffer bind group",
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT,
            buffer: {
              type: "read-only-storage",
            },
          },
        ],
      }),
    ];
    const pipelineLayout = this.device.createPipelineLayout({
      label: "2D Renderer Pipeline Layout",
      bindGroupLayouts: bindGroupLayouts,
    });

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

    this.pipeline = this.device.createRenderPipeline({
      label: "2D Renderer Pipeline",
      layout: pipelineLayout,
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
            format: targetFormat,
          },
        ],
      },
    });
  }

  public render(
    view: GPUTextureView,
    mesh: Mesh,
    substanceField: FieldManager,
    camera: Camera
  ): void {
    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: view,
          loadOp: "clear",
          clearValue: { r: 0.5, g: 0.2, b: 0.5, a: 1 },
          storeOp: "store",
        },
      ],
    });

    pass.setPipeline(this.pipeline);

    pass.setBindGroup(0, mesh.getBindGroup());
    pass.setBindGroup(1, camera.getBindGroup());
    pass.setBindGroup(2, substanceField.getRenderBindGroup());

    pass.setVertexBuffer(0, mesh.getVertexBuffer());

    pass.draw(mesh.getVertexCount());

    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }
}
