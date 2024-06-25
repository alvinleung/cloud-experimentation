import { Box, Camera, Mesh, Program, Renderer, Transform } from "ogl";

import VERT from "./shader.vert";
import FRAG from "./shader.frag";

const renderer = new Renderer();
const gl = renderer.gl;
document.body.appendChild(gl.canvas);

const camera = new Camera(gl);
camera.position.z = 5;

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

const scene = new Transform();
const geometry = new Box(gl);

const program = new Program(gl, {
  vertex: VERT,
  fragment: FRAG,
});

const mesh = new Mesh(gl, { geometry, program });
mesh.setParent(scene);

function update(time: number) {
  mesh.rotation.y += 0.04;
  renderer.render({ scene, camera });
  requestAnimationFrame(update);
}
requestAnimationFrame(update);
