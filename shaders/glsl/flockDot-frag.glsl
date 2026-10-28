#version 300 es
// Flock demos: each boid as a soft round dot.

precision highp float;
precision highp int;

uniform vec3 uColor;

in vec2 vVel;
in float vType;

out vec4 fragColor;

void main()
{
    float dist = length(gl_PointCoord - 0.5) * 2.0;
    if (dist > 1.0)
        discard;

    fragColor = vec4(uColor, 1.0 - smoothstep(0.7, 1.0, dist));
}
