import shaderCode from "bundle-text:./shaders/simulation2d.wgsl";

interface FieldManager {
  getComputeBindGroup(): GPUBindGroup;
  getResolution(): vec2;
  swap(): void;
}

type vec2 = [number, number];

export class Simulator2D {
  private device: GPUDevice;
  // private pressureField: FieldManager;

  private uniformBuffer: GPUBuffer;
  private uniformBindGroup: GPUBindGroup;

  private uniformArray: ArrayBuffer;
  private deltaTimeView: Float32Array;

  private advectPipeline: GPUComputePipeline;

  constructor(device: GPUDevice) {
    this.device = device;
    // this.pressureField = pressureField;

    const shaderModule = this.device.createShaderModule({
      label: "sim shader module",
      code: shaderCode,
    });

    this.uniformArray = new ArrayBuffer(4);
    this.deltaTimeView = new Float32Array(this.uniformArray, 0, 1);

    this.uniformBuffer = this.device.createBuffer({
      label: "sim uniforms",
      size: this.uniformArray.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const uniformBindGroupLayout = this.device.createBindGroupLayout({
      label: "uniforms layout",
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
    this.uniformBindGroup = this.device.createBindGroup({
      label: "uniforms bind group",
      layout: uniformBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.uniformBuffer,
          },
        },
      ],
    });

    const bindGroupLayouts = [
      this.device.createBindGroupLayout({
        label: "field bidn group",
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
      uniformBindGroupLayout,
    ];

    const pipelineLayout = this.device.createPipelineLayout({
      label: "advect pipeline layout",
      bindGroupLayouts: bindGroupLayouts,
    });

    this.advectPipeline = this.device.createComputePipeline({
      label: "advect pipeline",
      layout: pipelineLayout,
      compute: {
        module: shaderModule,
        entryPoint: "advect",
      },
    });
  }

  public step(
    deltaTime: number,
    substanceField: FieldManager,
    velocityField: FieldManager
  ) {
    this.deltaTimeView[0] = deltaTime;
    this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformArray);

    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginComputePass();

    pass.setBindGroup(0, velocityField.getComputeBindGroup());
    pass.setBindGroup(1, this.uniformBindGroup);

    pass.setPipeline(this.advectPipeline);

    pass.dispatchWorkgroups(
      Math.ceil(velocityField.getResolution()[0] / 16),
      Math.ceil(velocityField.getResolution()[1] / 16)
    );

    velocityField.swap();

    pass.end();

    this.device.queue.submit([encoder.finish()]);
  }

  // public release(): void {}
}
