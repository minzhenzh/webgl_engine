import Camera from './source/camera.js';
import OrthCamera from "./source/orthCamera.js";
import PerspCamera from "./source/perspCamera.js";
import Transform from './source/transform.js';
import Time from './source/time.js';

import { initQuad }from "./demo/quad.js";
import { initSnow }from "./demo/snow.js";
import { initArrows } from "./demo/arrows.js";
import { initRain } from "./demo/rain.js";
import { initLeaves } from "./demo/leaves.js";
import { initFlowers } from "./demo/flowers.js";
import { initWavefrontField } from "./demo/wavefrontField.js";
import { SOLVER_TYPE } from "./demo/particleSolver.js";


// camera: 'ortho' front view, 'iso' perspective iso view (distance: how far away, default 700)
// solver: the particle demos run on either solver, see demo/particleSolver.js
const effects = {
    snow:      { init: initSnow,    camera: 'ortho', solver: true },
    rain:      { init: initRain,    camera: 'iso',   solver: true, distance: 200, target: [50, 110, 0] },
    leaves:    { init: initLeaves,  camera: 'iso',   solver: true, distance: 110, target: [0, 130, 0] },
    flowers:   { init: initFlowers, camera: 'iso',   solver: true, distance: 110, target: [0, 130, 0] },
    arrows:    { init: initArrows,  camera: 'iso',   solver: true, distance: 150, target: [0, 30, 0] },    // inter stage: particle direction change
    wavefront: { init: initWavefrontField, camera: 'ortho' },
    quad:      { init: initQuad,    camera: 'ortho' }
};

function initCamera({type, distance = 700, target = [0, 10, 0]}, canvas) {

    let camera;
    if (type === 'iso') {
        camera = new PerspCamera({
            target: target,
            aspect: canvas.width / canvas.height,
        });
        const r = distance,
            cos45 = Math.cos(45 * Math.PI / 180),
            sin35 = Math.sin(35 * Math.PI / 180);
        camera.setPosition([r * cos45, r * sin35, r * cos45]);
    } else {
        camera = new OrthCamera({
            widthSpan: 70,
            aspect: canvas.width / canvas.height,
        });
        camera.setPosition([0, 0, 10]);
    }
    camera.updateProjection();
    camera.updateView();
    camera.updateViewInverse();

    return camera;
}

function main() {

    const canvas = document.getElementById('game-surface');
    const gl = canvas.getContext('webgl2');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.disable(gl.CULL_FACE);

    // pick effect and solver from url, e.g. index.html?demo=rain&solver=fb
    const params = new URLSearchParams(window.location.search);
    const name = params.get('demo') ?? 'snow';
    const solverType = params.get('solver') === SOLVER_TYPE.fb ? SOLVER_TYPE.fb : SOLVER_TYPE.tf;

    const fx = effects[name];
    if (fx) {
        console.log(`Running "${name}"` + (fx.solver ? ` with the ${solverType} solver` : ''));
        const camera = initCamera({type: fx.camera, distance: fx.distance, target: fx.target}, canvas);
        fx.init(gl, canvas, camera, solverType);
    } else {
        console.warn(`"${name}" doesn’t exist.`);
    }

    // demo and solver selectors
    const demoSelector = document.getElementById('demo-selector');
    for (const key in effects) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key === 'arrows' ? 'arrows (inter stage)' : key;
        option.selected = key === name;
        demoSelector.appendChild(option);
    }

    const solverSelector = document.getElementById('solver-selector');
    for (const key in SOLVER_TYPE) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key === SOLVER_TYPE.tf ? 'transform feedback' : 'framebuffer';
        option.selected = key === solverType;
        solverSelector.appendChild(option);
    }
    solverSelector.disabled = !fx?.solver;

    demoSelector.addEventListener('change', e => switchEffect(e.target.value, solverSelector.value));
    solverSelector.addEventListener('change', e => switchEffect(demoSelector.value, e.target.value));

    function switchEffect(name, solver = solverType) {
        window.location.search = `?demo=${name}&solver=${solver}`;
    }

    window.switchEffect = switchEffect;

}


main();
