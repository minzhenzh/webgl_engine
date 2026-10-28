import Camera from './source/camera.js';
import OrthCamera from "./source/orthCamera.js";
import PerspCamera from "./source/perspCamera.js";
import Transform from './source/transform.js';
import Time from './source/time.js';

import { initQuad }from "./demo/quad.js";
import { initFlyEnemy } from "./demo/flyEnemy.js";
import { initSlowEnemy } from "./demo/slowEnemy.js";
import { initNewSlowEnemy } from "./demo/newSlowEnemy.js";
import { initAniEnemy } from "./demo/aniEnemy.js";
import { initGrid } from "./demo/gridDemo.js";
import { initGridAni } from "./demo/gridAni.js";
import { initIsoAccAni } from "./demo/isoAccAni.js";
import { initIsoVelAni } from "./demo/isoVelAni.js";
import { initTopdownVelAni } from "./demo/topdownVelAni.js";
import { initFlock } from "./demo/flock.js";


// stages: the main steps from flocking to the velocity/acceleration field
// showcase: the flyEnemy simulation drawn as dots or Kenney fish
// tests: other versions kept from boids_demo and velocity_field
// widthSpan: ortho camera width, boids_demo demos used 4, velocity_field demos 20
const effects = {
    flockDots:     { init: (gl, canvas, camera) => initFlock(gl, canvas, camera, 'dots'), group: 'showcase', widthSpan: 4 },
    flockFish:     { init: (gl, canvas, camera) => initFlock(gl, canvas, camera, 'fish'), group: 'showcase', widthSpan: 4 },
    flyEnemy:      { init: initFlyEnemy,      group: 'stages', widthSpan: 4 },     // 1. boids flocking around obstacles
    newSlowEnemy:  { init: initNewSlowEnemy,  group: 'stages', widthSpan: 4 },     // 2. agents following the wavefront
    isoVelAni:     { init: initIsoVelAni,     group: 'stages', widthSpan: 20 },    // 3. velocity field
    isoAccAni:     { init: initIsoAccAni,     group: 'stages', widthSpan: 20 },    // 4. acceleration field
    slowEnemy:     { init: initSlowEnemy,     group: 'tests',  widthSpan: 4 },
    aniEnemy:      { init: initAniEnemy,      group: 'tests',  widthSpan: 4 },
    gridAni:       { init: initGridAni,       group: 'tests',  widthSpan: 4 },
    grid:          { init: initGrid,          group: 'tests',  widthSpan: 20 },
    topdownVelAni: { init: initTopdownVelAni, group: 'tests',  widthSpan: 20 },
    quad:          { init: initQuad,          group: 'tests',  widthSpan: 20 }
};

function main() {

    const canvas = document.getElementById('game-surface');
    const gl = canvas.getContext('webgl2');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // const size = Math.min(window.innerWidth, window.innerHeight);
    // canvas.width = size;
    // canvas.height = size;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.disable(gl.CULL_FACE);

    // pick effect from url, e.g. index.html?demo=flyEnemy
    const name = new URLSearchParams(window.location.search).get('demo') ?? 'isoAccAni';
    const fx = effects[name];

    if (fx) {
        // init camera
        const camera = new OrthCamera({
            widthSpan: fx.widthSpan,
            aspect: canvas.width / canvas.height,
        });
        camera.setPosition([0, 0, 10]);
        camera.updateProjection();
        camera.updateView();
        camera.updateViewInverse();

        console.log(`Running "${name}"`);
        fx.init(gl, canvas, camera);
    } else {
        console.warn(`"${name}" doesn’t exist.`);
    }

    // demo selector, grouped into showcase, stages and tests
    const selector = document.getElementById('demo-selector');
    for (const group of ['showcase', 'stages', 'tests']) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = group;
        for (const key in effects) {
            if (effects[key].group !== group) continue;
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key;
            option.selected = key === name;
            optgroup.appendChild(option);
        }
        selector.appendChild(optgroup);
    }
    selector.addEventListener('change', e => switchEffect(e.target.value));

    function switchEffect(name) {
        window.location.search = `?demo=${name}`;
    }

    window.switchEffect = switchEffect;
}


main();
