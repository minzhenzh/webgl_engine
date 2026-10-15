# webgl_engine (WebGL1)

WebGL1 particle demos. Particles are simulated on the GPU with a framebuffer (ping-pong texture) solver, see `source/solver.js` and `shaders/glsl/solver-frag.glsl`.

## Run

```bash
npm install
npm run dev
```

Pick a demo from the dropdown in the top-left corner, or open `http://localhost:5173/?demo=<name>`.

| demo | file | description |
|---|---|---|
| `snow` | `demo/snow.js` | snow falling with gravity, vortex, noise and damping fields (default) |
| `fire` | `demo/aniTest.js` | sprite-sheet animated fire particles |
| `autumn` | `demo/autumnWind.js` | arrow sprites blown by the wind fields |
| `blast` | `demo/blastParticle.js` | fire ring burst (static emitter, no solver) |
| `quad` | `demo/simpleQuad.js` | basic quad with shader / material / shape |

Requires the `WEBGL_draw_buffers` and `OES_texture_float` extensions.
