import { qs } from "./utils";
import { FlowerCanvas } from "./webgl/FlowerCanvas";

const canvas = new FlowerCanvas(qs<HTMLCanvasElement>("#canvas"));

window.addEventListener("beforeunload", () => {
  canvas.dispose?.();
});
