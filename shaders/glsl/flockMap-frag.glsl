#version 300 es
// Map for the flock demos: a water gradient with colored obstacle cells.
// With uRocksOnly the water is skipped, so the rocks can be drawn again over the boids.

precision highp float;
precision highp int;

#value uInitGridTexture:0
uniform sampler2D uInitGridTexture;

uniform vec3 uWaterTop;
uniform vec3 uWaterBottom;
uniform vec3 uObstacleColor;
uniform float uRocksOnly;

in vec2 vUV;

out vec4 fragColor;

void main()
{
    vec2 uv = vec2(vUV.x, 1.0-vUV.y);
    float obstacle = texture(uInitGridTexture, uv).g;

    if (uRocksOnly > 0.5 && obstacle < 0.5)
        discard;

    vec3 water = mix(uWaterBottom, uWaterTop, vUV.y);
    fragColor = vec4(obstacle > 0.5 ? uObstacleColor : water, 1.0);
}
