import {$assert} from "./common.js";
import Texture2D from './texture2d.js';
import Material from "./material.js";


export default class _particleMaterial extends Material{

    constructor(name, params = {}) {
        super(name, params);
        this.numFrames = params.numFrames || 1;
        this.partiCount = params.partiCount || 1;
        this.numGen = params.numGen || 1;
        this.duration = params.duration || 1;
        this.gravity = [0, -9.8, 0];
        this.lifeTime = params.lifeTime || 1;
        this.tileSize = params.tileSize || null;
        this.texWidth = params.texWidth || null;
        this.texHeight = params.texHeight || null;
        this.aniFps = params.aniFps || 60;
    }


    initialize({ gl }) {
        super.initialize({ gl });
    }



    preDraw(gl, time, camera, transform) {

        this.setUniform('uTime', time.ElapsedTime);

        this.setUniform('uDuration', this.duration);
        this.setUniform('uPartiCount', this.partiCount);
        this.setUniform('uNumGen', this.numGen);
        this.setUniform('uGravity', this.gravity);
        this.setUniform('uLifeTime', this.lifeTime);

        this.setUniform('_ANI_TEX_0', [
            this.texWidth, this.texHeight, this.tileSize, this.numFrames]);

        this.setUniform('_ANI_TEX_0_FPS', this.aniFps);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.blendEquation(gl.FUNC_ADD);

        super.preDraw(gl, camera, transform);

    }
}
