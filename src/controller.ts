declare global {
  interface DocumentEventMap {
    toggleDimension: CustomEvent<void>;
  }
}

interface View {
  setDimension(dimensions: 2 | 3): void;
}

interface NeptuneComponent {
  initialize(): Promise<void>;
  setDimension(dimensions: 2 | 3): Promise<void>;
}

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

  constructor(view: View, neptune: NeptuneComponent) {
    this.neptune = neptune;
    this.view = view;
  }

  /**
   * Setup event listeners
   */
  public async connect(): Promise<void> {
    await this.neptune.initialize();
    await this.neptune.setDimension(this.dimension);
    this.view.setDimension(this.dimension);

    this.controller = new AbortController();
    const options = { signal: this.controller.signal };

    document.addEventListener(
      "toggleDimension",
      this.handleToggleDimension.bind(this),
      options
    );
  }

  /**
   * Release event listeners
   */
  public release(): void {
    this.controller?.abort();
    this.controller = null;
  }

  /**
   * Handle a toggle dimension event from the view
   */
  private handleToggleDimension(): void {
    this.dimension = this.dimension === 2 ? 3 : 2;

    this.neptune.setDimension(this.dimension).then(() => {
      this.view.setDimension(this.dimension);
    });
  }
}
