#version 300 es
// Flock demos: one point per boid, position and velocity read from the boids texture.

precision highp float;
precision highp int;

uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;
#value _uni_modelMat:mat4(1.0)
uniform mat4 _uni_modelMat;

#value uBoidsTexture0:0
uniform sampler2D uBoidsTexture0;    // pos.xy, vel.zw

uniform float uEmitterTexSize;
uniform float uPointSize;
uniform float uNumTypes;

out vec2 vVel;
out float vType;

vec2 getEmitterCoord(float particleID, float gridSize) {
    vec2 uv = vec2(mod(particleID,gridSize), floor(particleID/gridSize))/gridSize;
    uv += vec2(1.0/gridSize*0.5);    //  offset to center of pixel
    return uv;
}

void main()
{
    float particleID = float(gl_InstanceID);
    vec4 boidsData0 = texture(uBoidsTexture0, getEmitterCoord(particleID, uEmitterTexSize));

    gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(boidsData0.xy, 0, 1);
    gl_PointSize = uPointSize;

    vVel = boidsData0.zw;
    vType = mod(particleID, uNumTypes);
}
