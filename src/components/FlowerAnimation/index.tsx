import { useEffect } from "react";
import { FlowerCanvas } from "../../scripts/webgl/FlowerCanvas";

// [ ]: clean up the webgl folder
// [ ]: remove the astro boilerplate
// [ ]: understand why I don't have to import react
// [ ]: get a gauge of how astro makes use of CSS vars
// [ ]: make note of this max-w-[60ch]

const FlowerAnimation = () => {
  useEffect(() => {
    new FlowerCanvas("#canvas");
  }, []);
};

export default FlowerAnimation;
