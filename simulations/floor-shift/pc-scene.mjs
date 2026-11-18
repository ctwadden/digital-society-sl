const sceneUrl = new URL(import.meta.url);

function dependencyUrl(path) {
  const url = new URL(path, sceneUrl);
  const retry = sceneUrl.searchParams.get('retry');
  if (retry && /^[1-9]\d*$/.test(retry)) url.searchParams.set('retry', retry);
  return url.href;
}

const PARTS = {
  cpu: {
    label: 'CPU & cooler', spec: 'cpu',
    function: 'The CPU carries out program instructions. A cooler moves heat away so the chip can operate within its temperature limits.',
    desktop: 'Find the silver fins and fan above the CPU. The CPU package sits against the square socket on the motherboard.',
    laptop: 'Find the copper heat pipes that carry heat from the CPU to the fan and fins. The processor is commonly attached directly to the board.',
    separated: 'Separation exposes the chip position and its mounting area.',
    desktopSeparated: 'The fan and fins lift clear of the silver CPU package. The socket stays on the motherboard.',
  },
  ram: {
    label: 'Memory', spec: 'ram',
    function: 'RAM holds working data for open apps and files. Its contents normally disappear when power is off.',
    desktop: 'Find the two slim boards with black memory chips. Their gold contacts fit in the long slots beside the CPU.',
    laptop: 'Find the short memory boards lying flat beside the CPU. Some laptops attach memory chips directly to the motherboard.',
    separated: 'Separation exposes the contacts that carry data and power between the module and motherboard.',
  },
  storage: {
    label: 'SSD storage', spec: 'storage',
    function: 'An SSD keeps files and installed apps when power is off. NAND flash chips store data and a smaller controller manages reading and writing.',
    desktop: 'Find the short green board just above the graphics card. The two large packages represent NAND flash and the small package represents its controller.',
    laptop: 'Find the short green board toward the front of the main board. The two large packages represent NAND flash and the small package represents its controller.',
    separated: 'Separation shows the contacts at one end and the screw mount at the other.',
  },
  gpu: {
    label: 'Graphics', spec: 'gpu',
    function: 'The GPU builds images and can accelerate supported tasks such as 3D rendering. Integrated graphics can share system RAM. A dedicated GPU usually has its own video memory.',
    desktop: 'The example shows a separate card with two cooling fans in a motherboard expansion slot. Video ports are on its end bracket. A desktop with integrated graphics does not need this card.',
    laptop: 'The example shows a separate graphics chip with video memory chips around it. Other laptops integrate the GPU with the CPU in the same chip package.',
    separated: 'Separation isolates the graphics hardware from the rest of the board.',
  },
  motherboard: {
    label: 'Motherboard',
    function: 'The motherboard provides the connections that let the processor, memory, storage and other hardware exchange data. It also distributes power to connected parts.',
    desktop: 'The green board is fastened inside the tower. Sockets and long slots hold several of the other components.',
    laptop: 'The green board sits in the shallow chassis, behind the battery area. Internal layouts and repair access vary by model.',
    separated: 'In the separated view the board stays close to the chassis, revealing where the other modules connect.',
  },
  ports: {
    label: 'Ports & display', spec: 'ports',
    function: 'Ports connect devices such as an external display, headset or storage drive. Confirm both the connector shape and the features it supports.',
    desktop: 'The metal sockets at the case edge connect peripherals. The monitor is separate and has its own video connection to the computer.',
    laptop: 'The ports run along the chassis edge. The built-in display connects inside the hinge area. External display support depends on which ports the laptop provides.',
    separated: 'Separation makes the connector block and screen easier to locate.',
  },
};

const STYLE = `
  :host { display:block; min-inline-size:0; color:#13233d; font:inherit; }
  *, *::before, *::after { box-sizing:border-box; }
  .inspector { overflow:hidden; border:1px solid #bac3bf; border-radius:16px; background:#fffcf2; }
  .stage {
    position:relative; isolation:isolate; display:grid; place-items:center; block-size:clamp(250px, 46vw, 392px);
    overflow:hidden; background:radial-gradient(ellipse at 50% 37%, #3c5d6c, #1e3346 62%, #13243a 100%);
  }
  .stage[data-mode="text"] { block-size:auto; min-block-size:112px; padding:16px; color:#fff9e9; }
  .stage-note { display:grid; gap:4px; text-align:center; max-inline-size:36ch; font-size:.87rem; margin:0; }
  .stage-note strong { color:#ffdc64; font-size:1rem; }
  canvas { display:block; inline-size:100%; block-size:100%; cursor:grab; touch-action:pan-y; }
  canvas:active { cursor:grabbing; }
  canvas:focus-visible { outline:3px solid #ffdc42; outline-offset:-4px; }
  .tag, .reticle { position:absolute; pointer-events:none; z-index:1; }
  .tag {
    inset-block-start:10px; inset-inline-start:10px; inline-size:max-content; max-inline-size:calc(100% - 20px);
    color:#fff9e9; background:#13233ded; border:1px solid #6c8191; border-radius:6px;
    padding:5px 8px; font-size:.73rem; line-height:1.2;
  }
  .reticle {
    transform:translate(-50%, -50%); inline-size:23px; block-size:23px; border:2px solid #ffdc65;
    border-radius:50%; box-shadow:0 0 0 2px #172635; 
  }
  [hidden] { display:none !important; }
  .viewport-controls, .parts { display:flex; flex-wrap:wrap; align-items:center; gap:6px; padding:9px 12px; }
  .viewport-controls { background:#e6eeeb; border-block-end:1px solid #bac3bf; }
  .camera-controls { display:flex; flex-wrap:wrap; align-items:center; gap:6px; }
  @media (max-width:530px) {
    .camera-controls { order:1; flex-basis:100%; gap:4px; }
    .camera-controls button { min-inline-size:34px; padding-inline:7px; }
  }
  button {
    font:inherit; font-size:.79rem; font-weight:650; line-height:1.2; min-block-size:38px; min-inline-size:38px;
    padding:6px 10px; border:1px solid #7b8e9e; border-radius:7px; color:#13233d; background:#fffdf6; cursor:pointer;
  }
  button:hover { background:#e5f0ee; }
  button[aria-pressed="true"] { color:#fff9e9; background:#13233d; border-color:#13233d; }
  .parts button[aria-pressed="true"]::before { content:'✓ '; }
  button:focus-visible, input:focus-visible { outline:3px solid #125f8b; outline-offset:2px; }
  label { font-size:.78rem; line-height:1.2; display:flex; align-items:center; gap:5px; min-block-size:38px; }
  label input { inline-size:1.1rem; block-size:1.1rem; accent-color:#13233d; }
  .details { border-block-start:1px solid #d8dfd8; padding:13px 14px 15px; }
  .details h3 { margin:0 0 5px; font-size:1rem; line-height:1.25; }
  .context, .spec, .details p { overflow-wrap:anywhere; }
  .details p { margin:5px 0 0; font-size:.86rem; line-height:1.46; }
  .details .context { color:#46556c; font-size:.76rem; padding-block-end:4px; }
  .details .spec { font-weight:650; }
  .narrow-note { color:#46556c; }
`;

function element(tag, attrs = {}, text = '') {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  if (text) node.textContent = text;
  return node;
}

// Text and keyboard selection are initialized before graphics so both routes use the same state.
export async function createPCScene(container, { onSelect, reducedMotion = false } = {}) {
  const host = element('div', { 'data-pc-scene': '' });
  const shadow = host.attachShadow({ mode: 'open' });
  const inspector = element('section', { class: 'inspector', 'aria-label': 'Inside a computer' });
  const stage = element('div', { class: 'stage', 'data-mode': 'text' });
  const stageNote = element('p', { class: 'stage-note' });
  const title = element('strong', {}, 'Opening hardware viewer');
  const note = element('span', {}, 'The part buttons describe each component and its connections.');
  stageNote.append(title, note);
  const stageTag = element('span', { class: 'tag', 'aria-hidden': 'true', hidden: '' });
  const reticle = element('span', { class: 'reticle', 'aria-hidden': 'true', hidden: '' });
  stage.append(stageNote, stageTag, reticle);

  const cameraControls = element('div', { class: 'camera-controls', hidden: '', role: 'group', 'aria-label': '3D camera' });
  const controls = element('div', { class: 'viewport-controls' });
  const parts = element('div', { class: 'parts', role: 'group', 'aria-label': 'Computer parts' });
  const details = element('div', { class: 'details', role: 'status', 'aria-atomic': 'true' });
  const productName = element('p', { class: 'context' });
  const detailTitle = element('h3');
  const spec = element('p', { class: 'spec' });
  const description = element('p');
  const location = element('p');
  const viewDescription = element('p');
  const disclaimer = element('p', { class: 'narrow-note' }, 'Example hardware layout. Placement and proportions vary by computer.');
  const motionQuery = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
  let product = null;
  let kind = 'desktop';
  let selected = 'cpu';
  let exploded = false;
  let motionOff = Boolean(reducedMotion || motionQuery?.matches);
  let view = null;
  let disposed = false;
  const listeners = new AbortController();
  const failure = { mode: 'text', reason: 'Graphics are starting', renders: 0 };

  function listen(target, event, fn) {
    target?.addEventListener(event, fn, { signal: listeners.signal });
  }
  function button(parent, label, action, attrs) {
    const control = element('button', { type: 'button', ...attrs }, label);
    listen(control, 'click', action);
    parent.append(control);
    return control;
  }

  const explodeButton = button(
    controls, 'Separate parts', () => setExploded(!exploded), { 'aria-pressed': 'false' },
  );
  const motionLabel = element('label');
  const motionControl = element('input', { type: 'checkbox' });
  motionControl.checked = motionOff;
  motionLabel.append(motionControl, document.createTextNode('Reduce motion'));
  listen(motionControl, 'change', () => setReducedMotion(motionControl.checked));
  listen(motionQuery, 'change', event => setReducedMotion(event.matches));
  controls.append(cameraControls, motionLabel);
  const cameraActions = [
    ['↶', 'Orbit left', () => view?.orbit(-.28, 0)],
    ['↷', 'Orbit right', () => view?.orbit(.28, 0)],
    ['↑', 'Orbit up', () => view?.orbit(0, -.18)],
    ['↓', 'Orbit down', () => view?.orbit(0, .18)],
    ['−', 'Zoom out', () => view?.zoom(1.18)],
    ['+', 'Zoom in', () => view?.zoom(.85)],
    ['Reset view', 'Reset camera view', () => resetView()],
  ];
  for (const [label, name, action] of cameraActions) {
    button(cameraControls, label, action, { 'aria-label': name, title: name });
  }

  const partButtons = new Map();
  for (const [id, part] of Object.entries(PARTS)) {
    partButtons.set(id, button(parts, part.label, () => selectPart(id), { 'aria-pressed': 'false' }));
  }
  details.append(productName, detailTitle, spec, description, location, viewDescription, disclaimer);
  inspector.append(stage, controls, parts, details);
  shadow.append(element('style', {}, STYLE), inspector);
  container.append(host);

  function syncText() {
    const part = PARTS[selected];
    const shape = kind === 'laptop' ? 'Laptop cutaway' : 'Desktop cutaway';
    const state = exploded ? 'parts separated' : 'parts assembled';
    stageTag.textContent = `${part.label} · ${state}`;
    explodeButton.setAttribute('aria-pressed', String(exploded));
    for (const [id, control] of partButtons) control.setAttribute('aria-pressed', String(id === selected));
    productName.textContent = product?.name ? `${shape} · ${product.name}` : shape;
    detailTitle.textContent = part.label;
    const value = product?.specs?.[part.spec];
    const display = selected === 'ports' ? product?.specs?.display : '';
    spec.textContent = [value, display].filter(text => typeof text === 'string' && text).join(' · ');
    spec.hidden = !spec.textContent;
    description.textContent = part.function;
    location.textContent = part[kind];
    const separatorNote = kind === 'desktop' ? part.desktopSeparated ?? part.separated : part.separated;
    viewDescription.textContent = exploded ? `Separated. ${separatorNote}` : 'Assembled. Use Separate parts to inspect the connections.';
  }

  function setProduct(next) {
    if (disposed || !next) return;
    // A product object can be recreated by the host on every render.
    const nextKind = next.kind === 'laptop' ? 'laptop' : 'desktop';
    const shapeChanged = kind !== nextKind;
    kind = nextKind;
    const specChanged = product?.specs?.[PARTS[selected].spec] !== next.specs?.[PARTS[selected].spec]
      || (selected === 'ports' && product?.specs?.display !== next.specs?.display);
    const textChanged = product?.name !== next.name || specChanged || shapeChanged;
    product = next;
    if (textChanged) syncText();
    if (shapeChanged) view?.show(kind, exploded);
  }

  function selectPart(id) {
    if (disposed || !Object.hasOwn(PARTS, id) || id === selected) return;
    selected = id;
    syncText();
    view?.select(id);
    onSelect?.(id);
  }

  function setExploded(value) {
    if (disposed || Boolean(value) === exploded) return;
    exploded = Boolean(value);
    syncText();
    view?.separate(exploded, motionOff);
  }

  function setReducedMotion(value) {
    if (disposed) return;
    motionOff = Boolean(value);
    motionControl.checked = motionOff;
    if (motionOff) view?.separate(exploded, true);
  }

  function resetView() {
    if (!disposed) view?.reset();
  }

  function resize() {
    if (!disposed) view?.resize();
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    listeners.abort();
    view?.dispose();
    view = null;
    host.remove();
  }

  function fallback(message) {
    failure.reason = message;
    view?.dispose();
    view = null;
    stage.dataset.mode = 'text';
    stageNote.hidden = false;
    stageTag.hidden = true;
    reticle.hidden = true;
    cameraControls.hidden = true;
    motionLabel.hidden = true;
    title.textContent = 'Hardware guide';
    note.textContent = `${message}. Use the part buttons and Separate parts for the text view.`;
  }

  syncText();
  try {
    // An explicit retry must bypass failed browser module entries for the dependencies too.
    const [T, hardware] = await Promise.all([
      import(dependencyUrl('./vendor/three-r149.module.mjs')),
      import(dependencyUrl('./assets/scene/hardware.mjs')),
    ]);
    if (!disposed) {
      view = openHardwareView(T, hardware, stage, reticle, { selectPart, fallback, listen });
      view.show(kind, exploded);
      view.select(selected);
      stage.dataset.mode = '3d';
      stageNote.hidden = true;
      stageTag.hidden = false;
      cameraControls.hidden = false;
      view.resize();
    }
  } catch {
    if (!disposed) fallback('3D is unavailable on this device');
  }

  return {
    setProduct, selectPart, setExploded, setReducedMotion, resetView, resize, dispose,
    getMetrics: () => view?.metrics() ?? { ...failure, mode: disposed ? 'disposed' : 'text', kind, selected, exploded },
  };
}

function openHardwareView(T, { createHardwareKit, buildHardware }, stage, reticle, { selectPart, fallback, listen }) {
  const canvas = element('canvas', {
    tabindex: '0',
    'aria-label': 'Computer cutaway. Arrow keys orbit, plus and minus zoom, zero resets the camera. Use the part buttons for descriptions.',
  });
  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  T.ColorManagement.legacyMode = false;
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x122337, 0);
  const dpr = Math.min(globalThis.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(dpr);
  stage.prepend(canvas);

  const kit = createHardwareKit(T);
  const world = new T.Scene();
  const camera = new T.PerspectiveCamera(38, 1, .1, 55);
  const floor = createFloor(T);
  world.add(floor, new T.HemisphereLight(0xe4f6ff, 0x74828a, .79));
  for (const [color, intensity, position] of [
    [0xffedda, 1.65, [2, 6.5, 6]],
    [0x9dd5ee, .61, [-4, 2, 1]],
    [0xcae6ff, .88, [1, 3, -6]],
  ]) {
    const light = new T.DirectionalLight(color, intensity);
    light.position.set(...position);
    world.add(light);
  }

  const models = new Map();
  const target = new T.Vector3();
  const vector = new T.Vector3();
  const point = new T.Vector2();
  const ray = new T.Raycaster();
  const hitBuffer = [];
  const home = {
    desktop: { theta: .30, phi: 1.27, target: [-.12, -.03, .21], distance: 8.85, span: 3.55, floor: -2.17 },
    laptop: { theta: .32, phi: .91, target: [0, .89, -.13], distance: 8.55, span: 3.38, floor: -.31 },
  };
  let kind = 'desktop';
  let model = null;
  let selected = 'cpu';
  let desired = 0;
  let separation = 0;
  let animation = null;
  let pointer = null;
  let frame = 0;
  let width = 0;
  let height = 0;
  let renders = 0;
  let calls = 0;
  let triangles = 0;
  let peakCalls = 0;
  let peakTriangles = 0;
  let lastFrameMs = 0;
  let theta = 0;
  let phi = 0;
  let zoomFactor = 1;
  let dead = false;

  function setPose() {
    if (!model) return;
    for (const { group, home, offset } of model.objects) group.position.copy(home).addScaledVector(offset, separation);
  }

  function setCamera() {
    const preset = home[kind];
    target.set(...preset.target);
    target.z += kind === 'desktop' ? separation * .52 : 0;
    target.y += kind === 'laptop' ? separation * .08 : 0;
    const distance = Math.max(preset.distance, preset.span / (Math.tan(camera.fov * Math.PI / 360) * camera.aspect)) * zoomFactor;
    camera.position.set(
      target.x + distance * Math.sin(theta) * Math.sin(phi),
      target.y + distance * Math.cos(phi),
      target.z + distance * Math.cos(theta) * Math.sin(phi),
    );
    camera.lookAt(target);
    camera.updateMatrixWorld();
  }

  function findPart(x, y) {
    ray.setFromCamera(point.set(x, y), camera);
    hitBuffer.length = 0;
    ray.intersectObject(model.root, true, hitBuffer);
    for (const hit of hitBuffer) {
      let part = null;
      let visible = true;
      for (let object = hit.object; object; object = object.parent) {
        visible = visible && object.visible;
        part ??= object.userData.part;
      }
      if (visible) return part;
    }
    return null;
  }

  function placeReticle() {
    const marker = selected === 'cpu' && kind === 'desktop' && separation > .45 ? 'cpu-package' : selected;
    const group = model.clickable.get(marker);
    if (!group) {
      reticle.hidden = true;
      return;
    }
    let depth = .14;
    if (selected === 'cpu') depth = kind === 'laptop' || marker === 'cpu-package' ? .14 : .66;
    if (selected === 'gpu') depth = kind === 'laptop' ? .13 : .76;
    group.localToWorld(vector.set(selected === 'ram' ? .13 : 0, selected === 'ram' ? .17 : 0, depth));
    vector.project(camera);
    const onStage = vector.z < 1 && Math.abs(vector.x) < .96 && Math.abs(vector.y) < .93;
    const detected = onStage && findPart(vector.x, vector.y) === selected;
    reticle.hidden = !detected;
    if (detected) {
      reticle.style.left = `${(vector.x + 1) * 50}%`;
      reticle.style.top = `${(1 - vector.y) * 50}%`;
    }
  }

  function draw(now) {
    frame = 0;
    if (dead || !model || !width || !height || !stage.getClientRects().length) return;
    if (animation) {
      const progress = Math.min(1, (now - animation.from) / 320);
      const eased = progress * progress * (3 - 2 * progress);
      separation = animation.base + (desired - animation.base) * eased;
      if (progress === 1) animation = null;
    }
    setPose();
    setCamera();
    try {
      const started = performance.now();
      renderer.render(world, camera);
      lastFrameMs = performance.now() - started;
      calls = renderer.info.render.calls;
      triangles = renderer.info.render.triangles;
      peakCalls = Math.max(calls, peakCalls);
      peakTriangles = Math.max(triangles, peakTriangles);
      renders += 1;
      placeReticle();
    } catch {
      fallback('The 3D view could not be drawn');
      return;
    }
    if (animation) invalidate();
  }

  function invalidate() {
    if (!frame && !dead) frame = requestAnimationFrame(draw);
  }

  function resize() {
    if (dead) return;
    const nextWidth = stage.clientWidth;
    const nextHeight = stage.clientHeight;
    if (width === nextWidth && height === nextHeight) return;
    width = nextWidth;
    height = nextHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    invalidate();
  }

  function reset() {
    theta = home[kind].theta;
    phi = home[kind].phi;
    zoomFactor = 1;
    invalidate();
  }

  function show(next, separated) {
    if (model) model.root.visible = false;
    kind = next;
    if (!models.has(kind)) {
      const assembly = buildHardware(T, kit, kind);
      models.set(kind, assembly);
      world.add(assembly.root);
    }
    model = models.get(kind);
    model.root.visible = true;
    desired = Number(separated);
    separation = desired;
    animation = null;
    floor.position.set(kind === 'desktop' ? -.2 : 0, home[kind].floor, kind === 'desktop' ? -.05 : -.25);
    floor.scale.set(kind === 'desktop' ? 1.37 : 1.2, kind === 'desktop' ? .65 : 1, 1);
    pointer = null;
    reset();
  }

  function separate(flag, instant) {
    desired = Number(flag);
    animation = instant || separation === desired ? null : { base: separation, from: performance.now() };
    if (!animation) separation = desired;
    invalidate();
  }

  function orbit(yaw, pitch) {
    theta += yaw;
    phi = Math.max(.33, Math.min(1.54, phi + pitch));
    invalidate();
  }

  function zoom(factor) {
    zoomFactor = Math.max(.62, Math.min(1.65, zoomFactor * factor));
    invalidate();
  }

  const keyActions = new Map([
    ['ArrowLeft', () => orbit(-.28, 0)], ['ArrowRight', () => orbit(.28, 0)],
    ['ArrowUp', () => orbit(0, -.18)], ['ArrowDown', () => orbit(0, .18)],
    ['+', () => zoom(.85)], ['=', () => zoom(.85)], ['-', () => zoom(1.18)], ['0', reset],
  ]);
  listen(canvas, 'keydown', event => {
    if (event.altKey || event.metaKey || event.ctrlKey) return;
    const action = keyActions.get(event.key);
    if (action) {
      event.preventDefault();
      action();
    }
  });
  listen(canvas, 'pointerdown', event => {
    if (pointer || !event.isPrimary) {
      if (pointer) pointer.cancelled = true;
      return;
    }
    if (event.button !== 0) return;
    pointer = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, dragging: false, cancelled: false };
    canvas.setPointerCapture(event.pointerId);
  });
  listen(canvas, 'pointermove', event => {
    if (pointer?.id !== event.pointerId || pointer.cancelled) return;
    if (Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY) >= 5) pointer.dragging = true;
    if (pointer.dragging && event.pointerType !== 'touch') {
      orbit((pointer.x - event.clientX) * .009, (pointer.y - event.clientY) * .009);
    }
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  });
  function cancel(event) {
    if (pointer?.id === event.pointerId) pointer = null;
  }
  listen(canvas, 'pointercancel', cancel);
  listen(canvas, 'lostpointercapture', cancel);
  listen(canvas, 'pointerup', event => {
    if (pointer?.id !== event.pointerId) return;
    const tapped = !pointer.dragging && !pointer.cancelled;
    pointer = null;
    if (!tapped || !model) return;
    const rect = canvas.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    if (px < 0 || px > 1 || py < 0 || py > 1) return;
    const id = findPart(px * 2 - 1, 1 - py * 2);
    if (id) selectPart(id);
  });
  listen(canvas, 'webglcontextlost', event => {
    event.preventDefault();
    if (!dead) fallback('The display lost its 3D connection');
  });

  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  function dispose() {
    if (dead) return;
    dead = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    canvas.remove();
    for (const { root } of models.values()) root.traverse(node => node.geometry?.dispose());
    models.clear();
    floor.geometry.dispose();
    floor.material.map?.dispose();
    floor.material.dispose();
    kit.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }

  return {
    show, separate, reset, resize, orbit, zoom, dispose,
    select(id) { selected = id; invalidate(); },
    metrics: () => ({
      mode: '3d', kind, selected, exploded: Boolean(desired), separation, view: { theta, phi, zoom: zoomFactor },
      threeRevision: T.REVISION, width, height, dpr, renders, calls, triangles, peakCalls, peakTriangles, lastFrameMs,
      geometryCount: renderer.info.memory.geometries, textureCount: renderer.info.memory.textures,
      shadows: 'Contact shade texture; no shadow-map passes',
    }),
  };
}

function createFloor(T) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  const material = new T.MeshBasicMaterial({ color: 0x101c2a, transparent: true, depthWrite: false });
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 6, 64, 64, 62);
    gradient.addColorStop(0, 'rgba(4,12,19,0.82)');
    gradient.addColorStop(.50, 'rgba(4,12,19,0.59)');
    gradient.addColorStop(1, 'rgba(4,12,19,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    material.map = new T.CanvasTexture(canvas);
  } else {
    material.opacity = 0;
  }
  const floor = new T.Mesh(new T.PlaneGeometry(6.8, 6.2), material);
  floor.rotation.x = -Math.PI / 2;
  return floor;
}
