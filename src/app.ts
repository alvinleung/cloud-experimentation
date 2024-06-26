import {
  Box,
  Camera,
  Geometry,
  Mesh,
  Plane,
  Program,
  Renderer,
  Texture,
  Transform,
  Vec2,
} from "ogl";

import VERT from "./warp-mesh.vert";
import FRAG from "./warp-mesh.frag";

const renderer = new Renderer();
const gl = renderer.gl;
document.body.appendChild(gl.canvas);

const camera = new Camera(gl);
camera.position.z = 2;

// ==================================================
// Canvas resize
// ==================================================
function resize() {
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

interface AssetMap {
  [key: string]: HTMLImageElement;
}
function loadAssets() {
  return new Promise<AssetMap>((resolve, reject) => {
    let loadedAssets = {};
    const imageUrl = new URL("assets/superpower.png", import.meta.url);

    const img = document.createElement("img");
    img.src = imageUrl.href;
    img.onload = () => {
      loadedAssets["superpower"] = img;
      resolvePromise();
    };

    function resolvePromise() {
      resolve(loadedAssets);
    }
  });
}

loadAssets().then((assets) => {
  const scene = new Transform();
  const geometry = new Plane(gl, {
    widthSegments: 10,
    heightSegments: 10,
  });
  const superpowerTexture = new Texture(gl);
  superpowerTexture.image = assets.superpower;

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
      uTexture: {
        value: superpowerTexture,
      },
    },
  });

  const mesh = new Mesh(gl, { geometry, program });
  mesh.setParent(scene);

  function update(time: number) {
    program.uniforms.uTime.value = time;
    renderer.render({ scene, camera });
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
});
