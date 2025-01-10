type vec2 = [number, number];

export class Camera2D {
  private start: vec2;
  private extent: vec2;

  private device: GPUDevice;
  private uniformBuffer: GPUBuffer;
  private bindGroup: GPUBindGroup;

  private uniformArray: ArrayBuffer;
  private view: Float32Array;
  private projection: Float32Array;

  /**
   * Construct a new 2D Camera using the start (lower left corner) and extent (diagonal to top left)
   *
   * @param start vec2 start in world space
   * @param extent vec2 extent in world space
   */
  constructor(device: GPUDevice, start: vec2, extent: vec2) {
    this.device = device;
    this.start = start;
    this.extent = extent;

    this.uniformArray = new ArrayBuffer(2 * (16 * 4));
    this.projection = new Float32Array(this.uniformArray, 0, 16);
    this.view = new Float32Array(this.uniformArray, 16 * 4, 16);

    this.uniformBuffer = this.device.createBuffer({
      label: "Camera Uniform Buffer",
      size: this.uniformArray.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.calculateViewMatrix();
    this.calculateProjectionMatrix();
    this.writeMatricesToBuffer();

    const bindGroupLayout = this.device.createBindGroupLayout({
      label: "Camera Uniforms Layout",
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
      label: "Camera Uniform Bind Group",
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

  /**
   * Compute world space coordinates corresponding with screen space coordinate given
   * @param screenPosition screen space coordinate. Assume (0,0) is top left, (1,1) is bottom right
   * @returns appropriate world space coordinate
   */
  public screenToWorldSpace(screenPosition: vec2): vec2 {
    const worldPosition: vec2 = [0, 0];

    worldPosition[0] = screenPosition[0] * this.extent[0] + this.start[0];
    worldPosition[1] = (1 - screenPosition[1]) * this.extent[1] + this.start[1];

    return worldPosition;
  }

  public getBindGroup(): GPUBindGroup {
    return this.bindGroup;
  }

  public release(): void {
    this.uniformBuffer.destroy();
  }

  private calculateViewMatrix(): void {
    const position: vec2 = [0, 0];
    position[0] = this.start[0] + this.extent[0] / 2;
    position[1] = this.start[1] + this.extent[1] / 2;

    const matrixVals = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [-position[0], -position[1], 0, 1],
    ];

    this.writeMatrix(
      this.viewFromMatrix(this.uniformArray, 16 * 4),
      matrixVals
    );
  }

  private calculateProjectionMatrix(): void {
    const size = this.extent[0]/2;
    const aspect = this.extent[0] / this.extent[1];
    const matrixVals = [
      [1 / size, 0, 0, 0],
      [0, aspect / size, 0, 0],
      [0, 0, -0.5, 0],
      [0, 0, 0.5, 1],
    ];

    this.writeMatrix(this.viewFromMatrix(this.uniformArray, 0), matrixVals);
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

  private writeMatricesToBuffer(mat?: "view" | "projection") {
    switch (mat) {
      case "view":
        this.device.queue.writeBuffer(this.uniformBuffer, 16 * 4, this.view);
        break;
      case "projection":
        this.device.queue.writeBuffer(this.uniformBuffer, 0, this.projection);
        break;
      default:
        this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformArray);
    }
  }
}
