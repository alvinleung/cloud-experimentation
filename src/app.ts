import {
  Camera,
  Mesh,
  Orbit,
  Plane,
  Program,
  Raycast,
  Renderer,
  Texture,
  Transform,
  Vec2,
  Vec3,
} from "ogl";

import VERT from "./warp-mesh.vert";
import FRAG from "./warp-mesh.frag";
import BLUR_FRAG from "./blur.frag";

import { loadAssets } from "./asset-loader";
import { VelocityObserver } from "./VelocityObserver";

const renderer = new Renderer();
const gl = renderer.gl;
document.body.appendChild(gl.canvas);

const camera = new Camera(gl);
camera.position.z = 1;

// ==================================================
// Canvas resize
// ==================================================
function resize() {
  renderer.dpr = window.devicePixelRatio;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.perspective({
    aspect: gl.canvas.width / gl.canvas.height,
  });
}
window.addEventListener("resize", resize, false);
resize();

// ==================================================

const mouse = new Vec2();
const handleMouseMove = (event: PointerEvent) => {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
};
window.addEventListener("pointermove", handleMouseMove);

loadAssets({
  gardenClose: new URL("assets/garden-close.png", import.meta.url),
  gardenCloseBlur: new URL("assets/garden-close-blur.png", import.meta.url),
  gardenFar: new URL("assets/garden-far.png", import.meta.url),
}).then((assets) => {
  const scene = new Transform();
  const geometry = new Plane(gl, {
    widthSegments: 1,
    heightSegments: 1,
    width: 1,
    height: assets.gardenClose.height / assets.gardenClose.width,
  });

  const gardenCloseTexture = new Texture(gl);
  gardenCloseTexture.image = assets.gardenClose;

  const gardenCloseBlurTexture = new Texture(gl, {
    image: assets.gardenCloseBlur,
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
    },
    transparent: true,
  });

  const mesh = new Mesh(gl, { geometry, program });
  mesh.setParent(scene);

  // mouse raycast
  const raycast = new Raycast();

  // orbit
  const orbit = new Orbit(camera);

  let mouseTargetUV = new Vec2();
  let mouseVelObserver = new VelocityObserver();

  function update(time: number) {
    renderer.gl.clearColor(1, 1, 1, 255);

    // update logic
    program.uniforms.uTime.value = time;
    program.uniforms.uAspect.value = gl.canvas.width / gl.canvas.height;

    orbit.update();

    // perform mouse ray casting
    raycast.castMouse(camera, mouse);
    const hit = raycast.intersectMeshes([mesh]);

    hit.forEach((mesh) => {
      // mesh.program.uniforms.uHitUV.value = mesh.hit.uv;
      mouseTargetUV = mesh.hit.uv;
    });

    lerpVec(mouseTargetUV, mesh.program.uniforms.uMaskUV.value, 0.007);
    lerpVec(mouseTargetUV, mesh.program.uniforms.uFocusUV.value, 0.1);

    const maxRot = 0.05;

    mesh.rotation.y = lerp(
      -maxRot - mouseTargetUV.x * -maxRot * 2,
      mesh.rotation.y,
      0.01,
    );
    // mesh.rotation.x = lerp(
    //   maxRot - focusPositionTargetUV.y * maxRot * 2,
    //   mesh.rotation.x,
    //   0.01,
    // );

    mouseVelObserver.recordMovement(mesh.program.uniforms.uFocusUV.value);
    const mouseSpeed = mouseVelObserver.getAverageVelocity().len();
    mesh.program.uniforms.uFocusSize.value = mouseSpeed * 30 + 0.5;
    mesh.program.uniforms.uStrength.value = mouseSpeed * 20 + 0.5;
    // console.log(mesh.program.uniforms.uStrength.value);

    // render to screen
    renderer.render({ scene, camera });
    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
});

function lerp(target: number, current: number, lerp = 0.05) {
  return current - (current - target) * lerp;
}

function lerpVec(target: Vec2, position: Vec2, lerp = 0.05) {
  position.x = position.x - (position.x - target.x) * lerp;
  position.y = position.y - (position.y - target.y) * lerp;
}
