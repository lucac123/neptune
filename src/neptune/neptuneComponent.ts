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
import { State2D } from "./state2D";
import { SubstanceCreator2D } from "./substanceCreator2D";

/**
 * Object encapsulating all initialization options for the neptune simulation system.
 */
type NeptuneOptions = {
  displaySize: vec2;
  resolution2d?: vec2; // defaults to displaySize
  resolution3d: vec3;
  cellSize: number;
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

  private options: NeptuneOptions;
  private dimensions: 2 | 3 | null = null;

  // Indicates that initialization is complete and system is ready to render.
  private ready: boolean = false;

  private canvas: HTMLCanvasElement;
  private device: GPUDevice | null = null;
  private canvasView: GPUTextureView | null = null;

  // Used to calculate deltaTime
  private lastTime: DOMHighResTimeStamp | null = null;

  // Neptune system
  private neptune: Neptune | null = null;

  /**
   * Constructs a new NeptuneComponent instance.
   *
   * @param options a NeptuneOptions object containing information
   * for initializing simulation environment.
   */
  constructor(options: NeptuneOptions) {
    super();

    this.options = options;

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
        this.neptune?.step(deltaTime);
        if (!this.canvasView) {
          throw new Error(
            "Error, view not defined even though ready flag is set"
          );
        }
        this.neptune?.render(this.canvasView);
      }
    }
    this.lastTime = timestamp;
    window.requestAnimationFrame(this.mainLoop.bind(this));
  }

  /**
   * Initialize the GPU system and the canvas context.
   */
  public async initialize(): Promise<void> {
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

    const context = this.canvas.getContext("webgpu");
    if (!context) {
      throw new Error("Failed to get webgpu context from canvas element");
    }

    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
      device: this.device,
      format: canvasFormat,
    });

    this.canvas.width = this.options.displaySize[0];
    this.canvas.height = this.options.displaySize[1];

    this.canvasView = context.getCurrentTexture().createView();
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

  private async createNeptuneSystem(): Promise<Neptune> {
    if (!this.dimensions) {
      throw new Error(
        "NeptuneComponent dimensions must be set before a call to initializeSystem"
      );
    }
    if (this.dimensions == 2) {
      // Create 2d neptune system
      const camera = new Camera2D();
      const state = new State2D();
      const substanceLayer = new SubstanceCreator2D();
      const inputLayer = new InputProcessor2D(substanceLayer, camera);
      const simulationLayer = new Simulator2D();
      const meshLayer = new Mesh2D();
      const renderLayer = new Renderer2D();

      return new Neptune(
        inputLayer,
        substanceLayer,
        simulationLayer,
        meshLayer,
        renderLayer,
        camera,
        state
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
