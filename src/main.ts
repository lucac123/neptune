/**
 * main.ts
 *
 * Controller for application.
 *
 * Initializes view and handles view-created events
 *
 * Implements controller part of MVC architecture--though for this application the
 *  benefits of this design pattern are slim, it could be extended in the future to
 *  an application that fully leverages this pattern.
 */

import { NeptuneComponent, vec2, vec3 } from "./neptune/neptune";
import { initView } from "./view";

declare global {
  interface DocumentEventMap {
    toggleDimension: CustomEvent<void>;
  }
}

/**
 * Program entry point
 */
function main(): void {
  customElements.define("neptune-component", NeptuneComponent);

  let dimensions = 2;

  const displaySize: vec2 = [window.innerWidth, window.innerHeight];

  const resolution2d: vec2 = [
    Math.ceil(displaySize[0]) / 100,
    Math.ceil(displaySize[1]) / 100,
  ];
  const resolution3d: vec3 = [256, 256, 256];

  const neptuneOptions = {
    displaySize: displaySize,
    dimensions: 2,
    resolution2d: resolution2d,
    resolution3d: resolution3d,
    cellSize: 1,
  };

  const neptune = new NeptuneComponent(neptuneOptions, loadResource);
  const view = initView(neptune);

  document.addEventListener("toggleDimension", handleToggleDimension);
  window.addEventListener("resize", handleWindowResize);

  /**
   * Handle a toggleDimension event from the view.
   * Should toggle between 2 and 3 dimensions
   */
  function handleToggleDimension(): void {
    dimensions = dimensions === 2 ? 3 : 2;
    neptune.setDimension(dimensions);
    view.toggleDimension();
  }

  /**
   * Handle browser resize, updating simulation environment as needed
   */
  function handleWindowResize(): void {
    neptune.resize([window.innerWidth, window.innerHeight]);
  }
}

/**
 * Load code from external file
 */
async function loadResource(resourceName: string): Promise<string> {
  try {
    const response = await fetch(`${resourceName}`);
    return await response.text();
  } catch {
    throw new Error(`Failed to load shader ${resourceName}`);
  }
}

/**
 * Run main function after DOM fully loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  main();
});
