type vec2 = [number, number];

export class Camera2D {
  constructor() {}

  public screenToWorldSpace(screenPosition: vec2): vec2 {
    // TODO evaluate using view and projection matrices
    return screenPosition;
  }

  public release(): void {}
}
