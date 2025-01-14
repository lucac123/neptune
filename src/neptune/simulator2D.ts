import shaderCode from "bundle-text:./shaders/simulation2d.wgsl";

interface FieldManager {
  getComputeBindGroup(): GPUBindGroup;
  getComputeBindGroupReadOnly(): GPUBindGroup;
  getResolution(): vec2;
  swap(): void;

  release?(): void;
}

type vec2 = [number, number];

type fieldFactory = (
  device: GPUDevice,
  start: vec2,
  size: vec2,
  resolution: vec2
) => FieldManager;

export class Simulator2D {
  private viscosity: number = 0.001;
  private diffuseIterations: number = 50;
  private pressureIterations: number = 50;

  private device: GPUDevice;
  private pressureField: FieldManager;
  private velocityDivField: FieldManager;

  private paramsUniformBuffer: GPUBuffer;
  private paramsUniformBindGroup: GPUBindGroup;

  private paramsUniformArray: ArrayBuffer;
  private deltaTime: Float32Array;
  private cellSize: Float32Array;
  private diffuseAlpha: Float32Array;
  private diffuseBeta: Float32Array;
  private pressureAlpha: Float32Array;
  private pressureBeta: Float32Array;

  private advectPipeline: GPUComputePipeline;
  private diffusePipeline: GPUComputePipeline;
  private divergencePipeline: GPUComputePipeline;
  private computePressurePipeline: GPUComputePipeline;
  private subtractPressureGradientPipeline: GPUComputePipeline;

  constructor(
    device: GPUDevice,
    start: vec2,
    size: vec2,
    resolution: vec2,
    fieldFactory: fieldFactory
  ) {
    this.device = device;
    this.pressureField = fieldFactory(this.device, start, size, resolution);
    this.velocityDivField = fieldFactory(this.device, start, size, resolution);

    const shaderModule = this.device.createShaderModule({
      label: "sim shader module",
      code: shaderCode,
    });

    this.paramsUniformArray = new ArrayBuffer(6 * 4);
    this.deltaTime = new Float32Array(this.paramsUniformArray, 0, 1);
    this.cellSize = new Float32Array(this.paramsUniformArray, 4, 1);
    this.diffuseAlpha = new Float32Array(this.paramsUniformArray, 8, 1);
    this.diffuseBeta = new Float32Array(this.paramsUniformArray, 12, 1);
    this.pressureAlpha = new Float32Array(this.paramsUniformArray, 16, 1);
    this.pressureBeta = new Float32Array(this.paramsUniformArray, 20, 1);

    this.cellSize[0] = size[0] / resolution[0];

    this.paramsUniformBuffer = this.device.createBuffer({
      label: "sim uniforms",
      size: this.paramsUniformArray.byteLength,
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
    this.paramsUniformBindGroup = this.device.createBindGroup({
      label: "uniforms bind group",
      layout: uniformBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.paramsUniformBuffer,
          },
        },
      ],
    });

    const bindGroupLayouts = [
      uniformBindGroupLayout,
      this.device.createBindGroupLayout({
        label: "field a bind group",
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
      this.device.createBindGroupLayout({
        label: "field b bind group",
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.COMPUTE,
            buffer: {
              type: "read-only-storage",
            },
          },
        ],
      }),
    ];

    const pipelineLayout = this.device.createPipelineLayout({
      label: "pipeline layout",
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

    this.diffusePipeline = this.device.createComputePipeline({
      label: "diffuse pipeline",
      layout: pipelineLayout,
      compute: {
        module: shaderModule,
        entryPoint: "diffuse",
      },
    });

    this.divergencePipeline = this.device.createComputePipeline({
      label: "divergence pipeline",
      layout: pipelineLayout,
      compute: {
        module: shaderModule,
        entryPoint: "divergence",
      },
    });

    this.computePressurePipeline = this.device.createComputePipeline({
      label: "computePressure pipeline",
      layout: pipelineLayout,
      compute: {
        module: shaderModule,
        entryPoint: "computePressure",
      },
    });

    this.subtractPressureGradientPipeline = this.device.createComputePipeline({
      label: "subtractPressureGradient pipeline",
      layout: pipelineLayout,
      compute: {
        module: shaderModule,
        entryPoint: "subtractPressureGradient",
      },
    });
  }

  public step(
    deltaTime: number,
    substanceField: FieldManager,
    velocityField: FieldManager
  ) {
    this.deltaTime[0] = deltaTime;
    this.device.queue.writeBuffer(
      this.paramsUniformBuffer,
      0,
      this.paramsUniformArray
    );
    this.updateParams(deltaTime);

    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginComputePass();

    pass.setBindGroup(0, this.paramsUniformBindGroup);

    this.runPipeline(pass, this.advectPipeline, velocityField, velocityField);
    velocityField.swap();

    for (let i = 0; i < this.diffuseIterations; i++) {
      this.runPipeline(
        pass,
        this.diffusePipeline,
        velocityField,
        velocityField
      );
      velocityField.swap();
    }

    this.runPipeline(
      pass,
      this.divergencePipeline,
      this.velocityDivField,
      velocityField
    );
    this.velocityDivField.swap();

    for (let i = 0; i < this.pressureIterations; i++) {
      this.runPipeline(
        pass,
        this.computePressurePipeline,
        this.pressureField,
        this.velocityDivField
      );
      this.pressureField.swap();
    }

    this.runPipeline(
      pass,
      this.subtractPressureGradientPipeline,
      velocityField,
      this.pressureField
    );
    velocityField.swap();

    this.runPipeline(pass, this.advectPipeline, substanceField, velocityField);
    substanceField.swap();

    pass.end();

    this.device.queue.submit([encoder.finish()]);
  }

  public release(): void {
    this.pressureField.release?.();
    this.velocityDivField.release?.();

    this.paramsUniformBuffer.destroy();
  }

  private updateParams(deltaTime: number) {
    this.deltaTime[0] = deltaTime;

    this.diffuseAlpha[0] =
      (this.cellSize[0] * this.cellSize[0]) / (this.viscosity * deltaTime);
    this.diffuseBeta[0] = this.diffuseAlpha[0] + 4;

    this.pressureAlpha[0] = -this.cellSize[0] * this.cellSize[0];
    this.pressureBeta[0] = 4;

    this.device.queue.writeBuffer(
      this.paramsUniformBuffer,
      0,
      this.paramsUniformArray
    );
  }

  private runPipeline(
    pass: GPUComputePassEncoder,
    pipeline: GPUComputePipeline,
    fieldA: FieldManager,
    fieldB: FieldManager
  ) {
    pass.setBindGroup(1, fieldA.getComputeBindGroup());
    pass.setBindGroup(2, fieldB.getComputeBindGroupReadOnly());

    pass.setPipeline(pipeline);

    pass.dispatchWorkgroups(
      Math.ceil(fieldA.getResolution()[0] / 16),
      Math.ceil(fieldA.getResolution()[1] / 16)
    );
  }
}
