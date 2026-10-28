#version 300 es
// Framebuffer version of leaves-vert.glsl: particle data comes from the FrameSolver textures.

precision highp float;
precision highp int;

#include "./includes/aniTex.glsl"

uniform mat4 _uni_projMat;
uniform mat4 _uni_viewMat;
#value _uni_modelMat:mat4(1.0)
uniform mat4 _uni_modelMat;

#value uDataSlot0:1
uniform sampler2D uDataSlot0;    // posX, posY, posZ, size
#value uDataSlot1:2
uniform sampler2D uDataSlot1;    // linVelX, linVelY, linVelZ, generation
#value uDataSlot2:3
uniform sampler2D uDataSlot2;    // accX, accY, accZ, frameLife
#value uDataSlot3:4
uniform sampler2D uDataSlot3;    // aniType, _empty, _empty, _empty

uniform float uMAXCOL;


out float vGeneration;
out vec3 vLinVel;
out float vAniType;
out float vFrame;


vec2 getParticleCoord(float particleID, float MAXCOL) {
    vec2 uv = vec2(mod(particleID,MAXCOL), floor(particleID/MAXCOL))/MAXCOL;
    uv += vec2(1.0/MAXCOL*0.5);    //  offset to center of pixel
    return uv;
}


void main()
{
    vec2 particleUV = getParticleCoord(float(gl_InstanceID), uMAXCOL);
    vec4 dataSlot0 = texture(uDataSlot0, particleUV);
    vec4 dataSlot1 = texture(uDataSlot1, particleUV);
    vec4 dataSlot2 = texture(uDataSlot2, particleUV);
    vec4 dataSlot3 = texture(uDataSlot3, particleUV);

    // aniTex
    float numFrames = _uAniTexNumFrames;
    float aniFps = _uAniTexFps;

    float frame = mod(floor(dataSlot2.w*aniFps) , numFrames);
    vec3 pos = dataSlot0.xyz;

    gl_Position = _uni_projMat * _uni_viewMat * _uni_modelMat * vec4(pos, 1.0);
    gl_PointSize = dataSlot0.w;

    vGeneration = dataSlot1.w;
    vLinVel = mat3(_uni_viewMat) * dataSlot1.xyz;
    vAniType = dataSlot3.x;
    vFrame = frame;
}
