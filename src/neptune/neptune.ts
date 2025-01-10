/**
 * neptune.ts
 *
 * Defines the neptune simulation/visualization system.
 */

/**
 * Interface for a general user input processor
 */
interface InputProcessor {
  setClick(clickStatus: boolean): void;
  setPosition(u: number, v: number): void;
  setModifier?(modifierStatus: boolean): void;

  release?(): void;
}

/**
 * Interface for a general simulation substance creator
 */
interface SubstanceCreator {
  step(
    deltaTime: number,
    substanceField: FieldManager,
    velocityField: FieldManager
  ): void;

  release?(): void;
}

/**
 * Interface for a general simulation engine
 */
interface Simulator {
  step(
    deltaTime: number,
    substanceField: FieldManager,
    velocityField: FieldManager
  ): void;

  release?(): void;
}

/**
 * Interface for a general renderable mesh
 */
interface Mesh {
  getVertexBuffer(): GPUBuffer;
  getVertexCount(): number;

  release?(): void;
}

/**
 * Interface for a general renderer
 */
interface Renderer {
  render(
    view: GPUTextureView,
    mesh: Mesh,
    fieldManager: FieldManager,
    camera: Camera
  ): void;

  release?(): void;
}

/**
 * Interfaces for a general FieldManager and Camera object
 */
interface FieldManager {
  getRenderBindGroup(): GPUBindGroup;
  getComputeBindGroup(): GPUBindGroup;
  getResolution(): vec2;
  swap(): void;
  release?(): void;
}
interface Camera {
  screenToWorldSpace(position: vec2): vec2;
  getBindGroup(): GPUBindGroup;
  release?(): void;
}

type vec2 = [number, number];

export class Neptune {
  private inputLayer: InputProcessor;
  private substanceLayer: SubstanceCreator;
  private simulationLayer: Simulator;
  private meshLayer: Mesh;
  private renderLayer: Renderer;

  private camera: Camera;
  private substanceField: FieldManager;
  private velocityField: FieldManager;

  /**
   * Construct a new NeptuneController given concrete implementations of each
   * abstract layer.
   *
   * @param inputLayer
   * @param substanceLayer
   * @param simulationLayer
   * @param meshLayer
   * @param renderLayer
   * @param camera
   * @param substanceFieldManager
   * @param velocityFieldManager
   */
  constructor(
    inputLayer: InputProcessor,
    substanceLayer: SubstanceCreator,
    simulationLayer: Simulator,
    meshLayer: Mesh,
    renderLayer: Renderer,
    camera: Camera,
    substanceFieldManager: FieldManager,
    velocityFieldManager: FieldManager
  ) {
    this.inputLayer = inputLayer;
    this.substanceLayer = substanceLayer;
    this.simulationLayer = simulationLayer;
    this.meshLayer = meshLayer;
    this.renderLayer = renderLayer;

    this.camera = camera;
    this.substanceField = substanceFieldManager;
    this.velocityField = velocityFieldManager;
  }

  /**
   * Compute a single time step
   * @param deltaTime
   */
  public step(deltaTime: number) {
    this.substanceLayer.step(
      deltaTime,
      this.substanceField,
      this.velocityField
    );
    this.simulationLayer.step(
      deltaTime,
      this.substanceField,
      this.velocityField
    );
  }

  /**
   * Render the current field to the given texture view
   * @param view
   */
  public render(view: GPUTextureView) {
    this.renderLayer.render(
      view,
      this.meshLayer,
      this.substanceField,
      this.camera
    );
  }

  /**
   * Handle a user mouse down
   * @param modifier
   */
  public mouseDown(modifier: boolean): void {
    this.inputLayer.setClick(true);
    this.inputLayer.setModifier?.(modifier);
  }

  /**
   * Handle a user mouse up
   * @param modifier
   */
  public mouseUp(modifier: boolean): void {
    this.inputLayer.setClick(false);
    this.inputLayer.setModifier?.(modifier);
  }

  /**
   * Handle a user mouse move
   * @param mouseU screen space coords 0 = left, 1 = right
   * @param mouseV screen space coords 0 = top, 1 = bottom
   * @param modifier
   */
  public mouseMove(mouseU: number, mouseV: number, modifier: boolean): void {
    this.inputLayer.setPosition(mouseU, mouseV);
    this.inputLayer.setModifier?.(modifier);
  }

  /**
   * Release all resources associated with the system
   */
  public release(): void {
    this.inputLayer.release?.();
    this.substanceLayer.release?.();
    this.simulationLayer.release?.();
    this.meshLayer.release?.();
    this.renderLayer.release?.();

    this.substanceField.release?.();
    this.camera.release?.();
  }
}

/**
 * The neptune system consists of four layers, each of which it creates and applies:
 *
 * * input layer
 *      the input layer recieves user interaction events (i.e. mouse down, mouse up, and mouse move), and
 *  corresponding coordinates. It is then responsible for converting those normalized screen space mouse
 *  coordinates into world space coordinates, and delegating to substance layer for creating simulation
 *  input, or moving the camera as needed
 *
 * * substance layer
 *      the substance layer recieves input commands from the input layer with corresponding world space
 *  coordinates. It is then responsible for adding substance to the simulation plane/volume and/or adding
 *  a force to the simulation plane/volume, modifying the current simulation field
 *
 * * simulation layer
 *      the simulation layer is in charge of handling a single simulation timestep, beginning with current
 *  simulation field and applying sequential (1) advection, (2) diffusion, and (3) projection steps to the
 *  current simulation field
 *
 * * mesh layer
 *      this provides an actual mesh with either a surface texture or volume texture to
 *  be rendered with the renderer
 *
 * * render layer
 *      the render layer is in charge of rendering the current simulation field. Depending on the number
 *  of dimensions of the current simulation, this could mean simply rendering to an appropriately sized
 *  plane, or it could mean using a ray-marched volume renderer to visualize a 3D simulation
 */
