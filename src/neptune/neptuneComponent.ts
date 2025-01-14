/**
 * neptune.ts
 *
 * Defines neptune web component.
 */

import { Camera2D } from "./camera2D";
import { InputProcessor2D } from "./inputProcessor2D";
import { Mesh2D } from "./mesh2D";
import { Neptune } from "./neptune";
import { Renderer2D } from "./renderer2D";
import { Simulator2D } from "./simulator2D";
import { FieldManager2D as FieldManager2D } from "./fieldManager2D";
import { SubstanceCreator2D } from "./substanceCreator2D";

/**
 * Object encapsulating all initialization options for the neptune simulation system.
 */
type NeptuneOptions = {
  displaySize: vec2;
  resolution2d?: vec2; // defaults to displaySize
  resolution3d: vec3;
};

type vec2 = [number, number];
type vec3 = [number, number, number];

/**
 * A web component that simulates an interactible fluid simulation and renders
 *  in real time.
 * Provides a public-facing interface for setting simulation parameters
 *
 * Encapsulates all WebGPU API activity, handles user interactive input, simulation
 *  and animation frame request, and renders result to a canvas element.
 *
 * Constructs two NeptuneController objects, one for 2d and one for 3d simulation
 *
 * Must call initialize, then setDimension before able to render
 */
export class NeptuneComponent extends HTMLElement {
  // All html content is contained in this shadow root
  private shadow: ShadowRoot;

  private controller: AbortController | null = null;

  private options: NeptuneOptions | null = null;
  private dimensions: 2 | 3 | null = null;

  // Indicates that initialization is complete and system is ready to render.
  private ready: boolean = false;

  private canvas: HTMLCanvasElement;
  private device: GPUDevice | null = null;
  private canvasFormat: GPUTextureFormat | null = null;
  private context: GPUCanvasContext | null = null;

  // Used to calculate deltaTime
  private lastTime: DOMHighResTimeStamp | null = null;

  private frameRate: number = 0;

  // Neptune system
  private neptune: Neptune | null = null;

  /**
   * Constructs a new NeptuneComponent instance.
   *
   */
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: "open" });
    this.canvas = document.createElement("canvas");
    this.shadow.append(this.canvas);
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
      "mouseleave",
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
   * Render animation frame, running neptune system as needed
   */
  public mainLoop(timestamp: DOMHighResTimeStamp): void {
    if (this.lastTime) {
      // Not first frame, render if ready
      if (this.ready) {
        const deltaTime = timestamp - this.lastTime;
        this.frameRate = 1000 / deltaTime;
        this.neptune?.step(deltaTime);
        if (!this.context) {
          throw new Error(
            "Error, context not defined even though ready flag is set"
          );
        }
        this.neptune?.render(this.context.getCurrentTexture().createView());
      }
    }
    this.lastTime = timestamp;
    window.requestAnimationFrame(this.mainLoop.bind(this));
  }

  /**
   * Initialize the GPU system and the canvas context.
   */
  public async initialize(options: NeptuneOptions): Promise<void> {
    this.options = options;
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

    this.canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({
      device: this.device,
      format: this.canvasFormat,
    });

    this.canvas.width = this.options.displaySize[0];
    this.canvas.height = this.options.displaySize[1];
  }

  /**
   * Set the dimensionality of the simulation environment.
   * Must either be 2 or 3.
   *
   * @param dimension number of desired simulation dimensions
   */
  public async setDimension(dimensions: 2 | 3): Promise<void> {
    if (dimensions != this.dimensions) {
      // Avoid repeated computation on repeated calls
      this.ready = false;
      this.dimensions = dimensions;

      // Cleanup old neptune system
      this.neptune?.release();

      // Create new neptune system
      this.neptune = await this.createNeptuneSystem();

      this.ready = true;
    }
  }

  public getFrameRate(): number {
    return this.frameRate;
  }

  private async createNeptuneSystem(): Promise<Neptune> {
    if (
      !this.device ||
      !this.dimensions ||
      !this.canvasFormat ||
      !this.options
    ) {
      throw new Error("Cannot create neptune system before initialization");
    }
    if (this.dimensions == 2) {
      const aspect = this.options.displaySize[0] / this.options.displaySize[1];

      const size = 10;
      const planeHeight = size / aspect;
      const planeStart: vec2 = [-size / 2, -planeHeight / 2];
      const planeSize: vec2 = [size, planeHeight];

      const cameraStart: vec2 = planeStart;
      const cameraDiagonal: vec2 = planeSize;

      const fieldStart: vec2 = planeStart;
      const fieldSize: vec2 = planeSize;
      const fieldResolution: vec2 =
        this.options.resolution2d ?? this.options.displaySize;

      // Create 2d neptune system
      const camera = new Camera2D(this.device, cameraStart, cameraDiagonal);
      const substanceField = new FieldManager2D(
        this.device,
        fieldStart,
        fieldSize,
        fieldResolution
      );
      const velocityField = new FieldManager2D(
        this.device,
        fieldStart,
        fieldSize,
        fieldResolution
      );
      const substanceLayer = new SubstanceCreator2D(this.device);
      const inputLayer = new InputProcessor2D(substanceLayer, camera);
      const simulationLayer = new Simulator2D(
        this.device,
        fieldStart,
        fieldSize,
        fieldResolution,
        (device: GPUDevice, start: vec2, size: vec2, resolution: vec2) =>
          new FieldManager2D(device, start, size, resolution)
      );
      const meshLayer = new Mesh2D(this.device, planeStart, planeSize);
      const renderLayer = new Renderer2D(this.device, this.canvasFormat);

      return new Neptune(
        inputLayer,
        substanceLayer,
        simulationLayer,
        meshLayer,
        renderLayer,
        camera,
        substanceField,
        velocityField
      );
    } else {
      // Create 3d neptune system
      throw new Error("currently unable to create 3d system");
    }
  }

  /**
   * Handle a mouse click event on the canvas element.
   *
   * @param event mouse down event
   */
  private handleMouseDown(event: MouseEvent): void {
    this.neptune?.mouseDown(event.altKey);
  }

  /**
   * Handle a mouse unclick event on the canvas element.
   *
   * @param event mouse up event
   */
  private handleMouseUp(event: MouseEvent): void {
    this.neptune?.mouseUp(event.altKey);
  }

  /**
   * Handle a mouse move event on the canvas element.
   *
   * @param event mouse move event
   */
  private handleMouseMove(event: MouseEvent): void {
    const canvasRect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - canvasRect.left;
    const mouseY = event.clientY - canvasRect.top;

    this.neptune?.mouseMove(
      mouseX / this.canvas.width,
      mouseY / this.canvas.height,
      event.altKey
    );
  }
}
