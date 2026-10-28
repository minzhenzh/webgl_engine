import Shader from "../source/shader.js";
import Material from "../source/material.js";
import Shape from "../source/shape.js";
import Solver from "../source/solver.js";
import SolverMaterial from "../source/solverMaterial.js";
import SolverShape from "../source/solverShape.js";
import FrameSolver from "../source/frameSolver.js";

import {readAttrSchema} from "../source/shapeHelper.js";
import {genInitData} from "../source/generatorHelper.js";
import {sqrtFloor} from "../source/mathHelper.js";

import solverVert from "../shaders/glsl/solver-vert.glsl";
import solverFrag from "../shaders/glsl/solver-frag.glsl";
import screenQuadVert from "../shaders/glsl/screenQuad-vert.glsl";
import particleSolverFrag from "../shaders/glsl/particleSolver-frag.glsl";


// tf: transform feedback, particles live in a vertex buffer (Solver)
// fb: framebuffer, particles live in 4 float textures, one pixel per particle (FrameSolver)
export const SOLVER_TYPE = {tf: 'tf', fb: 'fb'};


// both solvers take the same uniforms (uEmitterSlot*, uFieldParams, uTime, ...),
// so the demo sets them up the same way on the returned solverMaterial
export function initParticleSolver(gl, solverType, {count, stride}) {

    if (solverType === SOLVER_TYPE.fb) {
        const MAXCOL = sqrtFloor(count);

        const solverShader = new Shader({
            vertexSource: screenQuadVert,
            fragmentSource: particleSolverFrag,
        });
        solverShader.initialize({gl});

        const solverMaterial = new Material('solverMaterial', {
            shader: solverShader,
        });
        solverMaterial.initialize({gl});

        const solverShape = new Shape('solverShape', {
            verticeCount: 6
        });
        solverShape.initialize({gl});

        const solver = new FrameSolver('solver', {
            shape: solverShape, material: solverMaterial,
            width: MAXCOL, height: MAXCOL,
            mode: 1, loop: true
        });
        solver.initialize({gl});

        return {solver, solverMaterial, solverShape};
    }

    const solverShader = new Shader({
        vertexSource: solverVert,
        fragmentSource: solverFrag,
    });
    solverShader.initialize({gl});

    const solverMaterial = new SolverMaterial('solverMaterial', {
        shader: solverShader,
    });
    solverMaterial.initialize({gl});

    const initData = genInitData(count, stride);
    const solverShape = new SolverShape('solverShape', {
        count: count, schema: readAttrSchema(solverVert.input)
    });
    solverShape.initialize({gl});

    const solver = new Solver('solver', {
        shape: solverShape, material: solverMaterial,
        count: count, mode: 1, loop: true, stride: stride,
        data: initData
    });
    solver.initialize({gl}, 'particleBuffer');

    return {solver, solverMaterial, solverShape};
}


// tf: draw straight from the solver's vertex buffers
// fb: draw one point per particle, the vertex shader reads its pixel by gl_InstanceID
export function initParticleShape(solverType, {count, solverShape, vertSource}) {

    if (solverType === SOLVER_TYPE.fb)
        return new Shape('particleShape', {
            state: 3, count: count
        });

    return new Shape('particleShape', {
        state: 3, count: count, vaos: solverShape.VAOS,
        schema: readAttrSchema(vertSource.input)
    });
}


// fb only: hand the latest solver textures to the particle material before drawing
export function setParticleData(solverType, {material, solver, count}) {

    if (solverType !== SOLVER_TYPE.fb)
        return;

    const uniforms = material.uniforms;
    if (uniforms['uMAXCOL']) material.setUniform('uMAXCOL', sqrtFloor(count));
    if (uniforms['uDataSlot0']) material.setTexture('uDataSlot0', solver.frontBuffer.textures[0]);
    if (uniforms['uDataSlot1']) material.setTexture('uDataSlot1', solver.frontBuffer.textures[1]);
    if (uniforms['uDataSlot2']) material.setTexture('uDataSlot2', solver.frontBuffer.textures[2]);
    if (uniforms['uDataSlot3']) material.setTexture('uDataSlot3', solver.frontBuffer.textures[3]);
}
