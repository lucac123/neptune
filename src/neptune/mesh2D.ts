type vec2 = [number, number];

export class Mesh2D {
  private vertices: Float32Array = new Float32Array([
    -0.5, -0.5, 0.5, -0.5, 0.5, 0.5,

    -0.5, -0.5, -0.5, 0.5, 0.5, 0.5,
  ]);

  private device: GPUDevice;
  private vertexBuffer: GPUBuffer;
  private uniformBuffer: GPUBuffer;

  private bindGroup: GPUBindGroup;

  private uniformArray: ArrayBuffer;
  private model: Float32Array;

  constructor(device: GPUDevice, start: vec2, diagonal: vec2) {
    this.device = device;

    this.vertexBuffer = this.device.createBuffer({
      label: "Plane Vertices",
      size: this.vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(this.vertexBuffer, 0, this.vertices);

    this.uniformArray = new ArrayBuffer(16 * 4);
    this.model = new Float32Array(this.uniformArray, 0, 16);

    this.uniformBuffer = this.device.createBuffer({
      label: "Model Uniform Buffer",
      size: this.uniformArray.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const position: vec2 = [0, 0];
    position[0] = start[0] + diagonal[0] / 2;
    position[1] = start[1] + diagonal[1] / 2;

    const modelMatrixVals = [
      [diagonal[0], 0, 0, 0],
      [0, diagonal[1], 0, 0],
      [0, 0, 1, 0],
      [position[0], position[1], 0, 1],
    ];
    this.writeMatrix(
      this.viewFromMatrix(this.uniformArray, 0),
      modelMatrixVals
    );

    this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformArray);

    const bindGroupLayout = this.device.createBindGroupLayout({
      label: "Model Uniforms Layout",
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: {
            type: "uniform",
          },
        },
      ],
    });
    this.bindGroup = this.device.createBindGroup({
      label: "Model Uniform Bind Group",
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.uniformBuffer,
          },
        },
      ],
    });
  }

  public getVertexBuffer(): GPUBuffer {
    return this.vertexBuffer;
  }

  public getVertexCount(): number {
    return this.vertices.length / 2;
  }

  public getBindGroup(): GPUBindGroup {
    return this.bindGroup;
  }

  public release(): void {
    this.uniformBuffer.destroy();
  }

  private writeMatrix(view: Float32Array[], vals: number[][]) {
    if (view.length != vals.length) {
      console.error(
        `views.length: ${view.length}, vals.length: ${vals.length}`
      );
      throw new Error(
        `writeMatrix failed, view and vals dimensions incompatible\nView:${view}\nVal:${vals}`
      );
    }
    for (let i = 0; i < view.length; i++) {
      if (view[i].length != vals[i].length) {
        console.error(
          `view[${i}].length: ${view[i].length}, vals[${i}].length: ${vals[i].length}`
        );
        throw new Error(
          `writeMatrix failed, view and vals dimensions incompatible\nView:${view[i]}\nVal:${vals[i]}`
        );
      }
      for (let j = 0; j < view[i].length; j++) {
        view[i][j] = vals[i][j];
      }
    }
  }

  /**
   * Generates 4x4 matrix view from matrix buffer
   *
   * Assumes matrix of length 16 floats
   *
   * @param matrix
   * @returns
   */
  private viewFromMatrix(
    buffer: ArrayBuffer,
    matrixOffset: number
  ): Float32Array[] {
    return [
      new Float32Array(buffer, matrixOffset + 0, 4),
      new Float32Array(buffer, matrixOffset + 4 * 4, 4),
      new Float32Array(buffer, matrixOffset + 4 * 8, 4),
      new Float32Array(buffer, matrixOffset + 4 * 12, 4),
    ];
  }
}
