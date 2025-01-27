import {
  Mesh,
  OGLRenderingContext,
  Plane,
  Program,
  Texture,
  Transform,
} from "ogl";
import FRAG from "./cloud.frag";
import VERT from "./cloud.vert";

interface CloudConfig {
  scene: Transform;
  cloudImage: HTMLImageElement;
  z?: number;
}

export class Clouds {
  private uTime = {
    value: 0,
  };

  constructor(
    gl: OGLRenderingContext,
    { scene, z = 1, cloudImage }: CloudConfig,
  ) {
    const texture = new Texture(gl, {
      wrapS: gl.REPEAT,
      wrapT: gl.REPEAT,
      image: cloudImage,
    });
    const geometry = new Plane(gl, {
      width: 2,
      height: 2,
    });
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: this.uTime,
        uTexture: { value: texture },
      },
      transparent: true,
    });
    const mesh = new Mesh(gl, { geometry, program });
    mesh.position.z = z;
    scene.addChild(mesh);
  }
  update(gl: OGLRenderingContext, time: number) {
    this.uTime.value = time;
  }
}
