/**********************************

How it Works: scroll-driven isometric walkthrough of a build.

Each `[data-hiw-step]` panel maps to one scene (0..SCENES-1). Every object in
the scene has a pose per scene, and scrolling interpolates between them. The
scene is plain SVG drawn in the flat isometric style of the Buildpacks logo,
so it needs no WebGL or third-party libraries.

**********************************/

const SCENES = 8;
const SVG_NS = 'http://www.w3.org/2000/svg';

// Isometric projection: x runs down-right, z down-left and y up.
const UNIT = 100;
const COS30 = Math.cos(Math.PI / 6);
const iso = (x, y, z) => [(x - z) * COS30 * UNIT, ((x + z) / 2 - y) * UNIT];

// Like the logo marks: a solid left face, a right face that fades from a
// light tint into the base colour, and a pale top.
const MATERIALS = {
  blue: { left: '#47529D', right: ['#8896DB', '#47529D'], top: '#AEB6EA' },
  blueSoft: { left: '#8E98DA', right: ['#C5CBF2', '#8E98DA'], top: '#DCE0F8' },
  pink: { left: '#DE156C', right: ['#FC72C7', '#DE156C'], top: '#F7A6CD' },
  pinkSoft: { left: '#EC70A8', right: ['#FDB9DD', '#EC70A8'], top: '#FBD5E7' },
  navy: { left: '#252960', right: ['#757CBA', '#252960'], top: '#575D9C' },
  teal: { left: '#1BB9A5', right: ['#8BE6DA', '#1BB9A5'], top: '#B4F0E8' },
  amber: { left: '#E8962A', right: ['#FFCD7D', '#E8962A'], top: '#FFE1B0' },
  lavender: { left: '#B4BAE7', right: ['#D9DCF6', '#B4BAE7'], top: '#E6E8F9', edge: '#D2D6F3' },
  paper: { left: '#D6D9ED', right: ['#F4F5FB', '#D6D9ED'], top: '#FFFFFF' },
  cache: { left: '#C7CAE2', right: ['#FAFAFE', '#C7CAE2'], top: '#FFFFFF' },
  gray: { left: '#B5B2C2', right: ['#DFDDE7', '#B5B2C2'], top: '#E8E7EF' },
  red: { left: '#D9363E', right: ['#F7A0A4', '#D9363E'], top: '#F9BEC1' },
};

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * t;
// Smootherstep: gentle start and finish without a steep middle
const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const offset = (p, x = 0, y = 0, z = 0) => [p[0] + x, p[1] + y, p[2] + z];
const round = (n) => Math.round(n * 100) / 100;

const root = document.querySelector('[data-hiw]');
if (root) init(root);

function init(root) {
  const steps = Array.from(root.querySelectorAll('[data-hiw-step]'));
  const railItems = Array.from(root.querySelectorAll('[data-hiw-rail]'));
  const progressBar = root.querySelector('[data-hiw-progress]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const last = steps.length - 1;
  let active = -1;

  function setActive(index) {
    if (index === active) return;
    active = index;
    steps.forEach((el, i) => el.classList.toggle('is-active', i === index));
    railItems.forEach((el, i) => {
      el.classList.toggle('is-active', i === index);
      el.classList.toggle('is-done', i < index);
      if (i === index) el.setAttribute('aria-current', 'step');
      else el.removeAttribute('aria-current');
    });
    // Keep the active phase visible when the rail scrolls horizontally
    const item = railItems[index];
    const rail = item && item.closest('ol');
    if (rail && rail.scrollWidth > rail.clientWidth) {
      const left = item.parentElement.offsetLeft - (rail.clientWidth - item.offsetWidth) / 2;
      rail.scrollTo({ left, behavior: reduced.matches ? 'auto' : 'smooth' });
    }
  }

  railItems.forEach((el, i) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      steps[i].scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'center' });
      history.replaceState(null, '', `#${steps[i].id}`);
    });
  });

  // Continuous progress: equals `i` when step i is centred in the viewport.
  function readProgress() {
    const mid = window.innerHeight / 2;
    let progress = 0;
    for (let i = 0; i < steps.length; i++) {
      const rect = steps[i].getBoundingClientRect();
      if (rect.top <= mid) progress = i + Math.min(1, (mid - rect.top) / rect.height) - 0.5;
    }
    return clamp(progress, 0, last);
  }

  let target = readProgress();
  setActive(Math.round(target));

  const canvas = root.querySelector('[data-hiw-canvas]');
  let stage = null;
  try {
    stage = createStage(canvas, root.querySelector('[data-hiw-labels]'));
  } catch (e) {
    stage = null;
  }

  if (!stage) {
    root.classList.add('hiw--static');
    return;
  }
  root.classList.add('hiw--ready');

  // Step text fades and drifts with the scroll instead of toggling
  const cards = steps.map((el) => el.querySelector('.hiw-step__card'));
  function updateCards(progress) {
    if (reduced.matches) return;
    cards.forEach((card, i) => {
      const distance = Math.abs(progress - i);
      card.style.opacity = (0.25 + 0.75 * (1 - ease(clamp(distance / 0.65)))).toFixed(3);
      card.style.transform = `translateY(${(clamp(i - progress, -1, 1) * 18).toFixed(1)}px)`;
    });
  }

  let shown = target;
  let running = false;
  let then = 0;

  function draw() {
    const progress = reduced.matches ? Math.round(shown) : shown;
    updateCards(progress);
    stage.render(progress);
    if (progressBar) progressBar.style.transform = `scaleX(${(progress / last).toFixed(4)})`;
  }

  // Ease towards the scroll position, then stop until the next scroll
  function frame(now) {
    const dt = clamp((now - then) / 1000, 0, 0.1);
    then = now;
    shown += (target - shown) * (1 - Math.exp(-dt * 4.5));
    if (reduced.matches || Math.abs(target - shown) < 0.0005) shown = target;
    draw();
    if (shown !== target) requestAnimationFrame(frame);
    else running = false;
  }

  window.addEventListener('scroll', () => {
    target = readProgress();
    setActive(Math.round(target));
    if (!running) {
      running = true;
      then = performance.now();
      requestAnimationFrame(frame);
    }
  }, { passive: true });

  // Pause the ambient animations while the scene is off screen
  new IntersectionObserver(([entry]) => {
    stage.svg.classList.toggle('is-paused', !entry.isIntersecting);
  }).observe(canvas);

  new ResizeObserver(() => {
    stage.resize();
    draw();
  }).observe(canvas);
}

function make(tag, attrs = {}, parent = null) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  if (parent) parent.appendChild(node);
  return node;
}

function points(corners) {
  return corners.map((corner) => iso(...corner).map(round).join(',')).join(' ');
}

// Path through the projected corners with each corner rounded off
function roundedPath(corners, radius) {
  const p = corners.map((corner) => iso(...corner));
  return p.map((cur, i) => {
    const [ax, ay] = toward(cur, p[(i + p.length - 1) % p.length], radius);
    const [bx, by] = toward(cur, p[(i + 1) % p.length], radius);
    return `${i ? 'L' : 'M'}${round(ax)} ${round(ay)}Q${round(cur[0])} ${round(cur[1])} ${round(bx)} ${round(by)}`;
  }).join('') + 'Z';
}

function toward([x, y], [tx, ty], radius) {
  const length = Math.hypot(tx - x, ty - y) || 1;
  const t = Math.min(radius, length / 2) / length;
  return [x + (tx - x) * t, y + (ty - y) * t];
}

function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const channel = (shift) => Math.round(lerp((pa >> shift) & 255, (pb >> shift) & 255, t));
  return `#${((1 << 24) | (channel(16) << 16) | (channel(8) << 8) | channel(0)).toString(16).slice(1)}`;
}

function createStage(host, labelHost) {
  const svg = make('svg', { class: 'hiw-svg', focusable: 'false' });
  host.prepend(svg);
  const defs = make('defs', {}, svg);
  const camera = make('g', {}, svg);
  const compactQuery = window.matchMedia('(max-width: 991.98px)');

  /* Shapes */

  const gradients = new Map();
  function gradient([from, to], horizontal = false) {
    const key = `${from}${to}${horizontal}`;
    if (!gradients.has(key)) {
      const id = `hiw-gradient-${gradients.size}`;
      const node = make('linearGradient', { id, x1: 0, y1: 0, x2: horizontal ? 1 : 0, y2: horizontal ? 0 : 1 }, defs);
      make('stop', { offset: 0, 'stop-color': from }, node);
      make('stop', { offset: 1, 'stop-color': to }, node);
      gradients.set(key, `url(#${id})`);
    }
    return gradients.get(key);
  }

  function polygon(parent, corners, fill, attrs = {}) {
    return make('polygon', { points: points(corners), fill, ...attrs }, parent);
  }

  // Cuboid standing on its base, centred on the origin
  function box(parent, w, h, d, mat) {
    const group = make('g', {}, parent);
    const [x0, x1, z0, z1] = [-w / 2, w / 2, -d / 2, d / 2];
    // The left face doubles as the silhouette, which hides seams between faces
    polygon(group, [[x0, 0, z1], [x1, 0, z1], [x1, 0, z0], [x1, h, z0], [x0, h, z0], [x0, h, z1]], mat.left);
    polygon(group, [[x1, 0, z1], [x1, 0, z0], [x1, h, z0], [x1, h, z1]], gradient(mat.right));
    polygon(group, [[x0, h, z0], [x1, h, z0], [x1, h, z1], [x0, h, z1]], mat.top, mat.edge ? { class: 'hiw-edge', stroke: mat.edge } : {});
    return group;
  }

  // A buildpack, drawn like the marks in the logo: an open-topped cube
  function pack(parent, s, mat) {
    const group = make('g', {}, parent);
    const [x0, x1, z0, z1] = [-s / 2, s / 2, -s / 2, s / 2];
    const radius = s * 13;
    make('path', {
      d: roundedPath([[x0, s, z1], [x0, 0, z1], [x1, 0, z1], [x1, 0, z0], [x1, s, z0], [x1, s, z1]], radius),
      fill: mat.left,
    }, group);
    make('path', {
      d: roundedPath([[x1, s, z1], [x1, 0, z1], [x1, 0, z0], [x1, s, z0]], radius),
      fill: gradient(mat.right),
    }, group);
    return group;
  }

  // Upright prism with a regular polygon base; `angle` turns it about y
  function prism(parent, r, h, sides, mat, angle = Math.PI / 12) {
    const group = make('g', {}, parent);
    const ring = Array.from({ length: sides }, (_, i) => {
      const t = angle + (i / sides) * Math.PI * 2;
      return [r * Math.cos(t), r * Math.sin(t)];
    });
    ring.forEach(([ax, az], i) => {
      const [bx, bz] = ring[(i + 1) % sides];
      const t = angle + ((i + 0.5) / sides) * Math.PI * 2;
      const [nx, nz] = [Math.cos(t), Math.sin(t)];
      if (nx + nz <= 0.001) return; // faces away from the viewer
      const fill = mix(mat.left, mat.right[0], clamp((nx - nz + 1) / 2) * 0.8);
      polygon(group, [[ax, 0, az], [bx, 0, bz], [bx, h, bz], [ax, h, az]], fill, { stroke: fill, 'stroke-width': 0.6 });
    });
    polygon(group, ring.map(([x, z]) => [x, h, z]), mat.top, { stroke: mat.top, 'stroke-width': 0.6 });
    return group;
  }

  // Radii of a horizontal circle once projected
  const ellipse = (r) => [Math.SQRT2 * r * COS30 * UNIT, (Math.SQRT2 * r * UNIT) / 2];

  function cylinder(parent, r, h, mat, bands) {
    const group = make('g', {}, parent);
    const [rx, ry] = ellipse(r).map(round);
    const top = round(-h * UNIT);
    make('path', {
      d: `M${-rx} ${top}V0A${rx} ${ry} 0 0 0 ${rx} 0V${top}Z`,
      fill: gradient([mat.left, mat.right[0]], true),
    }, group);
    for (const y of bands) {
      const by = round(-y * UNIT);
      make('path', { d: `M${-rx} ${by}A${rx} ${ry} 0 0 0 ${rx} ${by}`, class: 'hiw-band' }, group);
    }
    make('ellipse', { cx: 0, cy: top, rx, ry, fill: mat.top, class: 'hiw-rim' }, group);
    return group;
  }

  function disc(parent, r, attrs) {
    const [rx, ry] = ellipse(r).map(round);
    return make('ellipse', { cx: 0, cy: 0, rx, ry, ...attrs }, parent);
  }

  // Short coloured bars that read as lines of code on a surface
  function codeLines(parent, w, d, y, count, seed, colors) {
    const step = d / (count + 1);
    for (let i = 0; i < count; i++) {
      const x0 = -w / 2 + 0.1 + ((seed + i) % 3) * 0.09;
      const x1 = Math.min(w / 2 - 0.08, x0 + w * (0.32 + ((seed * 7 + i * 5) % 5) / 12));
      const z = -d / 2 + step * (i + 1);
      polygon(parent, [[x0, y, z - 0.026], [x1, y, z - 0.026], [x1, y, z + 0.026], [x0, y, z + 0.026]], colors[(seed + i) % colors.length]);
    }
  }

  // The 12 edges of a box: the three behind its contents, or the other nine
  function frame(parent, w, h, d, part) {
    const group = make('g', { class: `hiw-frame hiw-frame--${part}` }, parent);
    const [x0, x1, z0, z1] = [-w / 2, w / 2, -d / 2, d / 2];
    const back = [[x0, 0, z0], [x1, 0, z0], [x0, 0, z0], [x0, 0, z1], [x0, 0, z0], [x0, h, z0]];
    const front = [
      [x0, h, z0], [x1, h, z0], [x1, h, z0], [x1, h, z1], [x1, h, z1], [x0, h, z1], [x0, h, z1], [x0, h, z0],
      [x1, 0, z0], [x1, 0, z1], [x1, 0, z1], [x0, 0, z1],
      [x1, 0, z0], [x1, h, z0], [x1, 0, z1], [x1, h, z1], [x0, 0, z1], [x0, h, z1],
    ];
    const edges = part === 'back' ? back : front;
    for (let i = 0; i < edges.length; i += 2) {
      const [ax, ay] = iso(...edges[i]).map(round);
      const [bx, by] = iso(...edges[i + 1]).map(round);
      make('line', { x1: ax, y1: ay, x2: bx, y2: by }, group);
    }
    return group;
  }

  /* Pose tracks */

  const tracks = [];

  // keys: { sceneIndex: { p, s, o, g, arc, via, d, e } }. Unset scenes
  // inherit the previous pose. `g` fades in the object's alternate look.
  // The rest only shape the transition into that scene: `arc` lifts the
  // object mid-way, `via` curves its path through a point, and it runs
  // between `d` and `e` (0..1) of the scroll from the previous scene.
  // `on` lists the scenes where the object's ambient animation runs.
  function track(node, keys, { parent = null, alt = null, on = [] } = {}) {
    const first = keys[Math.min(...Object.keys(keys).map(Number))];
    let prev = { p: [0, 0, 0], s: 1, o: 1, g: 0, ...first };
    const poses = [];
    for (let i = 0; i < SCENES; i++) {
      const { arc = 0, via = null, d = 0, e = 1, ...rest } = keys[i] || {};
      prev = { ...prev, ...rest };
      poses.push({ ...prev, arc, via, d, e });
    }
    const entry = { node, poses, parent, alt, on, world: [0, 0, 0], scale: 1 };
    tracks.push(entry);
    return entry;
  }

  // An object is an outer group positioned by its track around an inner
  // group that its ambient animation can move freely.
  function object(parent, build, keys, options = {}) {
    const node = make('g', {}, parent.node || parent);
    const inner = make('g', { class: options.float ? 'hiw-float' : '' }, node);
    build(inner);
    let alt = null;
    if (options.alt) {
      alt = make('g', { opacity: 0 }, inner);
      options.alt(alt);
    }
    return track(node, keys, { ...options, alt, parent: parent.node ? parent : null });
  }

  function applyTrack(entry, i, f, current) {
    const a = entry.poses[i];
    const b = entry.poses[Math.min(i + 1, SCENES - 1)];
    const k = ease(clamp((f - b.d) / (b.e - b.d)));

    // Quadratic curve through `via`, otherwise a straight line with an arc
    const p = b.via
      ? a.p.map((n, axis) => (1 - k) * (1 - k) * n + 2 * (1 - k) * k * b.via[axis] + k * k * b.p[axis])
      : a.p.map((n, axis) => lerp(n, b.p[axis], k) + (axis === 1 ? Math.sin(Math.PI * k) * b.arc : 0));
    const s = lerp(a.s, b.s, k);
    // Objects show up early in their move and disappear late, so they stay
    // solid while travelling
    let fade = k;
    if (a.o === 0 && b.o > 0) fade = clamp(k * 2.5);
    else if (b.o === 0 && a.o > 0) fade = clamp((k - 0.6) * 2.5);
    const opacity = lerp(a.o, b.o, fade);
    const [x, y] = iso(...p);
    entry.node.setAttribute('transform', `translate(${round(x)} ${round(y)}) scale(${s.toFixed(4)})`);
    entry.node.setAttribute('opacity', opacity.toFixed(3));
    entry.node.style.display = opacity < 0.005 ? 'none' : '';
    // A change of look leads the move
    if (entry.alt) entry.alt.setAttribute('opacity', lerp(a.g, b.g, clamp(f * 3)).toFixed(3));
    entry.node.classList.toggle('is-on', entry.on.includes(current));

    // Where it ends up in the world, for labels and beams
    const parent = entry.parent;
    entry.scale = parent ? parent.scale * s : s;
    entry.world = parent ? offset(parent.world, ...p.map((n) => n * parent.scale)) : p;
    entry.opacity = parent ? parent.opacity * opacity : opacity;
  }

  /* Scene */

  const TOP = 0.32; // height of the builder platform and the run image
  const LAYER = { w: 1.7, h: 0.24, d: 1.4, gap: 0.04 };
  const slotY = (i) => TOP + LAYER.gap + i * (LAYER.h + LAYER.gap);
  const IMAGE_H = slotY(5) + 0.1;
  const PACK = 0.66;
  const DOC = { w: 0.9, h: 0.05, d: 1.15 };
  const LIFECYCLE = [-1.45, TOP, 0.95];
  const CACHE = [3.2, 0, 1.25];
  const ASIDE = [1.35, TOP, 1.0]; // source code, out of the way during the build
  const IMAGE_HOME = [-0.6, 0, -0.6];

  const ground = make('g', {}, camera);
  const beams = make('g', {}, camera);
  const upper = make('g', {}, camera);
  const near = make('g', {}, camera);

  // A shadow grounds the floating source code in the first scene
  object(ground, (g) => disc(g, 0.62, { class: 'hiw-shadow' }), {
    0: { p: [0.1, 0, -0.1] },
    1: { o: 0, s: 0.7 },
  });

  // Builder: the build-time base image everything runs on
  const platform = object(ground, (g) => box(g, 4.2, TOP, 3.2, MATERIALS.lavender), {
    0: { p: [0, -0.6, 0], s: 0.92, o: 0 },
    1: { p: [0, 0, 0], s: 1, o: 1 },
    5: { p: [0, -0.6, 0], s: 0.92, o: 0, e: 0.5 },
  });

  // Build cache: a volume beside the builder that outlives every build
  const cache = object(ground, (g) => cylinder(g, 0.44, 0.62, MATERIALS.cache, [0.08, 0.3, 0.52]), {
    0: { p: offset(CACHE, 0, -0.7), o: 0 },
    3: { p: CACHE, o: 1 },
    5: { p: offset(CACHE, 0, -0.7), o: 0, e: 0.5 },
  });

  // The app image: everything inside moves as one in the last scene
  const image = object(upper, () => {}, {
    0: { p: [0, 0, 0] },
    7: { p: IMAGE_HOME, s: 0.72 },
  });

  const frameSize = [LAYER.w + 0.34, IMAGE_H, LAYER.d + 0.34];
  const frameKeys = {
    0: { s: 1.1, o: 0 },
    5: { s: 1, o: 1, d: 0.45 },
  };
  object(image, (g) => frame(g, ...frameSize, 'back'), frameKeys);

  // The run image from export; during rebase it is flagged and replaced
  const runImage = object(image, (g) => box(g, 1.9, TOP, 1.6, MATERIALS.navy), {
    0: { p: [0, -0.6, 0], o: 0 },
    5: { p: [0, 0, 0], o: 1, d: 0.45 },
    6: { p: [-1.65, 0, 1.65], s: 0.75, g: 1, o: 0.9, d: 0.15 },
    7: { o: 0 },
  }, { alt: (g) => box(g, 1.9, TOP, 1.6, MATERIALS.red) });

  // Same base with a fresh band around it, stacked bottom to top
  const patchedRunImage = object(image, (g) => {
    [[1.9, 0.19, 1.6, MATERIALS.navy], [1.94, 0.07, 1.64, MATERIALS.teal], [1.9, TOP - 0.26, 1.6, MATERIALS.navy]]
      .reduce((y, [w, h, d, mat]) => {
        box(g, w, h, d, mat).setAttribute('transform', `translate(0 ${round(-y * UNIT)})`);
        return y + h;
      }, 0);
  }, {
    0: { p: [2.6, 0, -2.6], o: 0 },
    6: { p: [0, 0, 0], o: 1, d: 0.4 },
  });

  // Layers, bottom to top. Runtimes come out of the buildpacks, dependencies
  // come back from the cache and the app layer is made from the source code.
  const packs = [
    { name: 'Node.js', mat: MATERIALS.blue, slot: [-1.3, TOP, -1.0], hover: [-1.75, 1.45, -0.45], pass: true },
    { name: 'Python', mat: MATERIALS.pink, slot: [0, TOP, -1.0], hover: [1.6, 2.0, -1.6], pass: true },
    { name: 'Java', mat: MATERIALS.navy, slot: [1.3, TOP, -1.0], pass: false },
  ];
  const slot = (i) => ({ p: [0, slotY(i), 0], s: 1, o: 1 });
  // The layers settle onto the run image during export, and lift while the
  // base is swapped underneath them during rebase
  const settle = { arc: 0.2, d: 0.35 };
  const lift = { arc: 0.45, d: 0.1 };
  // Runtimes rise out of the top of their buildpack, then arc over
  const fromPack = (bp) => ({ p: offset(bp.hover, 0, 0.12), s: 0.32, o: 0 });
  const outOfPack = (bp, i, d) => ({ ...slot(i), via: offset(bp.hover, 0, 2.2), d });
  const fromCache = { p: offset(CACHE, 0, 0.35), s: 0.3, o: 0 };
  const layers = [
    { name: 'Node.js runtime', mat: MATERIALS.blue, keys: { 0: fromPack(packs[0]), 4: outOfPack(packs[0], 0, 0) } },
    { name: 'node_modules', mat: MATERIALS.blueSoft, keys: { 0: fromCache, 3: { ...slot(1), o: 0.45, arc: 0.9, d: 0.1 }, 4: { o: 1, d: 0.2 } } },
    { name: 'Python runtime', mat: MATERIALS.pink, keys: { 0: fromPack(packs[1]), 4: outOfPack(packs[1], 2, 0.3) } },
    { name: 'Python packages', mat: MATERIALS.pinkSoft, keys: { 0: fromCache, 3: { ...slot(3), o: 0.45, arc: 0.9, d: 0.3 }, 4: { o: 1, d: 0.45 } } },
    { name: 'Your app', mat: MATERIALS.teal, code: true, keys: { 0: { p: offset(ASIDE, 0, 0.1), s: 0.45, o: 0 }, 4: { ...slot(4), arc: 0.35, d: 0.6 } } },
  ].map((layer) => ({
    ...layer,
    track: object(image, (g) => {
      box(g, LAYER.w, LAYER.h, LAYER.d, layer.mat);
      if (layer.code) codeLines(g, LAYER.w, LAYER.d, LAYER.h, 5, 2, ['#FFFFFF', MATERIALS.navy.left]);
    }, { ...layer.keys, 5: settle, 6: lift }),
  }));

  const frameFront = object(image, (g) => frame(g, ...frameSize, 'front'), frameKeys);

  // Lifecycle: ships inside the builder and orchestrates every phase
  const lifecycle = object(upper, (g) => {
    disc(g, 0.62, { class: 'hiw-pulse' });
    prism(g, 0.36, 0.2, 6, MATERIALS.amber);
    prism(g, 0.2, 0.07, 6, { ...MATERIALS.amber, top: '#FFF1D6' }).setAttribute('transform', `translate(0 ${-0.2 * UNIT})`);
  }, {
    0: { p: offset(LIFECYCLE, 0, -0.5), o: 0 },
    1: { p: LIFECYCLE, o: 1, d: 0.45 },
    5: { p: offset(LIFECYCLE, 0, -0.6), o: 0, e: 0.5 },
  }, { on: [2, 3, 4] });

  // Buildpacks, in the order the builder lists them
  packs.forEach((bp, i) => {
    const keys = {
      0: { p: offset(bp.slot, 0, 2.6), o: 0 },
      1: { p: bp.slot, o: 1, d: 0.12 * i },
    };
    if (bp.pass) {
      keys[2] = { p: offset(bp.slot, 0, 0.22), d: 0.1 * i };
      keys[3] = { p: bp.hover, arc: 0.3 };
      keys[5] = { p: offset(bp.hover, 0, 1.6), o: 0, e: 0.6 };
    } else {
      keys[2] = { g: 1, d: 0.3 };
      keys[3] = { p: offset(bp.slot, 0, -0.6), o: 0 };
    }
    bp.track = object(upper, (g) => pack(g, PACK, bp.mat), keys, {
      alt: bp.pass ? null : (g) => pack(g, PACK, MATERIALS.gray),
      float: bp.pass,
      on: [3, 4],
    });
  });

  // App source code: three files, which spread out to be inspected
  const files = [
    { name: 'package.json', spread: [-0.55, TOP, 0.45], match: MATERIALS.blue.left },
    { name: 'requirements.txt', spread: [0.85, TOP, 0.05], match: MATERIALS.pink.left },
    { name: 'app.js', spread: [0.4, TOP, 1.3] },
  ];
  const fan = [[0, 0, 0], [0.1, 0.1, -0.1], [0.2, 0.2, -0.2]];
  const fanned = (i, base, s) => offset(base, ...fan[i].map((n) => n * s));
  const [dx, dz] = [DOC.w / 2, DOC.d / 2];
  files.forEach((file, i) => {
    file.track = object(near, (g) => {
      box(g, DOC.w, DOC.h, DOC.d, MATERIALS.paper);
      codeLines(g, DOC.w, DOC.d, DOC.h, 6, i, [MATERIALS.pink.left, MATERIALS.blue.left, MATERIALS.navy.left, MATERIALS.teal.left]);
    }, {
      0: { p: fanned(i, [0, 0.42, 0], 1.2), s: 1.2 },
      1: { p: fanned(i, [-0.3, 0, 2.6], 0.8), s: 0.8, arc: 0.3, d: 0.04 * i },
      // A matching file lights up in its buildpack's colour
      2: { p: file.spread, s: 0.7, g: 1, arc: 0.4, d: 0.08 * i },
      3: { p: fanned(i, ASIDE, 0.55), s: 0.55, g: 0, arc: 0.3 },
      4: { p: offset(ASIDE, -0.35, 0.6, -0.35), s: 0.4, o: 0, arc: 0.2, d: 0.55 },
    }, {
      float: true,
      on: [0],
      alt: file.match && ((g) => polygon(g, [[-dx, DOC.h, -dz], [dx, DOC.h, -dz], [dx, DOC.h, dz], [-dx, DOC.h, dz]], 'none', {
        class: 'hiw-match',
        stroke: file.match,
      })),
    });
  });

  // Run anywhere: hexagonal pads, each receiving a copy of the image
  const destinations = [
    { name: 'Kubernetes', icon: 'fa-cubes', mat: MATERIALS.blue, at: [-0.3, 0, 2.5] },
    { name: 'Cloud platform', icon: 'fa-cloud', mat: MATERIALS.pink, at: [1.1, 0, 1.1] },
    { name: 'Your laptop', icon: 'fa-laptop', mat: MATERIALS.teal, at: [2.5, 0, -0.3] },
  ];
  destinations.forEach((dest, i) => {
    dest.track = object(near, (g) => prism(g, 0.78, 0.14, 6, dest.mat), {
      0: { p: offset(dest.at, 0, -0.4), o: 0 },
      7: { p: dest.at, o: 1, d: 0.1 * i },
    });
  });
  destinations.forEach((dest, i) => {
    object(near, (g) => {
      const parts = [[0.66, 0.1, 'navy'], [0.6, 0.055, 'blue'], [0.6, 0.055, 'blueSoft'], [0.6, 0.055, 'pink'], [0.6, 0.055, 'pinkSoft'], [0.6, 0.055, 'teal']];
      let y = 0;
      for (const [w, h, mat] of parts) {
        box(g, w, h, w * 0.82, MATERIALS[mat]).setAttribute('transform', `translate(0 ${round(-y * UNIT)})`);
        y += h + 0.014;
      }
    }, {
      0: { p: offset(IMAGE_HOME, 0, 0.8), s: 0.3, o: 0 },
      7: { p: offset(dest.at, 0, 0.14), s: 1, o: 1, arc: 0.9, d: 0.3 + 0.1 * i },
    });
  });

  /* Beams: during detect each buildpack checks the source for its file */

  const beamList = packs.filter((bp) => bp.pass).map((bp, i) => ({
    from: bp.track,
    to: files[i].track,
    line: make('line', { class: 'hiw-beam', stroke: bp.mat.left }, beams),
  }));

  /* Labels: HTML tags pinned to positions in the scene */

  // `lead` pushes a right-aligned tag that far (in world units) to the right
  // of its point, joined to it by a leader line.
  const labels = [];
  function label(text, target, at, scenes, { align = 'top', status = {}, texts = {}, icon = '', className = '', lead = 0 } = {}) {
    const el = document.createElement('span');
    el.className = `hiw-tag hiw-tag--${align} ${lead ? 'hiw-tag--lead' : ''} ${className}`.trim();
    const textNode = document.createElement('span');
    textNode.textContent = text;
    if (icon) {
      const glyph = document.createElement('i');
      glyph.className = `fas ${icon}`;
      el.appendChild(glyph);
    }
    el.appendChild(textNode);
    labelHost.appendChild(el);
    labels.push({
      el,
      textNode,
      text,
      target,
      at,
      visible: Array.from({ length: SCENES }, (_, i) => (scenes.includes(i) ? 1 : 0)),
      status,
      texts,
      align,
      lead,
    });
  }

  // The right-hand corner of a layer, and how far its tag sits from it:
  // clear of the image outline once that appears
  const layerSide = [LAYER.w / 2, LAYER.h / 2, -LAYER.d / 2];
  const layerLead = 0.32;
  label('Your source code', files[2].track, [0, 0.25, 0], [0, 1]);
  label('Builder', platform, [2.1, 0, 1.6], [1], { align: 'below' });
  label('Lifecycle', lifecycle, [0, 0.5, 0], [1, 2, 3, 4], {
    texts: { 2: 'Lifecycle · detect', 3: 'Lifecycle · restore', 4: 'Lifecycle · build' },
  });
  packs.forEach((bp) => {
    label(bp.name, bp.track, [0, PACK + 0.14, 0], bp.pass ? [1, 2, 3, 4] : [1, 2], {
      status: bp.pass ? { 'is-pass': 2 } : { 'is-fail': 2 },
    });
  });
  files.slice(0, 2).forEach((file) => {
    label(file.name, file.track, [0.1, 0, DOC.d / 2 + 0.1], [2], { align: 'below', className: 'hiw-tag--file' });
  });
  label('Build cache', cache, [0, 0.8, 0], [3, 4]);
  layers.forEach((layer, i) => {
    const scenes = i === 1 || i === 3 ? [3, 4, 5] : [4, 5];
    const texts = i === 1 || i === 3 ? { 3: `${layer.name} · cached` } : {};
    label(layer.name, layer.track, layerSide, scenes, { align: 'right', texts, lead: layerLead });
  });
  label('Run image', runImage, [-0.95, TOP / 2, 0.8], [5], { align: 'left' });
  label('Vulnerable run image', runImage, [0, TOP + 0.1, 0], [6], { status: { 'is-warn': 6 } });
  label('Patched run image', patchedRunImage, [0.95, TOP / 2, -0.8], [6], { align: 'right', lead: layerLead, status: { 'is-pass': 6 } });
  // Above the outline's top corner
  label('App image (OCI)', frameFront, [-frameSize[0] / 2, IMAGE_H + 0.12, -frameSize[2] / 2], [5, 6, 7]);
  label('Your layers, unchanged', layers[4].track, layerSide, [6], { align: 'right', lead: layerLead });
  destinations.forEach((dest) => {
    label(dest.name, dest.track, [0.55, 0, 0.55], [7], { align: 'below', icon: dest.icon });
  });

  /* Camera: the region of the scene to fit, per scene */

  const shots = [
    { c: [10, -55], size: [540, 420] },
    { c: [0, -18], size: [700, 490] },
    { c: [0, -40], size: [640, 460] },
    { c: [20, -52], size: [720, 620] },
    { c: [20, -52], size: [720, 620] },
    { c: [55, -110], size: [620, 440] },
    { c: [-15, -110], size: [760, 440] },
    { c: [0, -35], size: [700, 520] },
  ];

  let width = 1;
  let height = 1;
  const view = { x: 0, y: 0, w: 1, h: 1 };
  const MAX_ZOOM = 1.6;

  function resize() {
    width = host.clientWidth || 1;
    height = host.clientHeight || 1;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    // On phones the step cards cover the lower part of the stage
    const compact = compactQuery.matches;
    view.w = width - 32;
    view.h = compact ? height * 0.5 : height - 48;
    view.x = width / 2;
    view.y = compact ? height * 0.32 : height / 2;
  }
  resize();

  const fitZoom = (shot) => Math.min(view.w / shot.size[0], view.h / shot.size[1], MAX_ZOOM);

  function render(progress) {
    const i = Math.min(Math.floor(progress), SCENES - 2);
    const f = clamp((progress - i - 0.05) / 0.9);
    const k = ease(f);
    const current = Math.round(progress);

    for (const entry of tracks) applyTrack(entry, i, f, current);

    // Camera
    const a = shots[i];
    const b = shots[i + 1];
    const zoom = Math.exp(lerp(Math.log(fitZoom(a)), Math.log(fitZoom(b)), k));
    const cx = lerp(a.c[0], b.c[0], k);
    const cy = lerp(a.c[1], b.c[1], k);
    camera.setAttribute('transform', `translate(${round(view.x)} ${round(view.y)}) scale(${zoom.toFixed(4)}) translate(${round(-cx)} ${round(-cy)})`);
    const toScreen = ([x, y]) => [view.x + (x - cx) * zoom, view.y + (y - cy) * zoom];

    // Annotations fade out early and in late, so neighbouring scenes'
    // annotations never overlap mid-scroll
    const crossfade = (from, to) => lerp(from, to, from > to ? clamp(k / 0.45) : clamp((k - 0.55) / 0.45));

    // Beams
    const beamOpacity = crossfade(i === 2 ? 1 : 0, i + 1 === 2 ? 1 : 0);
    beams.setAttribute('opacity', beamOpacity.toFixed(3));
    beams.style.display = beamOpacity < 0.005 ? 'none' : '';
    for (const beam of beamList) {
      const [x1, y1] = iso(...offset(beam.from.world, 0, PACK * 0.6 * beam.from.scale));
      const [x2, y2] = iso(...offset(beam.to.world, 0, DOC.h * beam.to.scale));
      beam.line.setAttribute('x1', round(x1));
      beam.line.setAttribute('y1', round(y1));
      beam.line.setAttribute('x2', round(x2));
      beam.line.setAttribute('y2', round(y2));
    }

    // Labels
    for (const tag of labels) {
      const opacity = crossfade(tag.visible[i], tag.visible[i + 1]) * Math.min(1, tag.target.opacity * 1.5);
      tag.el.style.opacity = opacity.toFixed(3);
      if (opacity < 0.01) continue;
      const text = tag.texts[current] || tag.text;
      if (tag.textNode.textContent !== text) {
        tag.textNode.textContent = text;
        tag.size = null;
      }
      for (const [cls, from] of Object.entries(tag.status)) tag.el.classList.toggle(cls, current >= from);
      if (!tag.size) tag.size = [tag.el.offsetWidth, tag.el.offsetHeight];

      const [x, y] = toScreen(iso(...offset(tag.target.world, ...tag.at.map((n) => n * tag.target.scale))));
      const lead = tag.lead * 2 * COS30 * UNIT * zoom * tag.target.scale;
      if (lead) tag.el.style.setProperty('--lead', `${round(lead)}px`);
      // Keep tags inside the stage
      const [w, h] = tag.size;
      const left = { top: w / 2, below: w / 2, right: 0, left: w }[tag.align];
      const up = { top: h, below: 0, right: h / 2, left: h / 2 }[tag.align];
      const sx = clamp(x + lead, left + 6, width - (w - left) - 6);
      const sy = clamp(y, up + 6, height - (h - up) - 6);
      const grow = (0.85 + 0.15 * opacity).toFixed(3);
      tag.el.style.transform = `translate(${round(sx - left)}px, ${round(sy - up)}px) scale(${grow})`;
    }
  }

  return { svg, render, resize };
}
