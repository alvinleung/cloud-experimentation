precision mediump float;

varying vec2 vUv;

uniform float uTime;
uniform sampler2D uTexture;

void main() {
    vec2 uv = vUv;
    // float time = mod(uTime * 0.000005, 1.0);
    vec4 color = texture2D(uTexture, fract(uv * 2.0 + uTime));

    float cloudColor = 1.0 - color.r * 2.0;
    color = vec4(vec3(0.94), smoothstep(0.5, 1.0, color.r));

    gl_FragColor = color;
}
