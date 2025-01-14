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
  const resolution2d: vec2 = [
    Math.ceil(displaySize[0] / 1),
    Math.ceil(displaySize[1] / 1),
  ];
  const resolution3d: vec3 = [256, 256, 256];

  const options = {
    displaySize: displaySize,
    resolution2d: resolution2d,
    resolution3d: resolution3d,
  };

  const neptune = document.querySelector("neptune-component");
  if (!(neptune instanceof NeptuneComponent)) {
    throw new Error("Invalid neptune component");
  }
  const view = initView();

  const controller = new Controller(view, neptune);
  await controller.connect(options);
}

/**
 * Run main function after DOM fully loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  main();
});
