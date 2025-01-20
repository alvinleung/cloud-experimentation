precision mediump float;

uniform float uTime;
uniform vec2 uMouse;
uniform sampler2D uBaseTexture;
uniform sampler2D uBlurTexture;

uniform vec2 uHitUV;

uniform float uFocusSize;
uniform float uStrength;

uniform vec2 uFocusUV;
uniform vec2 uMaskUV;

uniform float uAspect;
uniform vec3 uAccentColor;

varying vec2 vUv;

float sdfCircle(vec2 st, vec2 center) {
    return length(st - center) * 2.0;
}

void main() {
    vec2 uv = vUv;

    // float focusSize = 1.4;
    float focusSize = uFocusSize;
    float sdfOutput = 1.0 - smoothstep(0.1, 0.9, 1.0 - sdfCircle(uv / focusSize, uFocusUV / focusSize));

    float time = (1.0 + sin(uTime * .0005)) * 0.5;

    float maskSize = 3.5;
    float sdfOutputBig = 1.0 - smoothstep(0.0, 1.0, 1.0 - sdfCircle(uv / maskSize, uMaskUV / maskSize));

    vec4 baseTextureColor = texture2D(uBaseTexture, uv);
    vec4 blurTextureColor = texture2D(uBlurTexture, uv);
    // vec4 blendedEdge = smoothstep(0.4, 0.9, blurTextureColor + sdfOutput);
    // vec4 blendedEdge = baseTextureColor * smoothstep(0.2, 0.9, blurTextureColor + sdfOutput);

    float strengh = 1.0 - min(uStrength, 0.45);
    float threshold = 0.92;

    vec4 blendedEdge = smoothstep(threshold - strengh, threshold, smoothstep(threshold - strengh, threshold, blurTextureColor + sdfOutput));
    vec4 accentColor = vec4(uAccentColor, baseTextureColor.a);
    vec4 blendedEdgeColor = vec4(vec3(accentColor.rgb), 1.0 - blendedEdge.r);

    float smoothedBigCircle = smoothstep(.4, .8, .1 + sdfOutputBig - 0.1);
    vec4 baseTextureWithMask = mix(baseTextureColor, vec4(vec3(1.0), 0.0), smoothedBigCircle * blurTextureColor.r);

    // gl_FragColor = baseTextureWithMask;

    gl_FragColor = mix(baseTextureWithMask, blendedEdgeColor, blendedEdgeColor.a);

    // gl_FragColor = baseTextureColor;
    // gl_FragColor = vec4(sin(uMouse * 0.001));
}
