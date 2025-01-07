interface State {}
interface SubstanceCreator {}
interface Camera {}

export class InputProcessor {
  constructor() {}

  public step(
    dimensions: number,
    state: State,
    substanceCreator: SubstanceCreator,
    camera: Camera
  ) {}

  public setMouseDown() {}
  public setMouseUp() {}
  public setMousePosition(x: number, y: number) {}
  public setModifier(modifier: boolean) {}
}
