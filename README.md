# webgl_engine (boids)

WebGL2 boids and velocity field demos, from flocking to a velocity/acceleration field that drives animated characters. Combines the old `boids_demo` and `velocity_field` branches, every file from both is kept.

## Run

```bash
npm install
npm run dev
```

Pick a demo from the dropdown in the bottom-left corner, or open `http://localhost:5173/?demo=<name>`.

## Demos

Showcase, the `flyEnemy` simulation on a water map:

| demo | file | |
|---|---|---|
| `flockDots` | `demo/flock.js` | boids drawn as dots |
| `flockFish` | `demo/flock.js` | boids drawn as fish |

Main stages:

| demo | file | |
|---|---|---|
| `flyEnemy` | `demo/flyEnemy.js` | 1. boids flocking around obstacles |
| `newSlowEnemy` | `demo/newSlowEnemy.js` | 2. agents following the wavefront |
| `isoVelAni` | `demo/isoVelAni.js` | 3. velocity field |
| `isoAccAni` | `demo/isoAccAni.js` | 4. acceleration field (default) |

Other test versions: `slowEnemy`, `aniEnemy`, `gridAni`, `grid`, `topdownVelAni`, `quad`.

`demo/gridHelper/gridHelper.html` is the grid editor. `demo/_boids/` holds archived reference pages, not part of the engine.

The images in `resources/` are test images, except `resources/kenney-fish/` (CC0, from Kenney's [Fish Pack](https://kenney.nl/assets/fish-pack)).
