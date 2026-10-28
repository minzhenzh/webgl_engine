#version 300 es
// Flock demos: each boid as a fish sprite turned toward its velocity.
// The fish in the sheet face left, so a fish swimming right is mirrored instead of turned upside down.

precision highp float;
precision highp int;

#value uFishSampler:1
uniform sampler2D uFishSampler;    // one row of fish, one fish per cell

uniform float uNumTypes;

in vec2 vVel;
in float vType;

out vec4 fragColor;

void main()
{
    vec2 dir = length(vVel) > 0.0001 ? normalize(vec2(vVel.x, -vVel.y)) : vec2(-1.0, 0.0);    // point coords have y down
    bool toRight = dir.x > 0.0;
    vec2 base = toRight ? vec2(1.0, 0.0) : vec2(-1.0, 0.0);

    // turn the point back into the sprite's frame
    float angle = atan(dir.y, dir.x) - atan(base.y, base.x);
    float c = cos(-angle), s = sin(-angle);
    vec2 p = gl_PointCoord - 0.5;
    vec2 uv = vec2(c*p.x - s*p.y, s*p.x + c*p.y) + 0.5;

    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0)
        discard;
    if (toRight)
        uv.x = 1.0 - uv.x;

    vec4 color = texture(uFishSampler, vec2((uv.x + vType) / uNumTypes, uv.y));
    if (color.a < 0.1)
        discard;
    fragColor = color;
}
