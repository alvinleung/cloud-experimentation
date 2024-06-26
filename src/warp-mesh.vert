precision mediump float;

attribute vec3 position;
attribute vec2 uv;

uniform vec2 uMouse;
uniform float uTime;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;

void main() {
  vUv = uv;

  float timeOffset = uTime * 0.006; 
  float mouseFactor = 1.0 - smoothstep(.2,.8,distance(uMouse,position.xy));

  float anim = sin(timeOffset + position.x * 4.0);
  vec3 newPosition = position + vec3(0.0, 0.0, 0.2 * mouseFactor);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}