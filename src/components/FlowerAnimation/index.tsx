import { useEffect, useRef } from "react";
import { FlowerCanvas } from "../../scripts/webgl/FlowerCanvas";

// [ ]: clean up the webgl folder
// [ ]: remove the astro boilerplate
// [ ]: understand why I don't have to import react
// [ ]: get a gauge of how astro makes use of CSS vars
// [ ]: make note of this max-w-[60ch]

const FlowerAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef != null) {
      new FlowerCanvas("#canvas");
    }
  }, []);

  return (
    <div className="fixed w-full h-full">
      <canvas id="canvas" ref={canvasRef} />;
    </div>
  );
};

export default FlowerAnimation;
