/* Original spatial models. Local part coordinates use +Z away from the board. */
const COLORS = {
  midnight: [0x22384b, .55, .42], graphite: [0x29343c, .52, .45],
  steel: [0xa5bac6, .39, .35], chrome: [0xd6e1e5, .48, .32],
  edge: [0x557c91, .36, .45], black: [0x182531, .10, .61],
  rubber: [0x142329, .02, .88], board: [0x285e4e, .12, .65],
  trace: [0x69b09c, .2, .55], green: [0x2f8c72, .23, .52],
  ink: [0xd2e4df, .04, .69], gold: [0xd9ac58, .42, .38],
  copper: [0xce886e, .35, .39], lagoon: [0x208bbc, .3, .38],
  yellow: [0xffd34f, .15, .5], white: [0xfff6e6, .08, .48],
  blue: [0x407aaa, .12, .48], violet: [0x5e64ab, .18, .48],
};

export function createHardwareKit(T) {
  const materials = new Map(Object.entries(COLORS).map(([key, [color, metalness, roughness]]) => [
    key, new T.MeshStandardMaterial({ color, metalness, roughness }),
  ]));
  const stock = new T.BoxGeometry(1, 1, 1);
  const stockBox = stock.toNonIndexed();
  stock.dispose();
  const textures = new Set();

  function atlas() {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      materials.set('screen', materials.get('blue'));
      return;
    }
    const field = ctx.createLinearGradient(0, 0, 384, 240);
    field.addColorStop(0, '#172333');
    field.addColorStop(1, '#295972');
    ctx.fillStyle = field;
    ctx.fillRect(0, 0, 384, 240);
    ctx.strokeStyle = '#6bafa5';
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.ellipse(302, 94, 167, 91, -.54, -.95, 2.5);
    ctx.stroke();
    ctx.strokeStyle = '#5d85a2';
    ctx.lineWidth = 34;
    ctx.beginPath();
    ctx.ellipse(369, 106, 162, 103, -.48, -.42, 2.55);
    ctx.stroke();
    ctx.strokeStyle = '#ffd670';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(320, 160, 169, 67, -.58, -.7, 2.56);
    ctx.stroke();
    ctx.fillStyle = '#fff6e6';
    ctx.font = '600 32px system-ui, sans-serif';
    ctx.fillText('Floor Shift', 22, 58);
    ctx.fillStyle = '#c0d3d7';
    ctx.font = '500 14px system-ui, sans-serif';
    ctx.fillText('DISPLAY OUTPUT', 24, 84);
    ctx.fillStyle = '#152735';
    ctx.fillRect(0, 211, 384, 29);
    for (const [i, color] of ['#ffe09b', '#a9c9ca', '#799eaf'].entries()) {
      ctx.fillStyle = color;
      ctx.fillRect(163 + i * 20, 219, 10, 10);
    }
    const map = new T.CanvasTexture(canvas);
    map.encoding = T.sRGBEncoding;
    map.anisotropy = 2;
    textures.add(map);
    const material = new T.MeshBasicMaterial({ map });
    materials.set('screen', material);
    return material;
  }
  atlas();

  function batch(group) {
    const sections = new Map();
    const matrix = new T.Matrix4();
    const normalMatrix = new T.Matrix3();
    const translation = new T.Vector3();
    const scale = new T.Vector3();
    const quaternion = new T.Quaternion();
    const rotation = new T.Euler();
    const point = new T.Vector3();
    function stamp(geometry, key, x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) {
      let section = sections.get(key);
      if (!section) {
        section = { positions: [], normals: [], uvs: [] };
        sections.set(key, section);
      }
      translation.set(x, y, z);
      scale.set(sx, sy, sz);
      quaternion.setFromEuler(rotation.set(rx, ry, rz));
      matrix.compose(translation, quaternion, scale);
      normalMatrix.getNormalMatrix(matrix);
      const { position, normal, uv } = geometry.attributes;
      for (let i = 0; i < position.count; i += 1) {
        point.fromBufferAttribute(position, i).applyMatrix4(matrix);
        section.positions.push(point.x, point.y, point.z);
        point.fromBufferAttribute(normal, i).applyNormalMatrix(normalMatrix);
        section.normals.push(point.x, point.y, point.z);
        section.uvs.push(uv?.getX(i) ?? 0, uv?.getY(i) ?? 0);
      }
    }
    function primitive(geometry, ...placement) {
      const flat = geometry.index ? geometry.toNonIndexed() : geometry;
      stamp(flat, ...placement);
      if (flat !== geometry) flat.dispose();
      geometry.dispose();
    }
    const box = (key, x, y, z, w, h, d, rx, ry, rz) => stamp(
      stockBox, key, x, y, z, w, h, d, rx, ry, rz,
    );
    function panel(key, x, y, z, w, h, d, corner = .1, rx = 0) {
      const s = new T.Shape();
      const corners = [
        [-w / 2 + corner, -h / 2], [w / 2 - corner, -h / 2], [w / 2, -h / 2 + corner],
        [w / 2, h / 2 - corner], [w / 2 - corner, h / 2], [-w / 2 + corner, h / 2],
        [-w / 2, h / 2 - corner], [-w / 2, -h / 2 + corner],
      ];
      s.moveTo(...corners[0]);
      for (const corner of corners.slice(1)) s.lineTo(...corner);
      s.closePath();
      const mesh = new T.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
      mesh.translate(0, 0, -d / 2);
      primitive(mesh, key, x, y, z, 1, 1, 1, rx);
    }
    function disk(key, x, y, z, radius, depth, count = 16) {
      primitive(new T.CylinderGeometry(radius, radius, depth, count), key, x, y, z, 1, 1, 1, Math.PI / 2);
    }
    function ring(key, x, y, z, radius, thickness) {
      primitive(new T.TorusGeometry(radius, thickness, 4, 16), key, x, y, z);
    }
    function tube(key, coordinates, thickness) {
      const curve = new T.CatmullRomCurve3(coordinates.map(v => new T.Vector3(...v)));
      primitive(new T.TubeGeometry(curve, 12, thickness, 6, false), key, 0, 0, 0);
    }
    function line(key, x1, y1, x2, y2, z, width = .013) {
      box(key, (x1 + x2) / 2, (y1 + y2) / 2, z, Math.hypot(x1 - x2, y1 - y2), width, .009,
        0, 0, Math.atan2(y2 - y1, x2 - x1));
    }
    function finish() {
      for (const [key, section] of sections) {
        const geometry = new T.BufferGeometry();
        geometry.setAttribute('position', new T.Float32BufferAttribute(section.positions, 3));
        geometry.setAttribute('normal', new T.Float32BufferAttribute(section.normals, 3));
        geometry.setAttribute('uv', new T.Float32BufferAttribute(section.uvs, 2));
        const material = materials.get(key);
        if (material) group.add(new T.Mesh(geometry, material));
      }
    }
    return { box, panel, disk, ring, tube, line, finish, primitive };
  }

  function dispose() {
    stockBox.dispose();
    for (const material of materials.values()) material.dispose();
    for (const texture of textures) texture.dispose();
  }
  return { batch, dispose };
}

function bolts(b, w, h, z, inset = .12) {
  for (const x of [-w / 2 + inset, w / 2 - inset]) {
    for (const y of [-h / 2 + inset, h / 2 - inset]) {
      b.disk('steel', x, y, z, .035, .022, 8);
      b.line('black', x - .018, y + .007, x + .018, y - .007, z + .014, .008);
    }
  }
}

function fan(b, x, y, z, r) {
  b.disk('black', x, y, z, r, .045);
  b.ring('edge', x, y, z + .044, r * .92, .022);
  for (let i = 0; i < 7; i += 1) {
    const a = i * 2 * Math.PI / 7;
    b.box('midnight', x + Math.cos(a) * r * .46, y + Math.sin(a) * r * .46, z + .057,
      r * .68, r * .18, .045, 0, 0, a - .48);
  }
  b.disk('steel', x, y, z + .071, r * .29, .035);
  b.disk('black', x, y, z + .094, r * .17, .022);
}

function motherboard(b, w, h, laptop) {
  b.panel('board', 0, 0, 0, w, h, .075, .13);
  b.panel('trace', 0, 0, -.04, w * 1.003, h * 1.002, .014, .13);
  bolts(b, w, h, .061);
  for (let i = 0; i < 9; i += 1) {
    const y = h * .22 - i * .047;
    const x = -w * .48 + i * .105;
    b.line('trace', x, y, x + .22, y, .05);
    b.line('trace', x + .22, y, x + .44, y - .24, .05);
    b.line('trace', x + .44, y - .24, w * .37, y - .24, .05);
  }
  for (let i = 0; i < 11; i += 1) {
    const x = -w * .42 + i * w * .078;
    b.box('ink', x, -h * .43, .059, .075, .061, .027);
    b.box('black', x, -h * .38, .075, .08, .09, .045);
  }
  for (let i = 0; i < 6; i += 1) {
    const x = -w * .41 + i * .17;
    b.disk('steel', x, h * .38, .11, .056, .15, 10);
    b.disk('black', x, h * .38, .20, .039, .015, 8);
  }
  b.box('black', w * .42, h * .25, .103, .16, .56, .15);
  for (let i = 0; i < 10; i += 1) {
    b.box('gold', w * .42, h * .25 - .225 + i * .05, .187, .07, .022, .02);
  }
  b.panel('edge', w * .30, -h * .27, .13, .34, .29, .135, .07);
  for (let i = 0; i < 6; i += 1) b.box('chrome', w * .30, -h * .37 + i * .037, .21, .30, .014, .022);
  if (!laptop) {
    b.disk('black', -w * .35, -h * .27, .063, .15, .065);
    b.disk('chrome', -w * .35, -h * .27, .106, .127, .028);
  }
}

function socket(b, x, y, scale = 1) {
  b.panel('black', x, y, .078, .98 * scale, .88 * scale, .14, .075);
  b.panel('steel', x, y, .152, .84 * scale, .76 * scale, .032, .062);
  b.box('black', x, y, .175, .67 * scale, .61 * scale, .025);
  for (const sx of [-1, 1]) {
    b.box('copper', x + sx * .23 * scale, y, .198, .04, .48 * scale, .02);
  }
}

function cpu(b, laptop) {
  const w = laptop ? .72 : .78;
  b.panel('green', 0, 0, 0, w, w, .061, .075);
  b.panel('chrome', 0, 0, .065, w * .81, w * .79, .086, .058);
  for (let i = 0; i < 5; i += 1) b.box('gold', -.26 + i * .126, -.351, .041, .064, .036, .02);
  if (laptop) {
    b.panel('copper', 0, 0, .116, .56, .49, .046, .045);
    b.tube('copper', [[-.23, .12, .139], [.16, .12, .139], [.47, .35, .139], [.93, .39, .139]], .045);
    b.tube('copper', [[-.22, -.07, .15], [.17, -.071, .15], [.53, .18, .15], [.93, .21, .15]], .04);
    for (let i = 0; i < 12; i += 1) b.box('edge', .77 + i * .036, .30, .18, .023, .40, .12);
    fan(b, 1.17, .31, .17, .25);
  } else {
    b.box('edge', 0, .13, .11, .34, .026, .007);
    b.box('edge', -.051, .07, .11, .24, .017, .007);
    b.box('gold', -.331, -.318, .045, .028, .028, .011, 0, 0, Math.PI / 4);
  }
}

function cooler(b) {
  b.panel('copper', 0, 0, .14, .77, .77, .082, .057);
  for (let i = 0; i < 12; i += 1) {
    b.box('steel', 0, -.40 + i * .073, .28, .96, .032, .23);
  }
  b.panel('graphite', 0, 0, .439, .87, .87, .112, .095);
  fan(b, 0, 0, .509, .365);
  bolts(b, .87, .87, .51, .08);
}

function memory(b, laptop) {
  const rows = laptop ? [-.18, .17] : [-.31, .29];
  for (const y of rows) {
    b.panel('green', 0, y, 0, laptop ? 1.18 : 1.47, .26, .042, .032);
    b.box('ink', -.27, y + .093, .029, .13, .025, .009);
    for (let i = 0; i < (laptop ? 4 : 5); i += 1) {
      const x = -.45 + i * .225;
      b.box('black', x, y + .007, .045, .16, .145, .045);
      b.box('edge', x, y + .053, .069, .095, .011, .003);
    }
    for (let i = 0; i < (laptop ? 13 : 17); i += 1) {
      if (i !== 6) b.box('gold', (i - (laptop ? 6 : 8)) * .075, y - .104, .03, .042, .055, .018);
    }
  }
}

function drive(b, laptop) {
  const width = laptop ? 1.38 : 1.78;
  b.panel('green', 0, 0, 0, width, .45, .057, .064);
  b.disk('gold', -width / 2 + .087, 0, .025, .056, .034, 10);
  b.disk('black', -width / 2 + .087, 0, .046, .025, .018, 8);
  b.box('black', width * .28, 0, .062, .215, .23, .073);
  b.box('ink', width * .28, .06, .101, .13, .03, .005);
  for (const x of [-width * .21, width * .035]) {
    b.box('black', x, 0, .055, width * .185, .30, .065);
    b.box('edge', x, .089, .092, .13, .016, .006);
  }
  for (let i = 0; i < 7; i += 1) b.box('gold', width / 2 - .067, -.147 + i * .049, .036, .105, .027, .017);
}

function graphics(b, laptop) {
  if (laptop) {
    b.panel('green', 0, 0, 0, .79, .64, .055, .055);
    b.panel('blue', 0, 0, .043, .47, .46, .055, .06);
    b.panel('chrome', 0, 0, .078, .32, .32, .041, .035);
    for (const x of [-.285, .285]) {
      for (const y of [-.17, .14]) b.box('black', x, y, .05, .13, .195, .055);
    }
    return;
  }
  b.panel('green', 0, 0, 0, 2.63, .85, .088, .1);
  b.panel('midnight', .025, 0, .27, 2.62, .88, .46, .145);
  b.panel('edge', .03, 0, .519, 2.53, .78, .096, .14);
  b.panel('graphite', .03, 0, .568, 2.43, .69, .069, .125);
  for (const x of [-.52, .56]) fan(b, x, 0, .618, .297);
  for (const x of [-.83, -.73, -.63, -.53, -.43, -.33, -.23, -.13, -.03, .07, .17, .27, .37, .47, .57, .67, .77, .87]) {
    b.box('steel', x, .397, .226, .023, .088, .39);
  }
  b.box('steel', -1.32, 0, .2, .11, 1.12, .47);
  for (const y of [-.18, .09, .34]) {
    b.box('black', -1.349, y, .45, .10, .15, .058);
    b.box('gold', -1.348, y, .483, .055, .018, .018);
  }
  b.box('yellow', 1.19, .16, .621, .04, .26, .02);
  b.box('yellow', 1.251, .105, .617, .04, .26, .02);
  for (let i = 0; i < 16; i += 1) {
    if (i !== 5) b.box('gold', -1.07 + i * .064, -.464, .015, .046, .104, .039);
  }
}

function portBank(b, laptop) {
  const types = [
    { size: .21, color: 'lagoon', slots: 1 },
    { size: .28, color: 'black', slots: 1 },
    { size: .31, color: 'black', slots: 2 },
  ];
  b.panel('edge', 0, 0, 0, .41, laptop ? .96 : 1.18, .21, .065);
  for (const [index, { size, color, slots }] of types.entries()) {
    const y = .33 - index * .31;
    b.panel('chrome', 0, y, .125, size, .21, .048, .036);
    b.panel(color, 0, y, .151, size - .06, .133, .019, .028);
    for (let i = 0; i < slots; i += 1) b.box('gold', 0, y + i * .053 - .025, .164, size - .11, .019, .012);
  }
}

function screen(T, b, w, h, tilt, fixedStand) {
  b.panel('chrome', 0, 0, -.046, w + .047, h + .04, .115, .125);
  b.panel('black', 0, 0, .022, w, h, .081, .105);
  b.primitive(new T.PlaneGeometry(w - .13, h - .16), 'screen', 0, .013, .068);
  b.disk('edge', 0, h / 2 - .042, .071, .014, .017, 8);
  if (fixedStand) {
    b.box('steel', 0, -h / 2 - .24, -.16, .21, .62, .15, tilt);
    b.panel('graphite', 0, -h / 2 - .53, -.11, w * .53, .68, .11, .13, -Math.PI / 2);
    b.box('yellow', w * .43, -.5 * h + .042, .071, .037, .018, .01);
  }
}

function makeAssembly(T, kit, kind) {
  const root = new T.Group();
  const objects = [];
  const clickable = new Map();
  const laptop = kind === 'laptop';

  function part(key, position, offset, build, parent = root, marker = true) {
    const group = new T.Group();
    group.position.set(...position);
    if (key) group.userData.part = key;
    const batch = kit.batch(group);
    build(batch);
    batch.finish();
    parent.add(group);
    objects.push({ group, home: new T.Vector3(...position), offset: new T.Vector3(...offset) });
    if (key && marker) clickable.set(key, group);
    return group;
  }

  if (laptop) {
    const base = new T.Group();
    base.rotation.x = -Math.PI / 2;
    root.add(base);
    part(null, [0, 0, -.14], [0, 0, 0], b => {
      b.panel('chrome', 0, 0, 0, 4.64, 3.05, .18, .16);
      b.panel('graphite', 0, 0, .095, 4.57, 2.98, .071, .13);
      b.panel('black', 0, 0, .135, 4.39, 2.81, .051, .13);
      b.box('edge', 0, -1.517, 0, 3.25, .023, .12);
      for (const x of [-1.90, 1.9]) b.panel('steel', x, 1.31, .094, .49, .19, .13, .07);
      for (const x of [-1.72, 1.72]) b.panel('rubber', x, -1.13, -.104, .55, .22, .059, .06);
      b.panel('midnight', 0, -1.01, .168, 3.08, .68, .093, .055);
      for (const x of [-.99, 0, .99]) b.panel('graphite', x, -1.01, .22, .93, .53, .052, .052);
      for (let i = 0; i < 12; i += 1) b.box('edge', -.99 + i * .18, -1.281, .263, .112, .021, .012);
    }, base);
    part('motherboard', [0, .32, .095], [0, 0, .18], b => {
      motherboard(b, 3.88, 1.86, true);
      socket(b, -.69, .40, .84);
      socket(b, -.54, -.48, .75);
    }, base);
    part('cpu', [-.69, .72, .32], [-1.40, .19, .70], b => cpu(b, true), base);
    const memoryPart = part('ram', [1.14, .16, .244], [1.08, -.59, .85], b => memory(b, true), base);
    memoryPart.rotation.z = -.06;
    part('storage', [.66, -.43, .24], [.61, -1.06, .54], b => drive(b, true), base);
    part('gpu', [-.54, -.16, .29], [-1.36, -.62, .65], b => graphics(b, true), base);
    part('ports', [-2.15, .12, .18], [-.57, .60, .27], b => portBank(b, true), base);
    const lid = part('ports', [0, 1.42, -1.71], [0, .1, -.23], b => screen(T, b, 4.42, 2.52, 0, false), root, false);
    lid.rotation.x = -.21;
  } else {
    const x = -1.36;
    part(null, [x, -.02, -.23], [-.40, 0, -.30], b => {
      b.panel('steel', 0, 0, -.43, 3.32, 3.98, .12, .17);
      b.panel('graphite', 0, 0, -.34, 3.19, 3.84, .16, .115);
      b.panel('midnight', 0, 0, -.23, 3.03, 3.67, .08, .105);
      b.panel('steel', 0, 1.941, -.13, 3.32, .15, .96, .056);
      b.panel('graphite', 0, -1.928, -.086, 3.32, .18, 1.08, .07);
      b.box('steel', -1.592, 0, -.096, .158, 3.75, .65);
      b.box('edge', 1.58, 0, -.166, .176, 3.75, .52);
      b.box('graphite', -1.571, 0, .226, .177, 3.78, .137);
      b.box('graphite', 1.601, 0, .104, .134, 3.78, .105);
      b.panel('black', 0, -1.55, .056, 2.87, .58, .52, .11);
      for (let i = 0; i < 19; i += 1) {
        b.box('edge', -1.19 + i * .133, -1.55, .322, .05, .31, .019, 0, 0, -.22);
      }
      for (let i = 0; i < 15; i += 1) b.box('black', -1.25 + i * .179, 2.024, -.29, .071, .016, .29);
      b.disk('yellow', 1.19, 1.942, .358, .064, .025, 12);
      b.box('yellow', -1.565, .93, .307, .033, 1.64, .022);
      for (const sx of [-1, 1]) b.box('rubber', sx * 1.05, -2.066, -.063, .48, .17, .89);
    });
    part('motherboard', [x, .09, -.37], [-.4, 0, .64], b => {
      motherboard(b, 2.94, 2.95, false);
      socket(b, -.50, .72);
      for (const slotX of [.43, 1.02]) b.box('black', slotX, .70, .15, .16, 1.53, .14);
      b.box('black', .02, -.65, .161, 2.10, .105, .145);
      b.box('gold', .02, -.65, .244, 1.82, .035, .033);
      b.box('black', 1.01, -.19, .137, .21, .41, .129);
    });
    const chip = part('cpu', [x - .50, .81, -.13], [-.43, .38, 1.09], b => cpu(b, false));
    clickable.set('cpu-package', chip);
    part('cpu', [x - .50, .81, -.13], [-1.04, .83, 1.43], cooler);
    const memoryPart = part('ram', [x + .72, .79, -.141], [.70, .66, 1.16], b => memory(b, false));
    memoryPart.rotation.z = Math.PI / 2;
    part('storage', [x + .03, -.105, -.235], [.73, .086, 1.63], b => drive(b, false));
    part('gpu', [x, -.96, -.13], [-.13, -.47, 1.64], b => graphics(b, false));
    part('ports', [x - 1.251, .64, -.16], [-.40, .27, .68], b => portBank(b, false));
    const display = part('ports', [1.67, -.70, -.71], [.43, -.12, 0], b => screen(T, b, 2.36, 1.57, -.10, true), root, false);
    display.rotation.y = -.20;
  }
  return { root, objects, clickable };
}

export function buildHardware(T, kit, kind) {
  return makeAssembly(T, kit, kind);
}
