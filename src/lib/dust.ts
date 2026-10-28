/**
 * Dust — fine particles, drawn by the GPU, in two formations.
 *
 * ── What it draws ──────────────────────────────────────────────────────────
 *
 * **The night** is a landscape seen from a little above it: a height field of
 * travelling swells, sampled by a hundred thousand grains and projected in
 * perspective, so the far slopes fold into bright ridges on their own and the
 * near ones open out. Near grains are out of focus — larger, fainter, softer —
 * far ones are sharp and fade into the distance, and a few hang in the air.
 * It does not start lit. Every grain is in its place from the first frame, in
 * the dark, and the night comes up around it (`DustScene.form`): the crests
 * catch the light first and the far ridge before the near dunes, and it spreads
 * down the faces into the troughs, each grain at its own moment. Nothing flies
 * into place; only the light changes, which is why it is smooth at any frame
 * rate and from any moment it starts.
 *
 * **The morning** is the same dust let loose in the room: grains scattered at
 * random round the photograph, each wandering slowly on its own path, with the
 * air drifting them all a little toward the glass. They catch the daylight in a
 * soft band falling from the upper left and all but vanish outside it. The
 * night is a landscape; the morning is a room with the light on.
 *
 * Both are one colour at many alphas, and the colour is the caller's: ink on
 * the night, ink on the desk.
 *
 * ── Why a shader and no library ────────────────────────────────────────────
 *
 * The first version was the lab's canvas engine (`particle-core.ts`) and it
 * could afford three thousand grains, which read as specks rather than as a
 * surface. Here every grain's position is computed on the GPU from four fixed
 * numbers and the time, so the script uploads nothing per frame and the count
 * is a matter of fill rate rather than of JavaScript. WebGL 1 and GLSL 1.00, so
 * it runs anywhere WebGL does; where it does not, there is no dust, which is the
 * right failure for decoration.
 *
 * `seeds` is the only part that is not WebGL, and the only part a unit test
 * can reach: it is deterministic, so the still frame reduced motion gets is the
 * same frame every time.
 */

export type DustTone = 'night' | 'morning'

/**
 * Where the camera stands, how the dust is lit, and how far it has formed.
 * Every field is a uniform; the morning's motes read only `level` and `fade`.
 */
export interface DustScene {
  /** The far edge of the landscape, as a fraction of the canvas height. */
  horizon: number
  /** How high the camera stands above the floor of the swells. */
  camera: number
  /** How tall the swells are. */
  swell: number
  /** Overall brightness, zero to one. */
  level: number
  /** How far the grains behind the centred type are cleared away, zero to one. */
  clear: number
  /** How much taller the swells stand at the edges than in the middle, zero to one. */
  flank: number
  /** Where the dust fades out at the top and the bottom of the canvas, as fractions of its height. */
  fade: readonly [top: number, bottom: number]
  /** From the dark (0) to every grain lit (1); no grain moves to get there. */
  form: number
}

export interface Dust {
  resize(width: number, height: number, ratio: number): void
  draw(time: number, scene: DustScene): void
  dispose(): void
}

const LANDSCAPE = `
precision highp float;
attribute vec4 aSeed;
uniform vec2 uSize;
uniform float uRatio;
uniform float uTime;
uniform float uHorizon;
uniform float uCamera;
uniform float uSwell;
uniform float uLevel;
uniform float uClear;
uniform float uFlank;
uniform float uNear;
uniform vec2 uFade;
uniform float uForm;
varying float vAlpha;
varying float vSoft;

const float FAR = 10.0;
const float FOCUS = 2.8;
const float BLUR = 9.0;
const float GRAIN = 1.0;

float crest(float phase, float sharpness) {
  return pow(0.5 + 0.5 * cos(phase), sharpness);
}

// Three trains of swells crossing at angles, on a slow broad roll; taller at the edges than in the middle.
float surface(float x, float depth, float t, float edge) {
  float a = crest(x * 0.55 + depth * 0.9 - t * 0.32, 2.0);
  float b = crest(x * -0.42 + depth * 1.45 - t * 0.21 + 1.9, 3.0);
  float c = crest(x * 1.3 + depth * 2.6 - t * 0.5 + 4.1, 6.0);
  float roll = 0.5 + 0.5 * sin(x * 0.22 - depth * 0.35 + t * 0.07);
  return (a * 0.6 + b * 0.45 + c * 0.15 + roll * 0.45) * mix(1.0 - 0.5 * uFlank, 1.0 + 0.15 * uFlank, edge);
}

void main() {
  float across = aSeed.x;
  float depth = mix(uNear, FAR, aSeed.y);
  float r1 = aSeed.z;
  float r2 = aSeed.w;
  float focal = min(uSize.y * 0.9, uSize.x * 0.75);
  float x = across * (uSize.x * 0.5) / focal * depth;
  float edge = smoothstep(0.05, 1.0, abs(across));

  float height = surface(x, depth, uTime, edge) * uSwell;
  float behind = surface(x, depth + 0.08, uTime, edge) * uSwell;

  // Most grains lie on the surface; a few are lifted off it, and a few more hang in the air and drift.
  float mote = step(0.985, r2);
  float y = height + pow(r1, 7.0) * 0.45 + mote * (0.4 + r1 * 2.4);
  x += mote * sin(uTime * 0.11 + r1 * 6.2832) * 0.12;

  vec2 position = vec2(
    uSize.x * 0.5 + x / depth * focal,
    uSize.y * uHorizon + (uCamera - y) / depth * focal
  );
  gl_Position = vec4(position.x / uSize.x * 2.0 - 1.0, 1.0 - position.y / uSize.y * 2.0, 0.0, 1.0);

  // Depth of field: the circle of confusion grows with distance from the focal plane.
  float blur = abs(1.0 / depth - 1.0 / FOCUS) * BLUR;
  float size = GRAIN * (0.55 + 1.2 / depth) + blur;
  gl_PointSize = size * uRatio;
  vSoft = clamp(blur / (blur + 1.5), 0.0, 1.0);

  // Lit from behind the swells: crests, and faces turning away from the camera, catch it.
  float rim = clamp((height - behind) * 6.0, 0.0, 1.0);
  float light = clamp(height / (1.5 * max(uSwell, 0.001)), 0.0, 1.0);
  float glow = 0.22 + 0.78 * max(pow(light, 1.4), rim * 0.8);
  float distance = mix(1.0, 0.45, aSeed.y);
  // A grain out of focus spreads the same light over more of the screen.
  float spread = min(1.0, 2.2 * GRAIN / size);
  float sparkle = step(0.9972, r1) * (1.0 - mote) * 0.75;
  float alpha = glow * distance * spread + sparkle;

  vec2 type = (position - uSize * vec2(0.5, 0.46)) / (uSize * vec2(0.27, 0.3));
  alpha *= mix(1.0, smoothstep(0.5, 1.4, length(type)), uClear);
  float along = position.y / uSize.y;
  alpha *= smoothstep(0.0, uFade.x, along) * (1.0 - smoothstep(uFade.y, 1.0, along));

  // The night coming up out of the dark (uForm). No grain moves to get there: each is already in
  // its place, and only the light changes — the crests that catch the most of it and the far ridge
  // first, the troughs and the near dunes last, every grain at a moment of its own so the light
  // spreads over the swells rather than sweeping across them as a line. Coming up, a grain runs a
  // little past its own brightness and settles back, which is what makes the spreading read as light.
  float order = (1.0 - (glow - 0.22) / 0.78) * 0.55 + (1.0 - aSeed.y) * 0.2 + r2 * 0.25;
  float lit = smoothstep(order, order + 0.45, uForm * 1.45);
  alpha *= lit * (1.0 + 1.2 * lit * (1.0 - lit));
  vAlpha = alpha * uLevel * (1.0 - mote * 0.35);
}
`

const MOTES = `
precision highp float;
attribute vec4 aSeed;
uniform vec2 uSize;
uniform float uRatio;
uniform float uTime;
uniform float uLevel;
uniform vec2 uFade;
varying float vAlpha;
varying float vSoft;

const float TAU = 6.2831853;

void main() {
  // Where each grain lives: anywhere in the field, at random. Most are far and fine; a few are near and soft.
  vec2 home = vec2(aSeed.x / 2.5 + 0.5, aSeed.z);
  float depth = aSeed.y;
  float own = aSeed.w;

  // Its own slow wander about that home, on sines of unrelated periods, so no two grains keep step
  // and the field never settles into a pattern.
  float pace = mix(0.035, 0.09, own);
  float turn = own * TAU * 13.0;
  vec2 wander = vec2(
    sin(uTime * pace + turn) + 0.6 * sin(uTime * pace * 2.37 + turn * 1.9),
    cos(uTime * pace * 0.83 + turn * 1.3) + 0.6 * sin(uTime * pace * 1.91 + turn * 0.7)
  ) * mix(0.006, 0.028, depth);

  // And the room's still air: everything rises a little and drifts toward the glass, very slowly, round and round.
  vec2 air = vec2(uTime * mix(0.002, 0.006, own), -uTime * mix(0.001, 0.003, depth));
  vec2 at = fract(home + air) + wander;
  gl_Position = vec4(at.x * 2.0 - 1.0, 1.0 - at.y * 2.0, 0.0, 1.0);

  float size = mix(1.0, 5.0, depth * depth * depth);
  gl_PointSize = size * uRatio;
  vSoft = smoothstep(0.3, 0.9, depth);

  // The daylight through the glass wall: a broad soft band falling from the upper left, where the
  // dust catches it. Outside it a grain is barely there.
  float across = (at.x - 0.12) + (at.y - 0.5) * 0.62;
  float light = exp(-pow(across / 0.34, 2.0));
  float alpha = mix(0.1, 0.7, light) * mix(1.0, 0.55, depth);
  // A grain out of focus spreads the same ink over more of the paper.
  alpha *= min(1.0, 2.0 / size);
  // Faded out at every edge, so a grain coming round again never appears from nowhere.
  alpha *= smoothstep(0.0, 0.05, at.x) * (1.0 - smoothstep(0.95, 1.0, at.x));
  alpha *= smoothstep(0.0, uFade.x, at.y) * (1.0 - smoothstep(uFade.y, 1.0, at.y));
  vAlpha = alpha * uLevel;
}
`

const FRAGMENT = `
precision mediump float;
uniform vec3 uColor;
varying float vAlpha;
varying float vSoft;

void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float a = vAlpha * (1.0 - smoothstep(mix(0.55, 0.0, vSoft), 1.0, r));
  gl_FragColor = vec4(uColor * a, a);
}
`

/**
 * Four numbers a grain, from a seeded generator (mulberry32): across the view,
 * into it, and two for its own character. Weighted toward the near rows, which
 * the perspective spreads thinnest.
 */
export function seeds(count: number, seed = 7): Float32Array {
  let state = seed
  const random = () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const data = new Float32Array(count * 4)
  for (let index = 0; index < count; index += 1) {
    data[index * 4] = (random() * 2 - 1) * 1.25
    data[index * 4 + 1] = Math.pow(random(), 1.5)
    data[index * 4 + 2] = random()
    data[index * 4 + 3] = random()
  }
  return data
}

/**
 * Grains for a canvas of this size: the area decides, inside what a phone and
 * a wide screen can both fill. The morning's motes are scattered loose, and
 * read as dust in the light only while there are few of them.
 */
export function dustCount(width: number, height: number, tone: DustTone = 'night'): number {
  const area = width * height
  if (tone === 'morning') return Math.round(Math.min(7_000, Math.max(1_800, area / 300)))
  return Math.round(Math.min(120_000, Math.max(20_000, area / 11)))
}

/** `rgb(…)` or `rgba(…)`, as `getComputedStyle` reports a colour, to three channels from zero to one. */
export function channels(color: string): [number, number, number] {
  const [r = 0, g = 0, b = 0] = (color.match(/[\d.]+/g) ?? []).map(Number)
  return [r / 255, g / 255, b / 255]
}

export function createDust(
  canvas: HTMLCanvasElement,
  tone: DustTone,
  color: readonly [number, number, number],
): Dust | null {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
  })
  if (!gl) return null

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
  }
  const vertex = compile(gl.VERTEX_SHADER, tone === 'night' ? LANDSCAPE : MOTES)
  const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT)
  const program = gl.createProgram()
  if (!vertex || !fragment || !program) return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  const seed = gl.getAttribLocation(program, 'aSeed')
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.enableVertexAttribArray(seed)
  gl.vertexAttribPointer(seed, 4, gl.FLOAT, false, 0, 0)

  // The motes' program has no camera: those locations come back null, and setting a null location does nothing.
  const uniform = (name: string) => gl.getUniformLocation(program, name)
  const at = {
    size: uniform('uSize'),
    ratio: uniform('uRatio'),
    time: uniform('uTime'),
    horizon: uniform('uHorizon'),
    camera: uniform('uCamera'),
    swell: uniform('uSwell'),
    level: uniform('uLevel'),
    clear: uniform('uClear'),
    flank: uniform('uFlank'),
    near: uniform('uNear'),
    fade: uniform('uFade'),
    form: uniform('uForm'),
    color: uniform('uColor'),
  }
  gl.uniform3f(at.color, color[0], color[1], color[2])

  gl.enable(gl.BLEND)
  // Light on the night adds up, the way dust in a beam does; ink on paper covers.
  if (tone === 'night') gl.blendFunc(gl.ONE, gl.ONE)
  else gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.clearColor(0, 0, 0, 0)

  let width = 0
  let height = 0
  let count = 0

  return {
    resize(nextWidth, nextHeight, ratio) {
      width = Math.max(1, nextWidth)
      height = Math.max(1, nextHeight)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(at.size, width, height)
      gl.uniform1f(at.ratio, ratio)
      const next = dustCount(width, height, tone)
      if (next !== count) {
        count = next
        gl.bufferData(gl.ARRAY_BUFFER, seeds(count), gl.STATIC_DRAW)
      }
    },
    draw(time, scene) {
      // The nearest row is the one whose troughs land on the bottom edge, so the dust reaches it.
      const focal = Math.min(height * 0.9, width * 0.75)
      const near = (0.75 * (scene.camera - 0.45) * focal) / (height * (1 - scene.horizon))
      gl.uniform1f(at.time, time)
      gl.uniform1f(at.horizon, scene.horizon)
      gl.uniform1f(at.camera, scene.camera)
      gl.uniform1f(at.swell, scene.swell)
      gl.uniform1f(at.level, scene.level)
      gl.uniform1f(at.clear, scene.clear)
      gl.uniform1f(at.flank, scene.flank)
      gl.uniform1f(at.near, Math.min(1.2, Math.max(0.45, near)))
      gl.uniform2f(at.fade, scene.fade[0], scene.fade[1])
      gl.uniform1f(at.form, scene.form)
      gl.clear(gl.COLOR_BUFFER_BIT)
      if (count) gl.drawArrays(gl.POINTS, 0, count)
    },
    dispose() {
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
    },
  }
}
