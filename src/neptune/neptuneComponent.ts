/**
 * neptune.ts
 *
 * Defines neptune web component.
 */

import { InputProcessor } from "./inputProcessor";
import { Simulator } from "./simulator";
import { SubstanceCreator } from "./substanceCreator";
import { Renderer } from "./renderer";
import { SimulationState } from "./simulationState";
import { Camera } from "./camera";

/**
 * Object encapsulating all initialization options for the neptune simulation system.
 */
type NeptuneOptions = {
  displaySize: vec2;
  dimensions: number;
  resolution2d: vec2;
  resolution3d: vec3;
  cellSize: number;
};

export type vec2 = [number, number];
export type vec3 = [number, number, number];

type ResourceLoader = (resourceName: string) => Promise<string>;

/**
 * A web component that simulates an interactible fluid simulation and renders
 *  in real time.
 * Provides a public-facing interface for setting simulation parameters
 *
 * Encapsulates all WebGPU API activity, handles user interactive input, simulation
 *  and animation frame request, and renders result to a canvas element.
 *
 * Constructs two NeptuneController objects, one for 2d and one for 3d simulation
 */
export class NeptuneComponent extends HTMLElement {
  // All html content is contained in this shadow root
  private shadow: ShadowRoot;

  private controller: AbortController | null = null;

  // Indicates that initialization is complete and system is ready to render.
  private ready: boolean = false;

  private canvas: HTMLCanvasElement;

  // System layers
  private inputLayer: InputProcessor | null = null;
  private substanceLayer: SubstanceCreator | null = null;
  private simulationLayer: Simulator | null = null;
  private renderLayer: Renderer | null = null;

  // System variables
  private dimensions: number | null = null;

  private device: GPUDevice | null = null;
  private context: GPUCanvasContext | null = null;

  // Will point to whichever camera is currently in use
  private camera: Camera | null = null;
  // Will always hold the 2-dimensional camera
  private camera2d: Camera | null = null;
  // Will always hold the 3-dimensional camera
  private camera3d: Camera | null = null;

  // Will hold the resolution corresponding with the current number of dimensions
  private resolution: vec2 | vec3 | null = null;

  // Will always hold the 2-dimensional simulation resolution
  private resolution2d: vec2 | null = null;
  // Will always hold the 3-dimensional simulation resolution
  private resolution3d: vec3 | null = null;

  // Will hold the state corresponding with the current number of dimensions
  private state: SimulationState | null = null;

  // Will always hold the 2-dimensional simulation state, even if not currently rendering
  private state2d: SimulationState | null = null;
  // Will always hold the 3-dimensional simulation state, even if not currently rendering
  private state3d: SimulationState | null = null;

  /**
   * Constructs a new NeptuneComponent instance.
   *
   * @param options a NeptuneOptions object containing information
   * for initializing simulation environment.
   */
  constructor(options: NeptuneOptions, loadResource: ResourceLoader) {
    super();
    this.loadResource = loadResource;

    this.shadow = this.attachShadow({ mode: "open" });
    this.canvas = document.createElement("canvas");
    this.shadow.append(this.canvas);

    this.initializeSystem(options);
  }

  /**
   * Once connected to the DOM, attach necessary event listeners.
   */
  connectedCallback(): void {
    this.controller = new AbortController();
    const options = { signal: this.controller.signal };

    // Add input event listeners
    this.canvas.addEventListener(
      "mousedown",
      this.handleMouseDown.bind(this),
      options
    );
    this.canvas.addEventListener(
      "mouseup",
      this.handleMouseUp.bind(this),
      options
    );
    this.canvas.addEventListener(
      "mousemove",
      this.handleMouseMove.bind(this),
      options
    );

    // Request animation frame for main loop
    window.requestAnimationFrame(this.mainLoop.bind(this));
  }

  /**
   * Clean up event listeners when disconnected from DOM.
   */
  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = null;
  }

  /**
   * Handle computation for each timestep
   */
  public mainLoop(): void {
    if (this.ready) {
      if (!this.dimensions) {
        throw new Error("Error, dimensions not set");
      }
      if (!this.state) {
        throw new Error("Error, no simulation state initialized");
      }
      if (!this.substanceLayer) {
        throw new Error("Error, substance layer not initialized");
      }
      if (!this.inputLayer) {
        throw new Error("Error, input layer not initialized");
      }
      if (!this.camera) {
        throw new Error("Error, camera not initialized");
      }
      if (!this.simulationLayer) {
        throw new Error("Error, simulation layer not initialized");
      }
      if (!this.renderLayer) {
        throw new Error("Error, render layer not initialized");
      }

      this.inputLayer.step(
        this.dimensions,
        this.state,
        this.substanceLayer,
        this.camera
      );
      this.simulationLayer.step(this.dimensions, this.state);

      if (!this.context) {
        throw new Error("Unable to get current context, cannot render");
      }
      this.renderLayer.render(
        this.context.getCurrentTexture().createView(),
        this.dimensions,
        this.state,
        this.camera
      );
    }

    window.requestAnimationFrame(this.mainLoop.bind(this));
  }

  /**
   * Set the dimensionality of the simulation environment.
   * Must either be 2 or 3.
   *
   * @param dimension number of desired simulation dimensions
   */
  public setDimension(dimensions: number): void {
    this.dimensions = dimensions;

    if (dimensions === 2) {
      this.resolution = this.resolution2d;
      this.state = this.state2d;
      this.camera = this.camera2d;
    } else if (dimensions === 3) {
      this.resolution = this.resolution3d;
      this.state = this.state3d;
      this.camera = this.camera3d;
    }
  }

  /**
   * Change the size of the canvas element.
   *
   * @param displaySize the desired display size
   */
  public resize(displaySize: vec2): void {
    const deltaW = displaySize[0] / this.canvas.width;
    const deltaH = displaySize[1] / this.canvas.height;

    if (!this.resolution2d || !this.resolution) {
      throw new Error("Attempted to resize display before resolution set");
    }
    if (!this.state2d) {
      throw new Error(
        "Attempted to resize simulation resolution before state initialized"
      );
    }

    const newResolution: vec2 = this.resolution2d;

    newResolution[0] = Math.ceil(deltaW * this.resolution[0]);
    newResolution[1] = Math.ceil(deltaH * this.resolution[1]);

    this.state2d.resize(newResolution);

    this.setDisplaySize(displaySize);
  }

  private async initializeSystem(options: NeptuneOptions): Promise<void> {
    if (!navigator.gpu) {
      throw new Error("WebGPU Not supported in this browser");
    }
    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: "high-performance",
    });
    if (!adapter) {
      throw new Error("No appropriate GPUAdapter found.");
    }
    this.device = await adapter.requestDevice();
    if (!this.device) {
      throw new Error("No appropriate GPUDevice foujnd.");
    }

    this.context = this.canvas.getContext("webgpu");
    if (!this.context) {
      throw new Error("Failed to get webgpu context from canvas element");
    }

    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    this.context?.configure({
      device: this.device,
      format: canvasFormat,
    });

    this.dimensions = options.dimensions;

    this.resolution2d = options.resolution2d;
    this.resolution3d = options.resolution3d;
    this.resolution = this.resolution2d;

    this.state2d = new SimulationState(this.resolution2d, this.device);
    this.state3d = new SimulationState(this.resolution3d, this.device);
    this.state = this.state2d;

    this.camera2d = new Camera();
    this.camera3d = new Camera();
    this.camera = this.camera2d;

    this.inputLayer = new InputProcessor();
    this.substanceLayer = new SubstanceCreator();
    this.simulationLayer = new Simulator();
    this.renderLayer = new Renderer(this.device, canvasFormat);

    this.setDisplaySize(options.displaySize);

    this.ready = true;
  }

  /**
   * Set the display size.
   *
   * @param displaySize display size desired
   */
  private setDisplaySize(displaySize: vec2): void {
    this.canvas.width = displaySize[0];
    this.canvas.height = displaySize[1];

    if (!this.resolution2d || !this.resolution) {
      throw new Error("Attempted to resize display before resolution set");
    }
    if (!this.state2d) {
      throw new Error(
        "Attempted to resize simulation resolution before state initialized"
      );
    }

    const canvasAspect = this.canvas.width / this.canvas.height;
    const simAspect = this.resolution2d[0] / this.resolution2d[1];

    const newResolution: vec2 = this.resolution2d ?? [0, 0];

    if (simAspect < canvasAspect) {
      newResolution[1] = Math.ceil(newResolution[0] / canvasAspect);
    } else if (simAspect > canvasAspect) {
      newResolution[0] = Math.ceil(newResolution[1] * canvasAspect);
    }
    this.state2d.resize(newResolution);
  }

  /**
   * Handle a mouse click event on the canvas element.
   *
   * @param event mouse down event
   */
  private handleMouseDown(event: MouseEvent): void {
    this.inputLayer?.setMouseDown();

    this.inputLayer?.setModifier(event.altKey);
  }

  /**
   * Handle a mouse unclick event on the canvas element.
   *
   * @param event mouse up event
   */
  private handleMouseUp(event: MouseEvent): void {
    this.inputLayer?.setMouseUp();

    this.inputLayer?.setModifier(event.altKey);
  }

  /**
   * Handle a mouse move event on the canvas element.
   *
   * @param event mouse move event
   */
  private handleMouseMove(event: MouseEvent): void {
    const canvasRect = this.canvas.getBoundingClientRect();

    this.inputLayer?.setMousePosition(
      event.clientX - canvasRect.left,
      event.clientY - canvasRect.top
    );

    this.inputLayer?.setModifier(event.altKey);
  }
}
