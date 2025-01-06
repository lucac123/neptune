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
  dimensions: dimension;
  resolution: resolution;
};

/**
 * Valid simulation dimensions
 */
type dimension = 2 | 3;
type resolution = [number, number] | [number, number, number];

/**
 * A web component that simulates an interactible fluid simulation and renders
 *  in real time.
 * Provides a public-facing interface for setting simulation parameters
 *
 * Encapsulates all WebGPU API activity, handles user interactive input, simulation
 *  and animation frame request, and renders result to a canvas element.
 */
export class NeptuneComponent extends HTMLElement {
  // All html content is contained in this shadow root
  private shadow: ShadowRoot;

  private controller: AbortController | null = null;

  /**
   * Constructs a new NeptuneComponent instance.
   *
   * @param options a NeptuneOptions object containing information
   * for initializing simulation environment.
   */
  constructor(options: NeptuneOptions) {
    super();

    this.shadow = this.attachShadow({ mode: "open" });

    const canvas = new HTMLCanvasElement();
    canvas.width = options.displayWidth;
    canvas.height = options.displayHeight;

    this.shadow.append(canvas);
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
  public setDimension(dimension: dimension): void {}

  /**
   * Set the resolution of the simulation environment.
   *
   * @param resolution the desired simulation resolution.
   * @throws an error if resolution.length != dimension
   */
  public setResolution(resolution: resolution): void {}
}
