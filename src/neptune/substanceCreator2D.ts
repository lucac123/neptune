import shaderCode from "bundle-text:./shaders/addToField2d.wgsl";

interface FieldManager {
  getComputeBindGroup(): GPUBindGroup;
  getResolution(): vec2;
  swap(): void;
}

type vec2 = [number, number];

type inputUniform = {
  uniformBuffer: GPUBuffer;
  uniformBindGroup: GPUBindGroup;
  uniformArray: ArrayBuffer;
  amount: Float32Array;
  position: Float32Array;
  radius: Float32Array;
};

export class SubstanceCreator2D {
  private shouldCreate: boolean = false;

  private mass: number = 1;
  private radius: number = 0.1;
  private substanceAmount: number = 1;

  private position: vec2 | null = null;
  private force: vec2 | null = null;

  private device: GPUDevice;
  private pipeline: GPUComputePipeline;

  private substanceUniform: inputUniform;
  private velocityUniform: inputUniform;

  private uniformBindGroupLayout: GPUBindGroupLayout;

  constructor(device: GPUDevice) {
    this.device = device;

    const shaderModule = this.device.createShaderModule({
      label: "Substance Creator 2D Shader Module",
      code: shaderCode,
    });

    this.uniformBindGroupLayout = this.device.createBindGroupLayout({
      label: "Uniform Bind Group",
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: "uniform",
          },
        },
      ],
    });

    this.substanceUniform = this.createInputUniforms();
    this.velocityUniform = this.createInputUniforms();

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
      this.uniformBindGroupLayout,
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
        entryPoint: "addToField2d",
      },
    });
  }

  public step(
    deltaTime: number,
    substanceField: FieldManager,
    velocityField: FieldManager
  ): void {
    if (this.shouldCreate) {
      this.updateUniforms();

      this.device.queue.writeBuffer(
        this.substanceUniform.uniformBuffer,
        0,
        this.substanceUniform.uniformArray
      );
      this.device.queue.writeBuffer(
        this.velocityUniform.uniformBuffer,
        0,
        this.velocityUniform.uniformArray
      );

      const encoder = this.device.createCommandEncoder();
      const pass = encoder.beginComputePass();
      pass.setPipeline(this.pipeline);

      // Add to velocity field
      pass.setBindGroup(0, velocityField.getComputeBindGroup());
      pass.setBindGroup(1, this.velocityUniform.uniformBindGroup);

      pass.dispatchWorkgroups(
        Math.ceil(velocityField.getResolution()[0] / 16),
        Math.ceil(velocityField.getResolution()[1] / 16)
      );

      // Add to substance field
      pass.setBindGroup(0, substanceField.getComputeBindGroup());
      pass.setBindGroup(1, this.substanceUniform.uniformBindGroup);

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

  public setInput(shouldCreate: boolean): void {
    this.shouldCreate = shouldCreate;
  }
  public setPosition(position: vec2): void {
    this.position = position;
  }
  public setForceOffset(force: vec2): void {
    this.force = force;
  }

  public release(): void {
    this.substanceUniform.uniformBuffer.destroy();
    this.velocityUniform.uniformBuffer.destroy();
  }

  private updateUniforms(): void {
    this.updateSubstanceUniforms();
    this.updateVelocityUniforms();
  }

  private updateSubstanceUniforms(): void {
    if (!this.position)
      throw new Error("Error in substance creation, improperly initialized");

    this.substanceUniform.position[0] = this.position[0];
    this.substanceUniform.position[1] = this.position[1];

    this.substanceUniform.radius[0] = this.radius;

    const time = performance.now();
    const red = (Math.sin(time) + 1) / 3;
    const green = (Math.sin(time + (2 * Math.PI) / 3) + 1) / 3;
    const blue = (Math.sin(time + (4 * Math.PI) / 3) + 1) / 3;

    this.substanceUniform.amount[0] = this.substanceAmount * red;
    this.substanceUniform.amount[1] = this.substanceAmount * green;
    this.substanceUniform.amount[2] = this.substanceAmount * blue;
  }
  private updateVelocityUniforms(): void {
    if (!this.position || !this.force)
      throw new Error("Error in substance creation, improperly initialized");

    this.velocityUniform.position[0] = this.position[0];
    this.velocityUniform.position[1] = this.position[1];

    this.velocityUniform.radius[0] = this.radius;

    this.velocityUniform.amount[0] = this.force[0] / this.mass;
    this.velocityUniform.amount[1] = this.force[1] / this.mass;
  }

  private createInputUniforms(): inputUniform {
    const arrayBuffer = new ArrayBuffer((4 + 2 + 1) * 4);
    const amount = new Float32Array(arrayBuffer, 0, 3);
    const position = new Float32Array(arrayBuffer, 16, 2);
    const radius = new Float32Array(arrayBuffer, 24, 1);

    const bufferLength = Math.ceil(arrayBuffer.byteLength / 32) * 32;

    const uniformBuffer = this.device.createBuffer({
      label: "Uniform Buffer",
      size: bufferLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const uniformBindGroup = this.device.createBindGroup({
      label: "Uniform Bind Group",
      layout: this.uniformBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: uniformBuffer,
          },
        },
      ],
    });

    return {
      uniformBuffer: uniformBuffer,
      uniformArray: arrayBuffer,
      uniformBindGroup: uniformBindGroup,
      amount: amount,
      position: position,
      radius: radius,
    };
  }
}
