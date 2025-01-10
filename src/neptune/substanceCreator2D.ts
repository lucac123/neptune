import shaderCode from "bundle-text:./shaders/neptuneCompute2d.wgsl";

interface FieldManager {
  getComputeBindGroup(): GPUBindGroup;
  getResolution(): vec2;
  swap(): void;
}

type vec2 = [number, number];

export class SubstanceCreator2D {
  private shouldCreate: boolean = false;

  private position: vec2 | null = null;
  private force: vec2 | null = null;

  private device: GPUDevice;
  private pipeline: GPUComputePipeline;

  constructor(device: GPUDevice) {
    this.device = device;

    const shaderModule = this.device.createShaderModule({
      label: "Substance Creator 2D Shader Module",
      code: shaderCode,
    });

    const bindGroupLayouts = [
      this.device.createBindGroupLayout({
        label: "Field Bind Group",
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.COMPUTE,
            buffer: {
              type: "read-only-storage",
            },
          },
          {
            binding: 1,
            visibility: GPUShaderStage.COMPUTE,
            buffer: {
              type: "storage",
            },
          },
        ],
      }),
    ];

    const pipelineLayout = this.device.createPipelineLayout({
      label: "Substance creator 2D Pipeline layout",
      bindGroupLayouts: bindGroupLayouts,
    });

    this.pipeline = this.device.createComputePipeline({
      label: "substance creator 2d pipeline",
      layout: pipelineLayout,
      compute: {
        module: shaderModule,
        entryPoint: "computeMain",
      },
    });
  }

  public step(
    deltaTime: number,
    substanceField: FieldManager,
    velocityField: FieldManager
  ): void {
    if (this.shouldCreate) {
      // TODO add source to Field using compute shader
      console.log(`Adding source at ${this.position} with force ${this.force}`);
      const encoder = this.device.createCommandEncoder();
      const pass = encoder.beginComputePass();
      pass.setPipeline(this.pipeline);

      pass.setBindGroup(0, substanceField.getComputeBindGroup());
      pass.setBindGroup(1, velocityField.getComputeBindGroup());

      pass.dispatchWorkgroups(
        Math.ceil(substanceField.getResolution()[0] / 16),
        Math.ceil(substanceField.getResolution()[1] / 16)
      );
      pass.end();

      this.device.queue.submit([encoder.finish()]);

      substanceField.swap();
      velocityField.swap();
    }
  }

  // public release(): void {}

  public setInput(shouldCreate: boolean): void {
    this.shouldCreate = shouldCreate;
  }
  public setPosition(position: vec2): void {
    this.position = position;
  }
  public setForceOffset(force: vec2): void {
    this.force = force;
  }
}
