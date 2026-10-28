# webgl_engine (WebGL2)

WebGL2 GPU particle demos. Each particle demo runs on either solver: transform feedback (`tf`) or framebuffer (`fb`).

Blog posts:

* [Particles with Transform Feedback in WebGL2](https://minzhenzh.github.io/work/webgl2-transform-feedback-particles/)
* [The Same Particles, on Framebuffers, in WebGL2](https://minzhenzh.github.io/work/webgl2-framebuffer-particles/)

## Run

```bash
npm install
npm run dev
```

Pick a demo and a solver from the dropdowns in the top-left corner, or open `http://localhost:5173/?demo=<name>&solver=<tf|fb>`.

## Demos

| demo | file | solver |
|---|---|---|
| `snow` | `demo/snow.js` | tf, fb |
| `rain` | `demo/rain.js` | tf, fb |
| `leaves` | `demo/leaves.js` | tf, fb |
| `flowers` | `demo/flowers.js` | tf, fb |
| `arrows` | `demo/arrows.js` | tf, fb |
| `wavefront` | `demo/wavefrontField.js` | fb |
| `quad` | `demo/quad.js` | |

`arrows` is an inter stage demo: each arrow points along its particle's velocity.

Requires WebGL2 and the `EXT_color_buffer_float` extension.
