/**
 * view.ts
 *
 * View for the application
 */

/**
 * Factory to create and initialize the View.
 *
 * @param attachedComponent an arbitrary component to attach to view.
 */
export function initView(attachedComponent: HTMLElement): View {
  // Extract the relevant HTML elements from our web page and ensure they are present and of the correct types
  const dimensionToggleButton = document.querySelector(
    "button#dimension-toggle"
  );
  if (!(dimensionToggleButton instanceof HTMLButtonElement)) {
    throw new Error(
      "Failed to find dimension toggle button, cannot initialize the View"
    );
  }

  const componentContainer = document.querySelector("#component-container");
  if (!(componentContainer instanceof HTMLElement)) {
    throw new Error("Failed to find container for input web component");
  }

  componentContainer.append(attachedComponent);

  return new View(dimensionToggleButton);
}

/**
 * Dispatches events on user interaction.
 * Provides a public interface for modifying the DOM based on user events.
 *
 * Also provides an attachment point for an arbitrary web component, which
 * will sit in the DOM and may violate the MVC pattern
 * (used for the simulation render loop)
 */
class View {
  // Elements
  dimensionToggleButton: HTMLButtonElement;

  /**
   * Constructs a new View instance.
   *
   * @param button a button element to use for toggling dimensions
   */
  constructor(button: HTMLButtonElement) {
    this.dimensionToggleButton = button;

    this.dimensionToggleButton.addEventListener(
      "click",
      this.handleDimensionButtonClick.bind(this)
    );
  }

  /**
   * Switch dimension button icon with dataset alt
   */
  public toggleDimension(): void {
    const icon = this.dimensionToggleButton.querySelector(
      "#dimension-toggle-icon"
    );
    if (!(icon instanceof HTMLElement)) {
      throw new Error("Failed to get dimension icon");
    }

    icon.dataset;

    const alt = icon.dataset.alt ?? "";
    icon.dataset.alt = icon.getAttribute("icon") ?? "";
    icon.setAttribute("icon", alt);
  }

  private handleDimensionButtonClick(): void {
    const toggleDimensionEvent = new CustomEvent("toggleDimension");

    document.dispatchEvent(toggleDimensionEvent);
  }
}
