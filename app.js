import Camera from './source/camera.js';
import OrthCamera from "./source/orthCamera.js";
import PerspCamera from "./source/perspCamera.js";
import Texture2D from './source/texture2d.js';
import Transform from './source/transform.js';
import Time from './source/time.js';

import { initSimpleQuad } from "./demo/simpleQuad.js";
import { autumn } from "./demo/autumnWind.js";
import { initAniTest } from "./demo/aniTest.js";
import { initSnow } from "./demo/snow.js";
import { initBlastParticle } from "./demo/blastParticle.js";


const time = new Time();
window.time = time;

const effects = {
    snow: initSnow,
    fire: initAniTest,
    autumn: autumn,
    blast: initBlastParticle,
    quad: initSimpleQuad
};

function main() {

    const canvas = document.getElementById('game-surface');
    const gl = canvas.getContext('webgl');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    // pick effect from url, e.g. index.html?demo=fire
    const name = new URLSearchParams(window.location.search).get('demo') ?? 'snow';
    const fx = effects[name];

    // init camera
    let camera, r;
    if (name === 'blast') {
        // blast ring is radius 50, needs a wider perspective view
        camera = new PerspCamera({
            aspect: canvas.width / canvas.height });
        r = 800;
    } else {
        camera = new OrthCamera({
            widthSpan: 70,
            aspect: canvas.width / canvas.height });
        r = 100;
    }
    const cos45 = Math.cos(45 * Math.PI / 180),
        sin35 = Math.sin(35 * Math.PI / 180);
    camera.setPosition([r * cos45, r * sin35, r * cos45]);
    camera.updateProjection();
    camera.updateView();
    camera.updateViewInverse();

    if (fx) {
        console.log(`Running "${name}"`);
        fx(gl, canvas, camera);
    } else {
        console.warn(`"${name}" doesn’t exist.`);
    }

    // demo selector
    const selector = document.getElementById('demo-selector');
    for (const key in effects) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        option.selected = key === name;
        selector.appendChild(option);
    }
    selector.addEventListener('change', e => switchEffect(e.target.value));

    function switchEffect(name) {
        window.location.search = `?demo=${name}`;
    }

    window.switchEffect = switchEffect;
}

main();
