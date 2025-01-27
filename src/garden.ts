import {
  Camera,
  Mesh,
  OGLRenderingContext,
  Plane,
  Program,
  Raycast,
  Renderer,
  Texture,
  Transform,
  Vec2,
  Vec3,
} from "ogl";
import VERT from "./garden.vert";
import FRAG from "./garden.frag";
import { VelocityObserver } from "./VelocityObserver";
import { lerp, lerpVec } from "./utils";

interface GardenConfig {
  close: HTMLImageElement;
  blur: HTMLImageElement;
  mouse: Vec2;
  scene: Transform;
  camera: Camera;
  scale?: number;
  offset?: Vec3;
}

export class Garden {
  private program: Program;
  private mesh: Mesh;
  private raycast: Raycast;
  private mouse: Vec2;
  private camera: Camera;
  private mouseVelObserver = new VelocityObserver();
  private mouseTargetUV = new Vec2();
  private offset: Vec3;

  constructor(
    gl: OGLRenderingContext,
    {
      close,
      blur,
      mouse,
      scene,
      camera,
      scale = 1,
      offset = new Vec3(),
    }: GardenConfig,
  ) {
    this.mouse = mouse;
    this.camera = camera;
    this.offset = offset;

    const geometry = new Plane(gl, {
      widthSegments: 1,
      heightSegments: 1,
      width: 1 * scale,
      height: (close.height / close.width) * scale,
    });

    const gardenCloseTexture = new Texture(gl, {
      image: close,
    });

    const gardenCloseBlurTexture = new Texture(gl, {
      image: blur,
    });

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: {
          value: 0,
        },
        uMouse: {
          value: mouse,
        },
        uBlurTexture: {
          value: gardenCloseBlurTexture,
        },
        uBaseTexture: {
          value: gardenCloseTexture,
        },
        uAspect: {
          value: gl.canvas.width / gl.canvas.height,
        },
        uHitUV: {
          value: new Vec2(),
        },
        uFocusUV: {
          value: new Vec2(),
        },
        uMaskUV: {
          value: new Vec2(),
        },
        uFocusSize: {
          value: 0,
        },
        uStrength: {
          value: 0,
        },
        uAccentColor: {
          value: new Vec3(0.3, 0.3, 0.3),
        },
        uTransitionProgress: {
          value: 0,
        },
      },
      transparent: true,
    });

    this.program = program;

    const mesh = new Mesh(gl, { geometry, program });
    mesh.position.add(offset);
    this.mesh = mesh;

    mesh.setParent(scene);

    // mouse raycast
    this.raycast = new Raycast();
  }

  update(gl: OGLRenderingContext, time: number, transitionProgress: number) {
    const program = this.program;
    const mesh = this.mesh;

    // perform mouse ray casting
    this.raycast.castMouse(this.camera, this.mouse);
    const hit = this.raycast.intersectMeshes([mesh]);

    hit.forEach((mesh) => {
      // mesh.program.uniforms.uHitUV.value = mesh.hit.uv;
      this.mouseTargetUV = mesh.hit.uv;
    });

    // update interaction logic
    const mouseSpeed = this.mouseVelObserver.getAverageVelocity().len();
    this.mouseVelObserver.recordMovement(mesh.program.uniforms.uFocusUV.value);

    // lerpVec(this.mouseTargetUV, mesh.program.uniforms.uMaskUV.value, 0.007);
    mesh.program.uniforms.uMaskUV.value = this.offset;

    lerpVec(this.mouseTargetUV, mesh.program.uniforms.uFocusUV.value, 0.1);

    // update logic
    program.uniforms.uTime.value = time;
    program.uniforms.uAspect.value = gl.canvas.width / gl.canvas.height;

    program.uniforms.uTransitionProgress.value = transitionProgress;

    const maxRot = 0.05;

    // mesh.rotation.y = lerp(
    //   -maxRot - this.mouseTargetUV.x * -maxRot * 2,
    //   mesh.rotation.y,
    //   0.01,
    // );
    // mesh.rotation.x = lerp(
    //   maxRot - focusPositionTargetUV.y * maxRot * 2,
    //   mesh.rotation.x,
    //   0.01,
    // );

    mesh.program.uniforms.uFocusSize.value = mouseSpeed * 30 + 0.5;
    mesh.program.uniforms.uStrength.value = mouseSpeed * 20 + 0.5;
  }
}
