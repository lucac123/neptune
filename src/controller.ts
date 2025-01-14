declare global {
  interface DocumentEventMap {
    toggleDimension: CustomEvent<void>;
  }
}

interface View {
  setDimension(dimensions: 2 | 3): void;
  setFrameRate(frameRate: number): void;
}

interface NeptuneComponent {
  initialize(options: NeptuneOptions): Promise<void>;
  setDimension(dimensions: 2 | 3): Promise<void>;

  getFrameRate(): number;
}

/**
 * Object encapsulating all initialization options for the neptune simulation system.
 */
type NeptuneOptions = {
  displaySize: vec2;
  resolution2d?: vec2; // defaults to displaySize
  resolution3d: vec3;
};

export type vec2 = [number, number];
export type vec3 = [number, number, number];

/**
 * Interfaces between view (View) and model (NeptuneComponent)
 */
export class Controller {
  private controller: AbortController | null = null;
  private dimension: 2 | 3 = 2;
  private neptune: NeptuneComponent;
  private view: View;

  private frameRateIntervalId: number | null = null;
  private frameRateInterval: number = 500;

  constructor(view: View, neptune: NeptuneComponent) {
    this.neptune = neptune;
    this.view = view;
  }

  /**
   * Setup event listeners
   */
  public async connect(neptuneOptions: NeptuneOptions): Promise<void> {
    await this.neptune.initialize(neptuneOptions);
    await this.neptune.setDimension(this.dimension);
    this.view.setDimension(this.dimension);

    this.controller = new AbortController();
    const options = { signal: this.controller.signal };

    document.addEventListener(
      "toggleDimension",
      this.handleToggleDimension.bind(this),
      options
    );

    this.frameRateIntervalId = setInterval(
      this.updateFrameRate.bind(this),
      this.frameRateInterval
    );
  }

  /**
   * Release event listeners
   */
  public release(): void {
    this.controller?.abort();
    this.controller = null;

    if (this.frameRateIntervalId) {
      clearInterval(this.frameRateIntervalId);
      this.frameRateIntervalId = null;
    }
  }

  /**
   * Handle a toggle dimension event from the view
   */
  private handleToggleDimension(): void {
    this.dimension = this.dimension === 2 ? 3 : 2;

    this.neptune
      .setDimension(this.dimension)
      .then(() => {
        this.view.setDimension(this.dimension);
      })
      .catch((error: Error) => {
        console.error(error.message);
      });
  }

  private updateFrameRate(): void {
    this.view.setFrameRate(this.neptune.getFrameRate());
  }
}
