/**
 * neptune.ts
 *
 * Defines neptune web component.
 */

/**
 * Object encapsulating all initialization options for the neptune simulation system.
 */
type NeptuneOptions = {
  displayWidth: number;
  displayHeight: number;
  dimensions: number;
  resolution: number[];
  cellSize: number;
};

/**
 * A web component that simulates an interactible fluid simulation and renders
 *  in real time.
 * Provides a public-facing interface for setting simulation parameters
 *
 * Encapsulates all WebGPU API activity, handles user interactive input, simulation
 *  and animation frame request, and renders result to a canvas element.
 *
 * The neptune system consists of four layers, each of which it creates and applies:
 *
 * * input layer
 *      the input layer recieves user interaction events (i.e. mouse down, mouse up, and mouse move), and
 *  corresponding coordinates. It is then responsible for converting those screen space mouse coordinates
 *  into world space coordinates
 */
export class NeptuneComponent extends HTMLElement {
  // All html content is contained in this shadow root
  private shadow: ShadowRoot;

  private controller: AbortController | null = null;

  private canvas: HTMLCanvasElement;

  /**
   * Constructs a new NeptuneComponent instance.
   *
   * @param options a NeptuneOptions object containing information
   * for initializing simulation environment.
   */
  constructor(options: NeptuneOptions) {
    super();

    this.shadow = this.attachShadow({ mode: "open" });

    this.canvas = document.createElement("canvas");

    this.setDisplaySize(options.displayWidth, options.displayHeight);

    this.shadow.append(this.canvas);
  }

  /**
   * Once connected to the DOM, attach necessary event listeners.
   */
  connectedCallback(): void {
    this.controller = new AbortController();
    const options = { signal: this.controller.signal };
  }

  /**
   * Clean up event listeners when disconnected from DOM.
   */
  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = null;
  }

  /**
   * Set the dimensionality of the simulation environment.
   * Must either be 2 or 3.
   *
   * @param dimension number of desired simulation dimensions
   */
  public setDimension(dimension: number): void {
    console.log(`Setting neptune dimensions to ${dimension}`);
  }

  /**
   * Set the size of the canvas element.
   *
   * @param width The desired width
   * @param height The desired height
   */
  public setDisplaySize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  /**
   * Set the resolution of the simulation environment.
   *
   * @param resolution the desired simulation resolution.
   * @throws an error if resolution.length != dimension
   */
  public setResolution(resolution: number[]): void {}
}
