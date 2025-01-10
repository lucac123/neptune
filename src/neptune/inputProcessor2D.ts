/**
 * inputProcessor2D.ts
 *
 * Defines a 2D user input processor
 */

interface Camera {
  screenToWorldSpace(screenPosition: vec2): vec2;
}
interface SubstanceCreator2D {
  setInput(shouldCreate: boolean): void;
  setPosition(position: vec2): void;
  setForceOffset(force: vec2): void;
}

type vec2 = [number, number];

/**
 * Process user input for 2D scene, influencing field through
 * SubstanceCreator
 *
 * Maintains mouse position, uses it to influence force added to field.
 */
export class InputProcessor2D {
  private mousePosition: vec2 | null = null;

  private substanceCreator: SubstanceCreator2D;
  private camera: Camera;

  constructor(substanceCreator: SubstanceCreator2D, camera: Camera) {
    this.substanceCreator = substanceCreator;
    this.camera = camera;
  }

  /**
   * Set the mouse click status
   * @param clickStatus whether the mouse is down or up
   */
  public setClick(clickStatus: boolean) {
    this.substanceCreator.setInput(clickStatus);
  }

  /**
   * Set the input position
   * @param u horizontal screen space corodinate
   * @param v vertical screen space coordinate
   */
  public setPosition(u: number, v: number) {
    const newMousePosition: vec2 = [u, v];
    const worldPosition = this.camera.screenToWorldSpace(newMousePosition);
    this.substanceCreator.setPosition(worldPosition);

    // If mouse has moved, set the force offset to be applied based on mouse movement
    if (this.mousePosition) {
      const mouseOffset: vec2 = [
        newMousePosition[0] - this.mousePosition[0],
        newMousePosition[1] - this.mousePosition[1],
      ];
      this.substanceCreator.setForceOffset(mouseOffset);
    }

    this.mousePosition = newMousePosition;
  }

  // /**
  //  ** EMPTY FUNCTIONS TO SATISFY INTERFACES
  //  */
  // public setModifier(modifier: boolean) {}
  // public release(): void {}
}
