import Time from "../source/time.js";
import Shader from "../source/shader.js";
import Material from "../source/material.js";
import Shape from "../source/shape.js";
import Texture2D from "../source/texture2d.js";
import FrameSolver from "../source/frameSolver.js";
import {readAttrSchema} from "../source/shapeHelper.js";
import {sqrtFloor} from "../source/mathHelper.js";
import {genQuadUVXY, genRectHaltonPos, genWavefrontInitDataJSON, genWavefrontDataClick, getMouseGridPosition} from "../source/generatorHelper.js";
import gridConfig from './gridHelper/grid_config.json';

import quadVert from "../shaders/glsl/quad-vert.glsl";
import screenQuadVert from "../shaders/glsl/screenQuad-vert.glsl";
import wavefrontFrag from "../shaders/glsl/wavefront-frag.glsl";
import gradientFrag from "../shaders/glsl/gradient-frag.glsl";
import densityVert from "../shaders/glsl/density-vert.glsl";
import densityFrag from "../shaders/glsl/density-frag.glsl";
import boidsFrag from "../shaders/glsl/boids-frag.glsl";
import flockMapFrag from "../shaders/glsl/flockMap-frag.glsl";
import flockVert from "../shaders/glsl/flock-vert.glsl";
import flockDotFrag from "../shaders/glsl/flockDot-frag.glsl";
import fishFrag from "../shaders/glsl/fish-frag.glsl";


// Same simulation as flyEnemy (wavefront, gradient, density map, boids),
// drawn for showing: a water map, and each boid as a dot or a Kenney fish (CC0, resources/kenney-fish).
// style: 'dots' or 'fish'
export function initFlock(gl, canvas, camera, style = 'dots') {
    const particleParams = {
        count: 100,
        duration: 20,
        lifeTime: 20,
        minSize: 15,
        maxSize: 15,
        emitterSize: 2,
    }

    const boidsParams = {
        maxSpeed: 20,
        maxForce: 1,
        perceptionRadius: 5.0,
        checkCount: 8,
        separationWeight: 1.0,
        alignmentWeight: 1.0,
        cohesionWeight: 1.0,
        flowWeight: 1.0,
        avoidWeight: 10.0,
        dampScalar: 1.0
    }
    window.boidsParams = boidsParams;

    const colorParams = {
        background: [0.07, 0.12, 0.18],
        waterTop: [0.16, 0.42, 0.58],
        waterBottom: [0.09, 0.26, 0.40],
        obstacle: [0.86, 0.76, 0.55],
        dot: [1.0, 0.82, 0.40],
    }

    const fishParams = {
        files: ['fish_blue', 'fish_green', 'fish_orange', 'fish_pink', 'fish_red'],
        cellSize: 64,
        pointSize: 22,
    }

    const time = new Time();
    const emitterSize = 2;
    const emitterTexSize = sqrtFloor(particleParams.count);
    const emitterCorner = [-emitterSize/2, -emitterSize/2];

    // --- init wavefront solver ---
    const wavefrontShader = new Shader('wavefrontShader', {
        vertexSource: screenQuadVert,
        fragmentSource: wavefrontFrag,
    });
    wavefrontShader.initialize({gl});

    const wavefrontMaterial = new Material('wavefrontMaterial',{
        shader: wavefrontShader,
    });
    wavefrontMaterial.initialize({gl});
    wavefrontMaterial.setUniform('uGridSize', gridConfig.gridSize);

    const wavefrontShape = new Shape('wavefrontShape', {
        count:6, schema: readAttrSchema(screenQuadVert.input)
    });
    wavefrontShape.initialize({gl});

    const wavefrontSolver = new FrameSolver('wavefrontSolver', {
        shape: wavefrontShape, material: wavefrontMaterial,
        width: gridConfig.gridSize, height: gridConfig.gridSize,
        screenWidth: canvas.width, screenHeight: canvas.height,
        mode:1,
    });
    wavefrontSolver.initialize({gl});

    const initGridTexture = new Texture2D('initGridTexture', {
        width: gridConfig.gridSize, height: gridConfig.gridSize,
        scaleDown: 'NEAREST', scaleUp: 'NEAREST',
    })
    initGridTexture.initialize({gl});
    initGridTexture.setData(gl, genWavefrontInitDataJSON(gridConfig));
    wavefrontMaterial.setTexture('uInitGridTexture', initGridTexture);

    wavefrontSolver.Mode = FrameSolver.MODE.init;

    // --- init gradient solver ---
    const gradientShader = new Shader('gradientShader', {
        vertexSource: screenQuadVert,
        fragmentSource: gradientFrag,
    });
    gradientShader.initialize({gl});

    const gradientMaterial = new Material('gradientMaterial', {
        shader: gradientShader,
    });
    gradientMaterial.initialize({gl});
    gradientMaterial.setUniform('uGridSize', gridConfig.gridSize);

    const gradientShape = new Shape('gradientShape', {
        count:6, schema: readAttrSchema(screenQuadVert.input)
    });
    gradientShape.initialize({gl});

    const gradientSolver = new FrameSolver('gradientSolver', {
        shape: gradientShape, material: gradientMaterial,
        width: gridConfig.gridSize, height: gridConfig.gridSize,
        screenWidth: canvas.width, screenHeight: canvas.height,
        mode:1,
    });
    gradientSolver.initialize({gl});

    // --- init boids, density map and boids solver ---
    const emitterTexture = new Texture2D('emitterTexture', {
        width: emitterTexSize, height: emitterTexSize,
        scaleDown: 'NEAREST',
        scaleUp: 'NEAREST'
    });
    emitterTexture.initialize({gl});
    emitterTexture.setData(gl,
        genRectHaltonPos(emitterSize, emitterCorner, emitterTexSize, particleParams.minSize, particleParams.maxSize, particleParams.duration, gridConfig));

    const mapShader = new Shader('mapShader', {
        vertexSource: densityVert,
        fragmentSource: densityFrag,
    });
    mapShader.initialize({gl});

    const mapMaterial = new Material('mapMaterial', {
       shader: mapShader,
    });
    mapMaterial.initialize({gl});
    mapMaterial.setUniform('uEmitterTexSize', emitterTexSize);

    const mapShape = new Shape('mapShape', {
        state: 3,
        count:particleParams.count, schema: readAttrSchema(densityVert.input)
    });
    mapShape.initialize({gl});

    const mapSolver = new FrameSolver('mapSolver', {
        shape: mapShape, material: mapMaterial,
        width: gridConfig.gridSize, height: gridConfig.gridSize,
        screenWidth: canvas.width, screenHeight: canvas.height,
        mode:1, blendState:FrameSolver.BLENDSTATE.add
    });
    mapSolver.initialize({gl});

    const boidsShader = new Shader('boidsShader', {
        vertexSource: screenQuadVert,
        fragmentSource: boidsFrag,
    });
    boidsShader.initialize({gl});

    const boidsMaterial = new Material('boidsMaterial', {
        shader: boidsShader,
    });
    boidsMaterial.initialize({gl});
    boidsMaterial.setUniform('uGridSize', gridConfig.gridSize);
    boidsMaterial.setUniform('uEmitterTexSize', emitterTexSize);
    boidsMaterial.setUniform('uEmitterSize', emitterSize);
    boidsMaterial.setTexture('uEmitterTexture', emitterTexture);

    const boidsShape = new Shape('boidsShape', {
        count:6, schema: readAttrSchema(screenQuadVert.input)
    });
    boidsShape.initialize({gl});

    const boidsSolver = new FrameSolver('boidsSolver', {
        shape: boidsShape, material: boidsMaterial,
        width: emitterTexSize, height: emitterTexSize,
        screenWidth: canvas.width, screenHeight: canvas.height,
        mode:1,
    });
    boidsSolver.initialize({gl});

    // --- init map renderer ---
    const mapViewShader = new Shader('mapViewShader', {
        vertexSource: quadVert,
        fragmentSource: flockMapFrag,
    });
    mapViewShader.initialize({gl});

    const mapViewMaterial = new Material('mapViewMaterial', {
        shader: mapViewShader,
    });
    mapViewMaterial.initialize({gl});
    mapViewMaterial.setTexture('uInitGridTexture', initGridTexture);
    mapViewMaterial.setUniform('uWaterTop', colorParams.waterTop);
    mapViewMaterial.setUniform('uWaterBottom', colorParams.waterBottom);
    mapViewMaterial.setUniform('uObstacleColor', colorParams.obstacle);

    const quadShape = new Shape('quad', {
        verticeCount: 6, schema: readAttrSchema(quadVert.input)
    });
    quadShape.initialize({gl});
    quadShape.update(gl, 'quadBuffer', {material:mapViewMaterial, data:genQuadUVXY(emitterSize)});

    // --- init boid renderer ---
    const boidShader = new Shader('boidShader', {
        vertexSource: flockVert,
        fragmentSource: style === 'fish' ? fishFrag : flockDotFrag,
    });
    boidShader.initialize({gl});

    // normal alpha blending (Material's blend is additive), drawn by hand around the boids below
    const boidMaterial = new Material('boidMaterial', {
        shader: boidShader
    });
    boidMaterial.initialize({gl});
    boidMaterial.setUniform('uEmitterTexSize', emitterTexSize);
    boidMaterial.setUniform('uNumTypes', style === 'fish' ? fishParams.files.length : 1);
    boidMaterial.setUniform('uPointSize', style === 'fish' ? fishParams.pointSize : 8);
    if (style !== 'fish')
        boidMaterial.setUniform('uColor', colorParams.dot);

    const boidShape = new Shape('boidShape', {
        state: 3, count: particleParams.count,
        schema: readAttrSchema(flockVert.input)
    });

    // fish: put the sprites side by side in one canvas, one fish per cell
    let ready = style !== 'fish';
    if (style === 'fish') {
        const images = fishParams.files.map(name => {
            const img = new Image();
            img.src = `../resources/kenney-fish/${name}.png`;
            return img;
        });
        Promise.all(images.map(img => img.decode())).then(() => {
            const sheet = document.createElement('canvas');
            sheet.width = fishParams.cellSize * images.length;
            sheet.height = fishParams.cellSize;
            const ctx = sheet.getContext('2d');
            images.forEach((img, i) => ctx.drawImage(img, i * fishParams.cellSize, 0, fishParams.cellSize, fishParams.cellSize));

            const fishTexture = new Texture2D('fishTexture', {
                image: sheet,
                scaleDown: 'LINEAR',
                scaleUp: 'LINEAR'
            });
            fishTexture.initialize({gl});
            boidMaterial.setTexture('uFishSampler', fishTexture);
            ready = true;
        });
    }

    // update goal from mouse click
    canvas.addEventListener('mousedown', (e) => {
        const clickPos = getMouseGridPosition(e, canvas, gridConfig.gridSize);
        if (!clickPos) return;

        initGridTexture.setData(gl, genWavefrontDataClick(gridConfig, clickPos));
        wavefrontMaterial.setTexture('uInitGridTexture', initGridTexture);
        wavefrontSolver.Mode = FrameSolver.MODE.init;
    });

    function drawFlock() {
        requestAnimationFrame(drawFlock);

        time.update();

        // --- wavefront solver update ---
        wavefrontMaterial.setUniform('uState', wavefrontSolver.mode);
        wavefrontSolver.update(gl);
        if (wavefrontSolver.Mode === FrameSolver.MODE.init) {
            wavefrontSolver.Mode = FrameSolver.MODE.play;
        }

        // --- gradient solver update ---
        gradientMaterial.setTexture('uWavefrontTexture', wavefrontSolver.frontBuffer.textures[0]);
        gradientSolver.update(gl);

        // --- boids solver update ---
        boidsMaterial.setUniform('uTime', time.ElapsedTime);
        boidsMaterial.setUniform('uDeltaTime', time.Interval);
        boidsMaterial.setTexture('uGradientTexture', gradientSolver.frontBuffer.textures[0]);
        boidsMaterial.setTexture('uMapTexture1', mapSolver.frontBuffer.textures[0]);
        boidsMaterial.setTexture('uMapTexture2', mapSolver.frontBuffer.textures[1]);

        boidsMaterial.setUniform('uMaxSpeed', boidsParams.maxSpeed);
        boidsMaterial.setUniform('uMaxForce', boidsParams.maxForce);
        boidsMaterial.setUniform('uPercepRadius', boidsParams.perceptionRadius);
        boidsMaterial.setUniform('uCheckCount', boidsParams.checkCount);
        boidsMaterial.setUniform('uSepaWeight', boidsParams.separationWeight);
        boidsMaterial.setUniform('uAligWeight', boidsParams.alignmentWeight);
        boidsMaterial.setUniform('uCoheWeight', boidsParams.cohesionWeight);
        boidsMaterial.setUniform('uFlowWeight', boidsParams.flowWeight);
        boidsMaterial.setUniform('uAvoidWeight', boidsParams.avoidWeight);
        boidsMaterial.setUniform('uDampScalar', boidsParams.dampScalar);

        boidsSolver.update(gl);
        if (boidsSolver.Mode === FrameSolver.MODE.init) {
            boidsSolver.Mode = FrameSolver.MODE.play;
        }

        mapMaterial.setTexture('uBoidsTexture', boidsSolver.frontBuffer.textures[0]);
        mapSolver.update(gl);

        // --- draw ---
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(...colorParams.background, 1.0);
        gl.colorMask(true, true, true, true);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.blendFunc(gl.ONE, gl.ZERO);

        mapViewMaterial.preDraw(gl, camera);
        quadShape.draw(gl, mapViewMaterial);
        mapViewMaterial.postDraw(gl);

        if (!ready) return;
        boidMaterial.setTexture('uBoidsTexture0', boidsSolver.frontBuffer.textures[0]);
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.blendEquation(gl.FUNC_ADD);
        boidMaterial.preDraw(gl, camera);
        boidShape.draw(gl, boidMaterial);
        boidMaterial.postDraw(gl);
        gl.disable(gl.BLEND);
    }

    drawFlock();
}
