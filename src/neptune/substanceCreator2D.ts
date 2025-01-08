interface State {}

type vec2 = [number, number];

export class SubstanceCreator2D {
  private shouldCreate: boolean = false;

  private position: vec2 | null = null;
  private force: vec2 | null = null;

  constructor() {}

  public step(deltaTime: number, state: State): void {
    if (this.shouldCreate) {
      // TODO add source to State using compute shader
      console.log(`Adding source at ${this.position} with force ${this.force}`);
    }
  }

  public release(): void {}

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
