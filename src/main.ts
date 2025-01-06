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

import { NeptuneComponent } from "./neptune/neptune";
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

  const neptuneOptions = {
    displayWidth: window.innerWidth,
    displayHeight: window.innerHeight,
    dimensions: 2,
    resolution: [window.innerWidth, window.innerHeight],
    cellSize: 1,
  };

  const neptune = new NeptuneComponent(neptuneOptions);
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
    neptune.setDisplaySize(window.innerWidth, window.innerHeight);
  }
}

/**
 * Run main function after DOM fully loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  main();
});
