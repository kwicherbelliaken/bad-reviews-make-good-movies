import * as THREE from "three";

import vertexShader from "./shader/flowerVertexShader.glsl";
import fragmentShader from "./shader/flowerFragmentShader.glsl";

// [ ]: refactor the functions so the role of execution is more obvious
// [ ]: see if there is anything generic I can extract into the abstract class
// [ ]: properly sort out the types here

export class FlowerCanvas {
  private pointer = {
    x: 0.65,
    y: 0.3,
    clicked: true,
  };

  private renderer: THREE.WebGLRenderer;

  private camera: THREE.OrthographicCamera;

  private clock = new THREE.Clock();

  private shaderMaterial!: THREE.ShaderMaterial;

  private basicMaterial!: THREE.MeshBasicMaterial;

  private renderTargets: THREE.WebGLRenderTarget[];

  public mainScene: THREE.Scene;
  public shaderScene: THREE.Scene;

  constructor(canvasElement: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      alpha: true,
    });

    this.render = this.render.bind(this);

    this._handleClick = this._handleClick.bind(this);

    this.init();

    this.draw();

    this.render();
  }

  private init() {
    window.addEventListener("click", this._handleClick);

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    //! do I want to set the render targets here
    this.renderTargets = [
      new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight),
      new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight),
    ];

    //! do I want the camera set here?
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }

  private draw() {
    const backgroundColor = new THREE.Color(0xffffff);

    // create the scenes
    this.mainScene = new THREE.Scene();
    this.shaderScene = new THREE.Scene();

    const planeGeometry = new THREE.PlaneGeometry(2, 2);

    this.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_ratio: { type: "f", value: window.innerWidth / window.innerHeight },
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

    // setting the materials
    this.basicMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
    });

    const backgroundColorMaterial = new THREE.MeshBasicMaterial({
      color: backgroundColor,
      transparent: true,
    });

    // creating the meshes
    const planeBasic = new THREE.Mesh(planeGeometry, this.basicMaterial);
    const planeShader = new THREE.Mesh(planeGeometry, this.shaderMaterial);
    const coloredPlane = new THREE.Mesh(planeGeometry, backgroundColorMaterial);

    this.shaderScene.add(planeShader);
    this.mainScene.add(coloredPlane);

    this.renderer.setRenderTarget(this.renderTargets[0]);
    this.renderer.render(this.mainScene, this.camera);

    this.mainScene.remove(coloredPlane);
    this.mainScene.add(planeBasic);
  }

  private render() {
    requestAnimationFrame(this.render);
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

      // if (isStart) {
      //   this.shaderMaterial.uniforms.u_stop_randomizer.value =
      //     new THREE.Vector3(0.5, 1, 1);
      //   isStart = false;
      // }

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
  }

  // [ ]: do proper types for this event
  private _handleClick(e: MouseEvent | TouchEvent) {
    e.preventDefault();

    let clientX, clientY;

    if (e.type === "click") {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.type === "touchstart") {
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    }

    this.pointer.x = clientX / window.innerWidth;
    this.pointer.y = clientY / window.innerHeight;
    this.pointer.clicked = true;
  }
}
