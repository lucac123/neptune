interface Mesh {}
interface Camera {}

export class Renderer2D {
  constructor() {}

  public render(view: GPUTextureView, mesh: Mesh, camera: Camera): void {}

  public release(): void {}
}
