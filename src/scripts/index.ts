import { FlowerCanvas } from "./webgl/FlowerCanvas";

const canvas = new FlowerCanvas("#canvas");

// [ ]: evaluate what this dispose function is meant to do

window.addEventListener("beforeunload", () => {
  canvas.dispose?.();
});
