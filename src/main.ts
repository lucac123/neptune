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

import { Controller, vec2, vec3 } from "./controller";
import { NeptuneComponent } from "./neptune/neptuneComponent";
import { initView } from "./view";

declare global {
  interface DocumentEventMap {
    toggleDimension: CustomEvent<void>;
  }
}

/**
 * Program entry point
 */
async function main(): Promise<void> {
  customElements.define("neptune-component", NeptuneComponent);

  const displaySize: vec2 = [window.innerWidth, window.innerHeight];
  // const resolution2d: vec2 = [
  //   Math.ceil(displaySize[0]) / 100,
  //   Math.ceil(displaySize[1]) / 100,
  // ];
  const resolution3d: vec3 = [256, 256, 256];

  const options = {
    displaySize: displaySize,
    // resolution2d: resolution2d,
    resolution3d: resolution3d,
    cellSize: 1,
  };

  const neptune = new NeptuneComponent(options);
  const view = initView(neptune);

  await neptune.initialize();

  const controller = new Controller(view, neptune);
  await controller.connect();
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
