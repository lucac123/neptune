interface State {}
interface Camera {}

const PLANE_VERTICES = new Float32Array([
  -0.8, -0.8, 0.8, -0.8, 0.8, 0.8,

  -0.8, -0.8, -0.8, 0.8, 0.8, 0.8,
]);

export class Renderer {
  private vertices: Float32Array;
  private vertexBuffer: GPUBuffer;
  private cellPipeline: GPURenderPipeline;
  private bindGroup: GPUBindGroup;

  constructor() {}

  public render(
    device: GPUDevice,
    renderView: GPUTextureView,
    dimensions: number,
    state: State,
    camera: Camera
  ) {
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          //   view: context.getCurrentTexture().createView(),
          view: renderView,
          loadOp: "clear",
          clearValue: { r: 0, g: 0, b: 0.4, a: 1 },
          storeOp: "store",
        },
      ],
    });

    pass.setPipeline(this.cellPipeline);
    pass.setVertexBuffer(0, this.vertexBuffer);

    pass.setBindGroup(0, this.bindGroup);

    pass.draw(this.vertices.length / 2);

    pass.end();
    device.queue.submit([encoder.finish()]);
  }
}
