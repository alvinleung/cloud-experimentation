precision mediump float;

uniform float uTime;
uniform vec2 uMouse;
uniform sampler2D uTexture;

varying vec2 vUv;

float sdfCircle(vec2 st, vec2 center) {
  return length(st - center) * 2.0;
}

void main() {
  vec2 uv = vUv;
  vec2 uvOffset = uMouse - uv;
  float sdfOutput = 1.0 - smoothstep(.4, .9, sdfCircle(uv, uMouse));
  vec2 sampleCoord = uv + uvOffset *  sdfOutput * 0.1; 
  
  vec4 color = texture2D(uTexture, uv);
  // vec4 color = texture2D(uTexture, sampleCoord); 

  gl_FragColor = color;
  // gl_FragColor = vec4(sin(uMouse * 0.001));
}
