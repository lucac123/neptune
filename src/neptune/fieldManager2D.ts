type vec2 = [number, number];

export class FieldManager2D {
  private device: GPUDevice;

  private resolution: vec2;

  private renderBindGroups: GPUBindGroup[];
  private computeBindGroups: GPUBindGroup[];

  private fields: GPUBuffer[];

  constructor(device: GPUDevice, start: vec2, size: vec2, resolution: vec2) {
    this.resolution = resolution;
    this.device = device;

    const metadata = new ArrayBuffer(4 * (3 * 2));
    const resolutionView = new Uint32Array(metadata, 0 * 4, 2);
    const startView = new Float32Array(metadata, 2 * 4, 2);
    const sizeView = new Float32Array(metadata, 4 * 4, 2);
    resolutionView[0] = resolution[0];
    resolutionView[1] = resolution[1];
    startView[0] = start[0];
    startView[1] = start[1];
    sizeView[0] = size[0];
    sizeView[1] = size[1];

    const dataSize = this.resolution[0] * this.resolution[1] * 16;
    const metadataSize = Math.ceil(metadata.byteLength / 16) * 16;

    this.fields = [
      this.device.createBuffer({
        label: "Field",
        size: dataSize + metadataSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      }),
      this.device.createBuffer({
        label: "Field",
        size: dataSize + metadataSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      }),
    ];

    this.fields.forEach((field: GPUBuffer) => {
      this.device.queue.writeBuffer(field, 0, metadata);
    });

    const renderBindGroupLayout = this.device.createBindGroupLayout({
      label: "Field Render Bind Group Layout",
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: {
            type: "read-only-storage",
          },
        },
      ],
    });

    const computeBindGroupLayout = this.device.createBindGroupLayout({
      label: "Field Compute Bind Group Layout",
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
    });

    this.renderBindGroups = this.fields.map((field: GPUBuffer) => {
      const bindGroup: GPUBindGroup = this.device.createBindGroup({
        label: "Field Bind Group",
        layout: renderBindGroupLayout,
        entries: [
          {
            binding: 0,
            resource: {
              buffer: field,
            },
          },
        ],
      });
      return bindGroup;
    });

    this.computeBindGroups = this.fields.map(
      (field: GPUBuffer, index: number, fields: GPUBuffer[]) => {
        const bindGroup: GPUBindGroup = this.device.createBindGroup({
          label: "Field Bind Group",
          layout: computeBindGroupLayout,
          entries: [
            {
              binding: 0,
              resource: {
                buffer: field,
              },
            },
            {
              binding: 1,
              resource: {
                buffer: fields[index + 1] ?? fields[0],
              },
            },
          ],
        });
        return bindGroup;
      }
    );
  }

  public getRenderBindGroup(): GPUBindGroup {
    return this.renderBindGroups[0];
  }

  public getComputeBindGroup(): GPUBindGroup {
    return this.computeBindGroups[0];
  }

  public getResolution(): vec2 {
    return this.resolution;
  }

  public swap(): void {
    this.swapGroups(this.renderBindGroups);
    this.swapGroups(this.computeBindGroups);
  }

  public release(): void {
    this.fields.forEach((buffer: GPUBuffer) => {
      buffer.destroy();
    });
  }

  private swapGroups(bindGroups: GPUBindGroup[]): void {
    const usedBindGroup = bindGroups.shift();

    if (!usedBindGroup) {
      throw new Error("Error bind groups setup incorrectly");
    }

    bindGroups.push(usedBindGroup);
  }
}
