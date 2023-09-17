import * as THREE from "three";

import vertexShader from "./shader/flowerVertexShader.glsl";
import fragmentShader from "./shader/flowerFragmentShader.glsl";
import { qs } from "../utils";

type CanvasRef = `#${string}`;

// [ ]: fix how this script is run..
// [ ]: properly sort out the types here
// [ ]: do proper types for the 'handleClick' event
// [ ]: refactor the functions so the role of execution is more obvious
// [ ]: see if there is anything generic I can extract into the abstract class

const createCamera = (): THREE.OrthographicCamera => {
  //? do I want to use a perspective cam?
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  return camera;
};

const createRenderer = (
  canvasRef: CanvasRef,
  device: any
): THREE.WebGLRenderer => {
  const canvasElement = qs<HTMLCanvasElement>(canvasRef);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvasElement,
    alpha: true,
  });

  renderer.setSize(device.width, device.height);

  renderer.setPixelRatio(Math.min(device.pixelRatio, 2));

  return renderer;
};

export class FlowerCanvas {
  private pointer = {
    x: 0.65,
    y: 0.3,
    clicked: true,
  };

  //! I don't really like how this is declared
  private device = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: window.devicePixelRatio,
  };

  private clock = new THREE.Clock();

  private renderer: THREE.WebGLRenderer;

  private camera: THREE.OrthographicCamera = createCamera();

  public mainScene = new THREE.Scene();
  public shaderScene = new THREE.Scene();

  // [ ]: understand the relevance of a render target
  private renderTargets = [
    new THREE.WebGLRenderTarget(this.device.width, this.device.height),
    new THREE.WebGLRenderTarget(this.device.width, this.device.height),
  ];

  private shaderMaterial!: THREE.ShaderMaterial;

  private basicMaterial!: THREE.MeshBasicMaterial;

  constructor(canvasRef: CanvasRef) {
    this.renderer = createRenderer(canvasRef, this.device);

    this.init();

    this.createGeometry();

    this.render();
  }

  private init() {
    this.setUpHandleClick();

    this.setUpHandleResize();

    this.setUpCleanup();

    this.setUpRender();
  }

  private createGeometry() {
    const backgroundColor = new THREE.Color(0xffffff);

    const planeGeometry = new THREE.PlaneGeometry(2, 2);

    this.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_ratio: {
          type: "f",
          value: this.device.width / this.device.height,
        },
        u_point: {
          type: "v2",
          value: new THREE.Vector2(this.pointer.x, this.pointer.y),
        },
        u_time: { type: "f", value: 0 },
        u_stop_time: { type: "f", value: 0 },
        u_stop_randomizer: { type: "v3", value: new THREE.Vector2(0, 0, 0) },
        u_texture: { type: "t", value: null },
        u_background_color: { type: "v3", value: backgroundColor },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
    });

    this.basicMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
    });

    const backgroundColorMaterial = new THREE.MeshBasicMaterial({
      color: backgroundColor,
      transparent: true,
    });

    const planeBasic = new THREE.Mesh(planeGeometry, this.basicMaterial);
    const planeShader = new THREE.Mesh(planeGeometry, this.shaderMaterial);
    const coloredPlane = new THREE.Mesh(planeGeometry, backgroundColorMaterial);

    this.shaderScene.add(planeShader);
    this.mainScene.add(coloredPlane);

    // [ ]: try to understand what the render target is...
    this.renderer.setRenderTarget(this.renderTargets[0]);
    this.renderer.render(this.mainScene, this.camera);

    this.mainScene.remove(coloredPlane);
    this.mainScene.add(planeBasic);
  }

  private render() {
    const delta = this.clock.getDelta();

    this.shaderMaterial.uniforms.u_texture.value =
      this.renderTargets[0].texture;

    this.shaderMaterial.uniforms.u_time.value =
      this.clock.getElapsedTime() + 0.9; // offset for 1st flower color

    if (this.pointer.clicked) {
      this.shaderMaterial.uniforms.u_point.value = new THREE.Vector2(
        this.pointer.x,
        1 - this.pointer.y
      );

      this.shaderMaterial.uniforms.u_stop_randomizer.value = new THREE.Vector3(
        Math.random(),
        Math.random(),
        Math.random()
      );

      this.shaderMaterial.uniforms.u_stop_time.value = 0;
      this.pointer.clicked = false;
    }

    this.shaderMaterial.uniforms.u_stop_time.value += delta;

    this.renderer.setRenderTarget(this.renderTargets[1]);
    this.renderer.render(this.shaderScene, this.camera);

    this.basicMaterial.map = this.renderTargets[1].texture;

    this.renderer.setRenderTarget(null);
    this.renderer.render(this.mainScene, this.camera);

    let tmp = this.renderTargets[0];
    this.renderTargets[0] = this.renderTargets[1];
    this.renderTargets[1] = tmp;

    requestAnimationFrame(this.render);
  }

  private setUpHandleClick() {
    window.addEventListener("click", this.handleClick.bind(this));
  }

  private setUpHandleResize() {
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  private setUpRender() {
    this.render = this.render.bind(this);
  }

  private setUpCleanup() {
    window.addEventListener("beforeunload", () => {
      this.renderer.setAnimationLoop(null);
      this.mainScene.clear();
      this.shaderScene.clear();
    });
  }

  private handleResize() {
    const { innerWidth, innerHeight } = window;

    this.device.width = innerWidth;
    this.device.height = innerHeight;

    this.renderer.setSize(this.device.width, this.device.height);

    this.shaderMaterial.uniforms.u_ratio.value =
      this.device.width / this.device.height;
  }

  private handleClick(e: MouseEvent | TouchEvent) {
    let clientX, clientY;

    if (e.type === "click") {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.type === "touchstart") {
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    }

    this.pointer.x = clientX / this.device.width;
    this.pointer.y = clientY / this.device.height;

    this.pointer.clicked = true;
  }
}
