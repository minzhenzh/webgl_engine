# webgl_engine (WebGL1)

WebGL1 GPU particle demos using a framebuffer (ping-pong texture) solver.

Blog posts:

* [Blast: Playing a Fire Animation from One Texture](https://minzhenzh.github.io/work/webgl-blast-texture-atlas/)
* [Snow: A Particle Solver Made of Framebuffers](https://minzhenzh.github.io/work/webgl-snow-framebuffer-solver/)

## Run

```bash
npm install
npm run dev
```

Pick a demo from the dropdown in the top-left corner, or open `http://localhost:5173/?demo=<name>`.

## Demos

| demo | file |
|---|---|
| `snow` | `demo/snow.js` |
| `fire` | `demo/aniTest.js` |
| `autumn` | `demo/autumnWind.js` |
| `blast` | `demo/blastParticle.js` |
| `quad` | `demo/simpleQuad.js` |

Requires the `WEBGL_draw_buffers` and `OES_texture_float` extensions.
