type vec2 = [number, number];
type vec3 = [number, number, number];

export class SimulationState {
  private dimensions: number;
  private resolution: vec2 | vec3;
  private device: GPUDevice;

  private velocityField: [GPUBuffer, GPUBuffer];

  constructor(resolution: vec2 | vec3, device: GPUDevice) {
    this.dimensions = resolution.length;
    this.resolution = resolution;
    this.device = device;

    // TODO CURRENTLY SUPPORTS ONLY 2D
    const defaultArray = new Float32Array(
      this.resolution[0] * this.resolution[1] * (this.resolution?.[2] ?? 1)
    );
    for (let i = 0; i < defaultArray.length; i++) {
      if (i % 3 == 0) {
        defaultArray[i] = 1;
      }
    }

    this.velocityField = [
      this.device.createBuffer({
        label: "Velocity Field A",
        size: defaultArray.byteLength,
        usage:
          GPUBufferUsage.STORAGE |
          GPUBufferUsage.COPY_DST |
          GPUBufferUsage.COPY_SRC,
      }),
      this.device.createBuffer({
        label: "Velocity Field B",
        size: defaultArray.byteLength,
        usage:
          GPUBufferUsage.STORAGE |
          GPUBufferUsage.COPY_DST |
          GPUBufferUsage.COPY_SRC,
      }),
    ];

    this.device.queue.writeBuffer(this.velocityField[0], 0, defaultArray);
  }

  public resize(newResolution: vec2) {
    // TODO implement this
    // throw new Error(
    //   "SimulationState does not currently support dynamic resizing"
    // );
  }
}
