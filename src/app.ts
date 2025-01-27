import { Camera, Orbit, Renderer, Transform, Vec2, Vec3 } from "ogl";

import { loadAssets } from "./asset-loader";
import { Garden } from "./garden";
import { lerp } from "./utils";
import { Clouds } from "./cloud";

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
  gardenFarBlur: new URL("assets/garden-far-blur.png", import.meta.url),
  cloudImage: new URL("assets/cloud.png", import.meta.url),
}).then((assets) => {
  const scene = new Transform();

  // orbit
  // const orbit = new Orbit(camera);

  let isViewingClose = true;
  const CAMERA_CLOSE_Z = 1;
  const CAMERA_FAR_Z = 2;

  const CAMERA_FAR_Y = 0.24;
  const CAMERA_CLOSE_Y = 0;

  const CAMERA_FAR_X = 0;
  const CAMERA_CLOSE_X = 0;

  const targetCameraPos = new Vec3();

  window.addEventListener("click", () => {
    isViewingClose = !isViewingClose;
  });

  const gardenSmall = new Garden(gl, {
    close: assets.gardenClose,
    blur: assets.gardenCloseBlur,
    scale: 1,
    mouse,
    scene,
    camera,
  });

  const gardenFar = new Garden(gl, {
    close: assets.gardenFar,
    blur: assets.gardenFarBlur,
    scale: 1.79,
    offset: new Vec3(0.069, 0.317, 0.01),
    mouse,
    scene,
    camera,
  });

  const cloudsLayer1 = new Clouds(gl, {
    scene,
    cloudImage: assets.cloudImage,
  });

  const cloudsLayer2 = new Clouds(gl, {
    scene,
    cloudImage: assets.cloudImage,
    z: 1.4,
  });

  function update(time: number) {
    renderer.gl.clearColor(254 / 255, 255 / 255, 250 / 255, 1.0);

    targetCameraPos.z = isViewingClose ? CAMERA_CLOSE_Z : CAMERA_FAR_Z;
    targetCameraPos.x = isViewingClose ? CAMERA_CLOSE_X : CAMERA_FAR_X;
    targetCameraPos.y = isViewingClose ? CAMERA_CLOSE_Y : CAMERA_FAR_Y;

    const withMouseParallaxOffset = new Vec3().copy(targetCameraPos);
    const mouseOffsetFactor = isViewingClose ? 0.01 : 0.2;
    const mouseOffsetAmount = new Vec3(
      mouse.x * mouseOffsetFactor,
      mouse.y * mouseOffsetFactor,
      0,
    );
    withMouseParallaxOffset.add(mouseOffsetAmount);

    camera.position.lerp(targetCameraPos, 0.05);
    camera.position.lerp(withMouseParallaxOffset, 0.01);

    // orbit.update();
    const transitionProgress =
      (camera.position.z - CAMERA_CLOSE_Z) / (CAMERA_FAR_Z - CAMERA_CLOSE_Z);

    gardenSmall.update(gl, time, 1 - transitionProgress);
    gardenFar.update(gl, time, transitionProgress);
    cloudsLayer1.update(gl, time);
    cloudsLayer2.update(gl, time);

    // render to screen
    renderer.render({ scene, camera });
    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
});
