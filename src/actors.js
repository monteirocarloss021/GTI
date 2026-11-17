/* Articulação e poses adaptadas do Grand Theft Gucci.html fornecido pelo autor. */
import * as T from "three";
const PI = Math.PI,
  TAU = PI * 2;
const rand = (a = 1, b) =>
  b === undefined ? Math.random() * a : a + Math.random() * (b - a);
const irand = (a, b) => Math.floor(rand(a, b + 1));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const hyp = Math.hypot;
const angDiff = (a, b) => {
  let d = (b - a) % TAU;
  if (d > PI) d -= TAU;
  if (d < -PI) d += TAU;
  return d;
};
const _mats = {};
function M(c, o) {
  const k = "L" + c + (o ? JSON.stringify(o) : "");
  return (
    _mats[k] ||
    (_mats[k] = new T.MeshLambertMaterial(Object.assign({ color: c }, o)))
  );
}
function MB(c, o) {
  const k = "B" + c + (o ? JSON.stringify(o) : "");
  return (
    _mats[k] ||
    (_mats[k] = new T.MeshBasicMaterial(Object.assign({ color: c }, o)))
  );
}
function ME(c, e, i = 1) {
  const k = "E" + c + "_" + e + "_" + i;
  return (
    _mats[k] ||
    (_mats[k] = new T.MeshLambertMaterial({
      color: c,
      emissive: e,
      emissiveIntensity: i,
    }))
  );
}
const keep = (g) => {
  g.userData.keep = true;
  return g;
};
const GEO = {
  box: keep(new T.BoxGeometry(1, 1, 1)),
  sph: keep(new T.SphereGeometry(1, 18, 14)),
  sphLo: keep(new T.SphereGeometry(1, 10, 8)),
  cyl: keep(new T.CylinderGeometry(1, 1, 1, 18)),
  cone: keep(new T.ConeGeometry(1, 1, 16)),
  plane: keep(new T.PlaneGeometry(1, 1)),
  ring: keep(new T.RingGeometry(0.86, 1, 48)),
  disc: keep(new T.CircleGeometry(1, 40)),
  tor: keep(new T.TorusGeometry(1, 0.12, 8, 24)),
  cap: keep(new T.CapsuleGeometry(1, 1, 6, 12)),
  ico: keep(new T.IcosahedronGeometry(1, 0)),
  oct: keep(new T.OctahedronGeometry(1, 0)),
};
function mk(geo, mat, x = 0, y = 0, z = 0, sx = 1, sy = sx, sz = sx, parent) {
  const m = new T.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  m.castShadow = true;
  m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}
const box = (mat, x, y, z, w, h, d, p) => mk(GEO.box, mat, x, y, z, w, h, d, p);
const sph = (mat, x, y, z, r, p, sy, sz) =>
  mk(
    GEO.sph,
    mat,
    x,
    y,
    z,
    r,
    sy === undefined ? r : sy,
    sz === undefined ? r : sz,
    p,
  );
const cyl = (mat, x, y, z, r, h, p) => mk(GEO.cyl, mat, x, y, z, r, h, r, p);
function grp(parent, x = 0, y = 0, z = 0) {
  const g = new T.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}
const _cg = {};
function capGeo(th0, thL, phL = TAU, ph0 = 0) {
  const k = [th0, thL, phL, ph0].join();
  return (
    _cg[k] ||
    (_cg[k] = keep(new T.SphereGeometry(1, 18, 12, ph0, phL, th0, thL)))
  );
}
const ARC = keep(new T.TorusGeometry(1, 0.2, 6, 14, PI));
const TORT = keep(new T.TorusGeometry(1, 0.08, 6, 20));
function stripeMat(c1, c2, n = 7) {
  const k = "st" + c1 + "_" + c2;
  if (_mats[k]) return _mats[k];
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = 64;
  const x = c.getContext("2d");
  for (let i = 0; i < n; i++) {
    x.fillStyle = "#" + (i % 2 ? c2 : c1).toString(16).padStart(6, "0");
    x.fillRect(0, (i * 64) / n, 8, 64 / n + 1);
  }
  const t = new T.CanvasTexture(c);
  return (_mats[k] = new T.MeshLambertMaterial({ map: t }));
}

const ITEM = {
  vape() {
    const g = grp();
    box(M(0x18c8d8), 0, 0.02, 0, 0.04, 0.13, 0.025, g);
    box(M(0x111111), 0, 0.1, 0, 0.025, 0.04, 0.018, g);
    const l = sph(MB(0x9ffcff), 0, -0.03, 0.014, 0.008, g);
    l.castShadow = false;
    return g;
  },
  cup() {
    const g = grp();
    cyl(M(0xffffff), 0, 0.02, 0, 0.04, 0.1, g);
    cyl(M(0xbfe9ff), 0, 0.06, 0, 0.035, 0.03, g);
    return g;
  },
  phone() {
    const g = grp();
    box(M(0x111111), 0, 0.02, 0, 0.07, 0.14, 0.012, g);
    box(MB(0x9fd0ff), 0, 0.02, 0.007, 0.058, 0.12, 0.002, g);
    return g;
  },
  paper() {
    const g = grp();
    box(M(0xffffff), 0, 0.02, 0, 0.16, 0.22, 0.01, g);
    return g;
  },
  cig() {
    const g = grp();
    const c = cyl(M(0xf2f2ea), 0, 0.03, 0, 0.012, 0.1, g);
    sph(MB(0x66ff88), 0, 0.085, 0, 0.014, g);
    return g;
  },
  book() {
    const g = grp();
    box(M(0x24408e), 0, 0.02, 0, 0.16, 0.22, 0.04, g);
    box(M(0xffffff), 0.005, 0.02, 0, 0.15, 0.2, 0.03, g);
    return g;
  },
  mic() {
    const g = grp();
    cyl(M(0x222222), 0, 0.03, 0, 0.015, 0.14, g);
    sph(M(0x888888), 0, 0.12, 0, 0.03, g);
    return g;
  },
};
const FACES = {
  neutral: [0, 0, 1, "l", 1, 1],
  happy: [-0.1, 0.01, 1, "s", 1.1, 1],
  grin: [-0.15, 0.015, 0.85, "S", 1.35, 1],
  angry: [0.5, -0.02, 0.75, "f", 0.9, 1],
  sad: [-0.45, 0, 0.8, "f", 0.8, 1],
  shock: [-0.3, 0.035, 1.4, "o", 0.7, 1.2],
  sleepy: [0, -0.01, 0.1, "o", 0.6, 0.8],
  smug: [0.18, 0, 0.55, "s", 0.9, 0.8],
  sick: [-0.45, 0, 0.5, "o", 0.8, 0.45],
  flirty: [-0.22, 0.02, 0.65, "s", 1, 1],
  bored: [0.1, -0.012, 0.45, "l", 0.9, 1],
  annoyed: [0.38, -0.012, 0.55, "f", 0.7, 0.7],
  laugh: [-0.25, 0.02, 0.12, "O", 1.25, 1.3],
  dizzy: [-0.3, 0.02, 1.25, "o", 0.5, 0.6],
  yell: [0.48, -0.012, 0.9, "O", 1.3, 1.6],
  dead: [-0.2, 0, 0.06, "l", 0.8, 1],
};
const JK = [
  "hips",
  "spine",
  "head",
  "armL",
  "armR",
  "elbL",
  "elbR",
  "legL",
  "legR",
  "kneeL",
  "kneeR",
];
const Z3 = [0, 0, 0],
  TH0 = [4, 8.4];

class Char {
  constructor(cf) {
    const c = (this.cfg = Object.assign(
      {
        skin: 0xe0a57c,
        hair: 0x2a1c14,
        hairStyle: "short",
        beard: 0,
        build: 0,
        h: 1,
        shirt: 0x3366cc,
        pants: 0x333a4d,
        shoes: 0x222222,
        acc: {},
      },
      cf,
    ));
    this.gait = Object.assign(
      { sway: 0.03, stride: 1, armOut: 0.08, bounce: 1 },
      c.gait,
    );
    const mm = (col) => (c.mono ? M(c.mono) : M(col));
    const g = (this.g = new T.Group());
    this.pos = g.position;
    this.yaw = 0;
    this.yawT = 0;
    this.r = 0.36;
    this.name = c.name || "";
    const s = (this.s = grp(g));
    s.scale.setScalar(c.h);
    const body = (this.body = grp(s));
    const J = (this.J = {});
    const skin = mm(c.skin),
      shirt = c.stripes && !c.mono ? stripeMat(c.shirt, c.shirt2) : mm(c.shirt),
      pants = mm(c.pants),
      shoe = mm(c.shoes),
      hairM = mm(c.hair),
      dark = c.mono ? M(c.mono) : M(0x1a1010);
    const bw = 0.2 + c.build * 0.06,
      A = c.acc || {};
    J.hips = grp(body, 0, 0.9, 0);
    J.spine = grp(J.hips, 0, 0.02, 0);
    sph(shirt, 0, 0.3, 0, bw * 1.22, J.spine, 0.34, bw * 0.98);
    this.belly = sph(
      shirt,
      0,
      0.16,
      0.05 + c.build * 0.06,
      bw * 1.08 + c.build * 0.07,
      J.spine,
      0.2 + c.build * 0.07,
      bw + c.build * 0.1,
    );
    sph(
      pants,
      0,
      -0.02,
      0,
      bw * 1.08 + c.build * 0.03,
      J.hips,
      0.15,
      bw * 0.95 + c.build * 0.05,
    );
    if (c.jacket) {
      const j = mk(
        capGeo(0, PI, PI, PI),
        mm(c.jacket),
        0,
        0.3,
        0,
        bw * 1.3,
        0.36,
        bw * 1.08,
        J.spine,
      );
      const j2 = mk(
          capGeo(0, PI, PI * 0.32, PI * 0.02),
          mm(c.jacket),
          0,
          0.3,
          0,
          bw * 1.3,
          0.36,
          bw * 1.06,
          J.spine,
        ),
        j3 = mk(
          capGeo(0, PI, PI * 0.32, PI * 0.66),
          mm(c.jacket),
          0,
          0.3,
          0,
          bw * 1.3,
          0.36,
          bw * 1.06,
          J.spine,
        );
    }
    if (c.female && !c.mono) {
      sph(shirt, 0, 0.4, 0.09, bw * 0.95, J.spine, 0.1, 0.1);
    }
    // pernas
    for (const sd of [1, -1]) {
      const L = sd > 0 ? "L" : "R",
        leg = (J["leg" + L] = grp(
          J.hips,
          sd * (0.1 + c.build * 0.015),
          -0.04,
          0,
        ));
      sph(
        c.shorts ? skin : pants,
        0,
        -0.2,
        0,
        0.095 + c.build * 0.025,
        leg,
        0.24,
        0.1 + c.build * 0.025,
      );
      if (c.shorts)
        sph(
          pants,
          0,
          -0.1,
          0,
          0.11 + c.build * 0.025,
          leg,
          0.17,
          0.115 + c.build * 0.025,
        );
      const kn = (J["knee" + L] = grp(leg, 0, -0.42, 0));
      sph(c.shorts ? skin : pants, 0, -0.19, 0, 0.078, kn, 0.22, 0.08);
      if (c.flip) {
        sph(skin, 0, -0.41, 0.05, 0.07, kn, 0.04, 0.12);
        box(shoe, 0, -0.455, 0.05, 0.13, 0.025, 0.27, kn);
      } else sph(shoe, 0, -0.41, 0.055, 0.085, kn, 0.06, 0.15);
    }
    // braços
    for (const sd of [1, -1]) {
      const L = sd > 0 ? "L" : "R",
        arm = (J["arm" + L] = grp(J.spine, sd * (bw * 1.16 + 0.03), 0.5, 0));
      sph(
        c.long || c.jacket || A.toga ? (c.jacket ? mm(c.jacket) : shirt) : skin,
        0,
        -0.15,
        0,
        0.068 + c.build * 0.012,
        arm,
        0.18,
        0.07 + c.build * 0.012,
      );
      if (!c.long && !c.jacket && !A.toga)
        sph(
          shirt,
          0,
          -0.07,
          0,
          0.085 + c.build * 0.012,
          arm,
          0.12,
          0.088 + c.build * 0.012,
        );
      const eb = (J["elb" + L] = grp(arm, 0, -0.29, 0));
      sph(
        c.long || A.toga ? shirt : skin,
        0,
        -0.13,
        0,
        0.058 + c.build * 0.008,
        eb,
        0.16,
        0.06,
      );
      if (A.toga) {
        const sl = mk(GEO.cone, shirt, 0, -0.16, 0, 0.13, 0.32, 0.13, eb);
        sl.rotation.x = PI;
      }
      const hd = (this["hand" + L] = grp(eb, 0, -0.3, 0));
      sph(skin, 0, 0, 0, 0.062, hd);
    }
    // cabeça
    const H = (J.head = grp(J.spine, 0, 0.62, 0)),
      Rr = 0.215;
    cyl(skin, 0, 0.03, 0, 0.075, 0.1, H);
    sph(skin, 0, 0.2, 0, Rr, H, Rr * 1.06, Rr);
    sph(skin, 0.205, 0.2, 0, 0.04, H, 0.05, 0.025);
    sph(skin, -0.205, 0.2, 0, 0.04, H, 0.05, 0.025);
    sph(
      c.mono ? skin : mm(new T.Color(c.skin).multiplyScalar(0.9).getHex()),
      0,
      0.175,
      0.215,
      0.03,
      H,
      0.034,
      0.035,
    );
    this.eyes = [];
    this.brows = [];
    for (const sd of [1, -1]) {
      const e = grp(H, sd * 0.08, 0.238, 0.176);
      sph(c.mono ? skin : M(0xffffff), 0, 0, 0, 0.052, e, 0.06, 0.034);
      if (!c.mono) sph(M(0x1a120c), 0, 0, 0.026, 0.026, e, 0.03, 0.016);
      this.eyes.push(e);
      const b = box(
        c.beard || c.hairStyle !== "wig" ? hairM : mm(0xdddddd),
        sd * 0.078,
        0.305,
        0.2,
        0.08,
        0.02,
        0.022,
        H,
      );
      this.brows.push(b);
      b.userData.sd = sd;
    }
    const mo = (this.mouth = grp(H, 0, 0.105, 0.214));
    this.mArc = mk(ARC, dark, 0, 0, 0, 0.05, 0.05, 0.05, mo);
    this.mOpen = sph(dark, 0, 0, 0, 0.045, mo, 0.03, 0.02);
    this.mLine = box(dark, 0, 0, 0, 0.075, 0.012, 0.015, mo);
    this.mTeeth = box(
      c.mono ? skin : M(0xffffff),
      0,
      0.012,
      0.012,
      0.07,
      0.018,
      0.012,
      mo,
    );
    [this.mArc, this.mOpen, this.mLine, this.mTeeth].forEach(
      (m) => (m.castShadow = false),
    );
    // cabelo
    const hs = c.hairStyle;
    if (hs === "volume") {
      mk(
        capGeo(0, PI * 0.42),
        hairM,
        0,
        0.21,
        0,
        Rr * 1.12,
        Rr * 1.3,
        Rr * 1.12,
        H,
      );
      mk(
        capGeo(0, PI * 0.74, PI, PI),
        hairM,
        0,
        0.2,
        0,
        Rr * 1.09,
        Rr * 1.12,
        Rr * 1.09,
        H,
      );
      const q = sph(hairM, 0.02, 0.42, 0.1, 0.15, H, 0.075, 0.1);
      q.rotation.x = -0.3;
      sph(hairM, -0.09, 0.43, 0.04, 0.1, H, 0.07, 0.1);
      box(hairM, 0.192, 0.2, 0.05, 0.03, 0.11, 0.06, H);
      box(hairM, -0.192, 0.2, 0.05, 0.03, 0.11, 0.06, H);
    } else if (hs === "short") {
      mk(
        capGeo(0, PI * 0.43),
        hairM,
        0,
        0.2,
        0,
        Rr * 1.045,
        Rr * 1.1,
        Rr * 1.045,
        H,
      );
      mk(
        capGeo(0, PI * 0.7, PI, PI),
        hairM,
        0,
        0.2,
        0,
        Rr * 1.04,
        Rr * 1.08,
        Rr * 1.04,
        H,
      );
    } else if (hs === "fade") {
      mk(
        capGeo(0, PI * 0.31),
        hairM,
        0,
        0.2,
        0,
        Rr * 1.04,
        Rr * 1.1,
        Rr * 1.04,
        H,
      );
      const fm = c.mono
        ? hairM
        : new T.MeshLambertMaterial({
            color: c.hair,
            transparent: true,
            opacity: 0.5,
          });
      mk(
        capGeo(0, PI * 0.62, PI, PI),
        fm,
        0,
        0.2,
        0,
        Rr * 1.015,
        Rr * 1.07,
        Rr * 1.015,
        H,
      ).castShadow = false;
    } else if (hs === "straight") {
      mk(
        capGeo(0, PI * 0.46),
        hairM,
        0,
        0.2,
        0,
        Rr * 1.07,
        Rr * 1.13,
        Rr * 1.07,
        H,
      );
      mk(
        capGeo(0, PI * 0.78, PI, PI),
        hairM,
        0,
        0.2,
        0,
        Rr * 1.06,
        Rr * 1.1,
        Rr * 1.06,
        H,
      );
      mk(
        capGeo(PI * 0.18, PI * 0.2, PI, 0),
        hairM,
        0,
        0.2,
        0,
        Rr * 1.075,
        Rr * 1.13,
        Rr * 1.075,
        H,
      );
    } else if (hs === "long" || hs === "bun") {
      mk(
        capGeo(0, PI * 0.44),
        hairM,
        0,
        0.2,
        0,
        Rr * 1.08,
        Rr * 1.14,
        Rr * 1.08,
        H,
      );
      mk(
        capGeo(0, PI * 0.8, PI, PI),
        hairM,
        0,
        0.2,
        0,
        Rr * 1.07,
        Rr * 1.1,
        Rr * 1.07,
        H,
      );
      if (hs === "long") {
        sph(hairM, 0, -0.02, -0.1, Rr * 0.98, H, 0.3, 0.11);
        sph(hairM, 0.19, 0.06, 0.0, 0.055, H, 0.22, 0.08);
        sph(hairM, -0.19, 0.06, 0.0, 0.055, H, 0.22, 0.08);
      } else sph(hairM, 0, 0.46, -0.05, 0.095, H);
    } else if (hs === "wig") {
      mk(
        capGeo(0, PI * 0.45),
        hairM,
        0,
        0.2,
        0,
        Rr * 1.1,
        Rr * 1.18,
        Rr * 1.1,
        H,
      );
      mk(
        capGeo(0, PI * 0.8, PI, PI),
        hairM,
        0,
        0.2,
        0,
        Rr * 1.1,
        Rr * 1.1,
        Rr * 1.1,
        H,
      );
      for (let i = 0; i < 4; i++)
        for (const sd of [1, -1]) {
          const r = cyl(
            hairM,
            sd * 0.225,
            0.26 - i * 0.085,
            0.02,
            0.05,
            0.16,
            H,
          );
          r.rotation.x = PI / 2;
        }
    } else if (hs === "cap") {
      mk(
        capGeo(0, PI * 0.5),
        mm(c.capColor || 0xd91a2a),
        0,
        0.22,
        0,
        Rr * 1.08,
        Rr * 1.1,
        Rr * 1.08,
        H,
      );
      box(mm(c.capColor || 0xd91a2a), 0, 0.25, 0.24, 0.26, 0.02, 0.2, H);
      mk(
        capGeo(PI * 0.5, PI * 0.22, PI, PI),
        hairM,
        0,
        0.2,
        0,
        Rr * 1.03,
        Rr * 1.06,
        Rr * 1.03,
        H,
      );
    } else if (hs === "helmet") {
      mk(
        capGeo(0, PI * 0.56),
        mm(c.capColor || 0x2a3038),
        0,
        0.2,
        0,
        Rr * 1.13,
        Rr * 1.18,
        Rr * 1.13,
        H,
      );
      box(mm(0x111318), 0, 0.24, 0.19, 0.3, 0.07, 0.08, H);
    }
    // barba
    if (c.beard) {
      const bm =
        c.beard === "full" || c.mono
          ? hairM
          : new T.MeshLambertMaterial({
              color: c.beardColor || c.hair,
              transparent: true,
              opacity: c.beard === "light" ? 0.38 : 0.55,
            });
      const bd = mk(
        capGeo(PI * 0.5, PI * 0.46, PI, 0),
        bm,
        0,
        0.2,
        0.004,
        Rr * 1.06,
        Rr * 1.13,
        Rr * 1.06,
        H,
      );
      bd.castShadow = false;
      if (c.beard === "full") {
        box(bm, 0, 0.14, 0.2, 0.12, 0.028, 0.035, H);
        box(bm, 0.058, 0.115, 0.195, 0.022, 0.05, 0.03, H);
        box(bm, -0.058, 0.115, 0.195, 0.022, 0.05, 0.03, H);
      }
    }
    if (c.stache) {
      const sm = mm(c.stache);
      for (const sd of [1, -1]) {
        const m = sph(sm, sd * 0.055, 0.135, 0.215, 0.06, H, 0.022, 0.03);
        m.rotation.z = sd * 0.35;
        sph(sm, sd * 0.115, 0.15, 0.2, 0.022, H);
      }
    }
    // acessórios
    if (A.glasses) {
      const gm = c.mono ? skin : M(A.glasses === true ? 0x111111 : A.glasses);
      for (const sd of [1, -1]) {
        mk(TORT, gm, sd * 0.078, 0.235, 0.208, 0.052, 0.052, 0.052, H);
        if (A.shades) {
          const l = mk(
            GEO.disc,
            M(0x050505),
            sd * 0.078,
            0.235,
            0.212,
            0.05,
            0.05,
            0.05,
            H,
          );
        }
      }
      box(gm, 0, 0.24, 0.21, 0.05, 0.012, 0.01, H);
      box(gm, 0.16, 0.24, 0.12, 0.012, 0.012, 0.18, H);
      box(gm, -0.16, 0.24, 0.12, 0.012, 0.012, 0.18, H);
    }
    if (A.headset) {
      const hm = M(0xc8102e),
        bk = M(0x111111);
      const n = (this.hsNeck = grp(J.spine, 0, 0.6, 0));
      const t = mk(TORT, bk, 0, 0, -0.02, 0.13, 0.13, 0.2, n);
      t.rotation.x = PI / 2;
      cyl(hm, 0.12, -0.02, 0.06, 0.055, 0.05, n).rotation.z = PI / 2;
      cyl(hm, -0.12, -0.02, 0.06, 0.055, 0.05, n).rotation.z = PI / 2;
      const h = (this.hsHead = grp(H, 0, 0.2, 0));
      mk(ARC, bk, 0, 0, 0, Rr * 1.2, Rr * 1.28, Rr * 0.7, h);
      for (const sd of [1, -1]) {
        const cu = cyl(hm, sd * Rr * 1.13, -0.01, 0, 0.075, 0.07, h);
        cu.rotation.z = PI / 2;
        cyl(bk, sd * Rr * 1.2, -0.01, 0, 0.05, 0.04, h).rotation.z = PI / 2;
      }
      const mic = box(bk, 0.2, -0.1, 0.1, 0.012, 0.012, 0.16, h);
      mic.rotation.x = 0.5;
      this.headset(A.headset);
    }
    if (A.backpack) {
      const b = grp(J.spine, 0, 0.3, -bw - 0.09);
      box(M(0x151515), 0, 0, 0, 0.32, 0.4, 0.16, b);
      box(M(0xc8102e), 0, -0.06, -0.085, 0.22, 0.16, 0.03, b);
      box(M(0x151515), 0.12, 0.14, 0.14, 0.04, 0.3, 0.02, b);
      box(M(0x151515), -0.12, 0.14, 0.14, 0.04, 0.3, 0.02, b);
      this.pack = b;
    }
    if (A.bag) {
      const st = box(
        M(0x111111),
        0,
        0.32,
        bw * 0.96,
        0.035,
        0.78,
        0.02,
        J.spine,
      );
      st.rotation.z = 0.62;
      const st2 = box(
        M(0x111111),
        0,
        0.32,
        -bw * 0.96,
        0.035,
        0.78,
        0.02,
        J.spine,
      );
      st2.rotation.z = -0.62;
      box(M(0x15151a), bw * 1.05, 0.02, 0.12, 0.2, 0.2, 0.1, J.spine);
    }
    if (A.chain) {
      const ch = mk(TORT, M(0xffc83d), 0, 0.56, 0.03, 0.1, 0.12, 0.1, J.spine);
      ch.rotation.x = 1.25;
    }
    if (A.earrings) {
      sph(M(0xffc83d), 0.22, 0.13, 0, 0.022, H);
      sph(M(0xffc83d), -0.22, 0.13, 0, 0.022, H);
    }
    if (A.deliveryBag) {
      const b = grp(J.spine, 0, 0.34, -bw - 0.2);
      box(M(0xd91a2a), 0, 0, 0, 0.46, 0.46, 0.34, b);
      box(M(0xffffff), 0, 0.05, -0.175, 0.28, 0.12, 0.01, b);
    }
    if (A.mask) {
      box(M(0x30305a), 0, 0.33, 0.16, 0.3, 0.07, 0.12, H);
    }
    if (A.toga) {
      const tg = mm(c.shirt),
        gold = mm(0xffc83d);
      const rb = mk(GEO.cyl, tg, 0, -0.46, 0, 0.4, 0.95, 0.4, J.hips);
      rb.geometry =
        Char.robe || (Char.robe = keep(new T.CylinderGeometry(0.62, 1, 1, 18)));
      cyl(gold, 0, -0.92, 0, 0.405, 0.04, J.hips);
      const col = mk(TORT, gold, 0, 0.56, 0, 0.15, 0.15, 0.2, J.spine);
      col.rotation.x = PI / 2;
      box(mm(0xc8102e), 0, 0.3, bw + 0.02, 0.1, 0.5, 0.02, J.spine);
      box(mm(0xffffff), 0, 0.5, bw * 0.93, 0.12, 0.12, 0.03, J.spine);
    }
    if (A.cape) {
      const cp = box(mm(A.cape), 0, 0.1, -bw - 0.04, 0.5, 0.8, 0.03, J.spine);
      cp.rotation.x = 0.12;
    }
    if (A.cap2) {
      mk(
        capGeo(0, PI * 0.5),
        mm(A.cap2),
        0,
        0.24,
        0,
        Rr * 1.14,
        Rr * 1.2,
        Rr * 1.14,
        H,
      );
      box(mm(0x111111), 0, 0.27, 0.25, 0.27, 0.02, 0.2, H);
    }
    this.H = H;
    this.anim = "idle";
    this.idleAnim = "idle";
    this.act = null;
    this.ov = null;
    this.t = rand(10);
    this.phase = 0;
    this.speedNow = 0;
    this.path = null;
    this.moveSpeed = 3;
    this.loco = true;
    this.collide = false;
    this.gnd = true;
    this.vy = 0;
    this.face = FACES.neutral;
    this.faceName = "neutral";
    this.talk = 0;
    this.blink = rand(1, 4);
    this.held = null;
    this.heldL = null;
    this.cur = {};
    this.bc = { by: 0, brx: 0, brz: 0, bry: 0 };
    this.setFace("neutral");
    this.alpha = 1;
  }
  headset(m) {
    if (!this.hsNeck) return;
    this.hsNeck.visible = m === "neck";
    this.hsHead.visible = m === "head";
  }
  hold(n, left) {
    const k = left ? "heldL" : "held",
      h = left ? this.handL : this.handR;
    if (this[k]) {
      this[k].removeFromParent();
      this[k] = null;
    }
    if (n) {
      const it = typeof n === "string" ? ITEM[n]() : n;
      h.add(it);
      this[k] = it;
      it.rotation.x = PI / 2;
      return it;
    }
  }
  setFace(n) {
    const f = FACES[n] || FACES.neutral;
    this.face = f;
    this.faceName = n;
    const t = f[3];
    this.mArc.visible = t === "s" || t === "S" || t === "f";
    this.mOpen.visible = t === "o" || t === "O";
    this.mLine.visible = t === "l";
    this.mTeeth.visible = t === "S" || t === "O";
    this.mArc.rotation.z = t === "f" ? 0 : PI;
    this.mArc.position.y = t === "f" ? -0.02 : 0.02;
    this.mArc.scale.set(0.05 * f[4], 0.05 * f[5], 0.05);
    this.mOpen.scale.set(0.045 * f[4], 0.03 * f[5], 0.02);
    this.mTeeth.position.y = t === "S" ? 0.0 : 0.018 * f[5];
    this.mTeeth.scale.set(
      t === "S" ? 0.085 : 0.06 * f[4],
      t === "S" ? 0.022 : 0.016,
      0.012,
    );
    return this;
  }

  animate(dt, pose, speed, face, speaking) {
    this.t += dt;
    this.phase += dt * (speed > 0 ? Math.max(5, speed * 2.1) : 6);
    if (face !== this.faceName) this.setFace(face);
    this.talk = speaking ? 0.3 : Math.min(this.talk, dt);
    let name = pose;
    let k = 14;
    this.anim = name;
    const f = POSE[name] || POSE.idle;
    const p = f(this, this.t, this.t % 1);
    if (p.k) k = p.k;
    let o = null;
    if (this.ov) {
      const a = this.ov;
      a.t += dt;
      const q = clamp(a.t / a.dur, 0, 1);
      o = (POSE[a.name] || POSE.idle)(this, this.t, q);
      if (a.t >= a.dur) this.ov = null;
    }
    const kk = 1 - Math.exp(-k * dt);
    for (const j of JK) {
      const tg = (o && o[j]) || p[j] || Z3,
        r = this.J[j].rotation;
      r.x += (tg[0] - r.x) * kk;
      r.y += (tg[1] - r.y) * kk;
      r.z += (tg[2] - r.z) * kk;
    }
    const b = this.bc,
      kb = p.snap ? 1 : kk;
    b.by += ((p.by || 0) - b.by) * kb;
    b.brx += ((p.brx || 0) - b.brx) * kb;
    b.brz += ((p.brz || 0) - b.brz) * kk;
    b.bry += ((p.bry || 0) - b.bry) * kb;
    this.body.position.y = b.by;
    this.body.rotation.set(b.brx, b.bry, b.brz);
    if (name !== "roll") {
      const hr = this.J.hips.rotation;
      if (hr.x > PI) hr.x -= TAU;
    }
    this.belly.scale.z =
      (0.2 + this.cfg.build * 0.06 + this.cfg.build * 0.1) *
      (1 + (p.belly || 0));
    // rosto
    const fc = this.face;
    this.blink -= dt;
    let open = fc[2];
    if (this.blink < 0) {
      open = 0.08;
      if (this.blink < -0.11) this.blink = rand(1.8, 4.5);
    }
    for (const e of this.eyes)
      e.scale.y += (open - e.scale.y) * Math.min(1, dt * 30);
    for (const br of this.brows) {
      br.rotation.z = damp(br.rotation.z, -br.userData.sd * fc[0], 14, dt);
      br.position.y = 0.305 + fc[1];
    }
    if (this.talk > 0) {
      this.talk -= dt;
      const m = 0.35 + Math.abs(Math.sin(this.t * 19)) * 0.9;
      this.mOpen.visible = true;
      this.mArc.visible = this.mLine.visible = false;
      this.mOpen.scale.set(0.04, 0.034 * m, 0.02);
      if (this.talk <= 0) this.setFace(this.faceName);
    }
  }
}
const S = Math.sin,
  C = Math.cos;
const POSE = {
  idle(c, t) {
    const b = S(t * 1.8) * 0.02,
      o = c.gait.armOut;
    return {
      spine: [0.03 + b, 0, 0],
      head: [-0.02, S(t * 0.5) * 0.12, 0],
      armL: [0.03, 0, o + 0.04],
      armR: [0.03, 0, -o - 0.04],
      elbL: [-0.14, 0, 0],
      elbR: [-0.14, 0, 0],
      by: b * 0.3,
    };
  },
  walk(c, t) {
    const p = c.phase,
      s = S(p),
      g = c.gait,
      o = g.armOut;
    return {
      legL: [-s * 0.58, 0, 0],
      legR: [s * 0.58, 0, 0],
      kneeL: [Math.max(0, C(p)) * 0.85, 0, 0],
      kneeR: [Math.max(0, -C(p)) * 0.85, 0, 0],
      armL: [s * 0.5, 0, o + 0.04],
      armR: [-s * 0.5, 0, -o - 0.04],
      elbL: [-0.3, 0, 0],
      elbR: [-0.3, 0, 0],
      spine: [0.05, s * 0.1, 0],
      head: [0, -s * 0.06, 0],
      by: Math.abs(C(p)) * 0.03 * g.bounce,
      brz: S(p) * g.sway,
    };
  },
  run(c, t) {
    const p = c.phase,
      s = S(p),
      g = c.gait;
    return {
      legL: [-s * 0.95 - 0.1, 0, 0],
      legR: [s * 0.95 - 0.1, 0, 0],
      kneeL: [0.25 + Math.max(0, C(p)) * 1.4, 0, 0],
      kneeR: [0.25 + Math.max(0, -C(p)) * 1.4, 0, 0],
      armL: [s * 0.95, 0, g.armOut + 0.1],
      armR: [-s * 0.95, 0, -g.armOut - 0.1],
      elbL: [-1.35, 0, 0],
      elbR: [-1.35, 0, 0],
      spine: [0.24, s * 0.16, 0],
      head: [-0.12, 0, 0],
      by: Math.abs(C(p)) * 0.06 * g.bounce,
      brz: S(p) * g.sway * 1.3,
    };
  },
  sprint(c, t) {
    const p = c.phase,
      s = S(p);
    return {
      legL: [-s * 1.15 - 0.15, 0, 0],
      legR: [s * 1.15 - 0.15, 0, 0],
      kneeL: [0.3 + Math.max(0, C(p)) * 1.6, 0, 0],
      kneeR: [0.3 + Math.max(0, -C(p)) * 1.6, 0, 0],
      armL: [1.25, 0, 0.3 + S(t * 20) * 0.05],
      armR: [1.25, 0, -0.3 - S(t * 20) * 0.05],
      spine: [0.5, s * 0.1, 0],
      head: [-0.4, 0, 0],
      by: Math.abs(C(p)) * 0.07,
      brz: S(p) * 0.05,
      k: 20,
    };
  },
  jump(c, t) {
    return {
      legL: [-0.95, 0, 0],
      kneeL: [1.5, 0, 0],
      legR: [-0.35, 0, 0],
      kneeR: [0.9, 0, 0],
      armL: [-2.5, 0, 0.45],
      armR: [-2.5, 0, -0.45],
      spine: [0.1, 0, 0],
      head: [-0.15, 0, 0],
      k: 22,
    };
  },
  vape(c, t, p) {
    const ex = p > 0.55;
    return {
      armR: [ex ? -0.9 : -1.3, 0, 0.38],
      elbR: [ex ? -1.5 : -2.05, 0, 0],
      head: [ex ? -0.32 : -0.05, 0, 0],
      k: 20,
    };
  },
  game(c, t) {
    return {
      by: -0.4,
      legL: [-1.5, 0, 0.12],
      legR: [-1.5, 0, -0.12],
      kneeL: [1.5, 0, 0],
      kneeR: [1.5, 0, 0],
      spine: [0.2, 0, 0],
      armL: [-0.95, 0, -0.12],
      armR: [-0.95, 0, 0.12],
      elbL: [-0.7 + S(t * 23) * 0.08, 0, 0],
      elbR: [-0.7 + S(t * 17) * 0.1, 0, 0],
      head: [0.06, S(t * 2.7) * 0.06, 0],
    };
  },
  sit(c, t) {
    return {
      by: -0.4,
      legL: [-1.5, 0, 0.1],
      legR: [-1.5, 0, -0.1],
      kneeL: [1.5, 0, 0],
      kneeR: [1.5, 0, 0],
      spine: [0.06 + S(t * 1.5) * 0.02, 0, 0],
      armL: [-0.5, 0, 0.05],
      armR: [-0.5, 0, -0.05],
      elbL: [-0.9, 0, 0],
      elbR: [-0.9, 0, 0],
      head: [0, S(t * 0.7) * 0.2, 0],
    };
  },
  celebrate(c, t) {
    const s = S(t * 12);
    return {
      by: Math.abs(S(t * 6.5)) * 0.2,
      armL: [-2.8 + s * 0.28, 0, 0.38],
      armR: [-2.8 - s * 0.28, 0, -0.38],
      elbL: [-0.25, 0, 0],
      elbR: [-0.25, 0, 0],
      legL: [Math.max(0, s) * -0.5, 0, 0],
      legR: [Math.max(0, -s) * -0.5, 0, 0],
      kneeL: [Math.max(0, s) * 0.8, 0, 0],
      kneeR: [Math.max(0, -s) * 0.8, 0, 0],
      head: [-0.22, 0, 0],
      spine: [-0.08, s * 0.1, 0],
    };
  },
  dizzy(c, t) {
    return {
      brz: S(t * 2.3) * 0.2,
      brx: S(t * 1.7) * 0.09,
      head: [S(t * 3) * 0.25, S(t * 2) * 0.4, S(t * 2.6) * 0.25],
      armL: [S(t * 2.3) * 0.3, 0, 0.4],
      armR: [-S(t * 2.3) * 0.3, 0, -0.4],
      legL: [S(t * 2.3) * 0.15, 0, 0.08],
      legR: [-S(t * 2.3) * 0.15, 0, -0.08],
      spine: [0.1, 0, S(t * 2.3) * 0.1],
    };
  },
  talk(c, t) {
    return {
      armR: [-0.55 + S(t * 5) * 0.25, 0, -0.25],
      elbR: [-1.15 + S(t * 6.3) * 0.3, 0, 0],
      armL: [-0.25, 0, 0.2],
      elbL: [-0.85 + S(t * 4.1) * 0.3, 0, 0],
      head: [S(t * 4) * 0.06, S(t * 1.7) * 0.12, 0],
      spine: [0.04, S(t * 1.3) * 0.05, 0],
    };
  },
  flirt(c, t) {
    return {
      brz: 0.1,
      armR: [0.25, 0, -0.75],
      elbR: [-1.7, 0, 0],
      armL: [-1.25 + S(t * 3) * 0.12, 0, 0.15],
      elbL: [-0.55, 0, 0],
      head: [-0.08, 0.18, S(t * 2) * 0.1],
      spine: [-0.05, -0.15, 0],
      legL: [-0.15, 0, 0.12],
      kneeL: [0.2, 0, 0],
    };
  },
  embarrassed(c, t) {
    return {
      armR: [-2.75, 0, 0.5],
      elbR: [-2.3 + S(t * 9) * 0.12, 0, 0],
      armL: [0, 0, 0.06],
      head: [0.32, -0.22, 0],
      spine: [0.16, 0, 0],
      by: -0.03,
      legL: [0, 0, -0.06],
      legR: [0, 0, 0.06],
    };
  },
  raise(c, t) {
    return {
      armR: [-3, 0, -0.08],
      armL: [-0.45, 0, 0.5],
      elbL: [-1.7, 0, 0],
      head: [-0.38, 0, 0],
      spine: [-0.1, 0, 0],
      by: S(t * 3) * 0.02,
    };
  },
  dance(c, t) {
    const q = t * 6.4 + (c.dph || 0),
      s = S(q);
    return {
      by: Math.abs(s) * 0.08,
      brz: s * 0.1,
      armL: [-1.2 + S(q * 2) * 0.45, 0, 0.6],
      armR: [-1.2 - S(q * 2) * 0.45, 0, -0.6],
      elbL: [-1.3, 0, 0],
      elbR: [-1.3, 0, 0],
      legL: [Math.max(0, s) * -0.3, 0, 0.06],
      legR: [Math.max(0, -s) * -0.3, 0, -0.06],
      kneeL: [Math.max(0, s) * 0.6, 0, 0],
      kneeR: [Math.max(0, -s) * 0.6, 0, 0],
      spine: [0.05, s * 0.25, 0],
      head: [0, -s * 0.15, s * 0.08],
    };
  },
  hitback(c, t) {
    return {
      spine: [-0.45, 0, 0],
      armL: [-1.4, 0, 0.9],
      armR: [-1.4, 0, -0.9],
      head: [-0.35, 0, 0],
      legL: [-0.3, 0, 0],
      by: -0.03,
      k: 26,
    };
  },
  laugh(c, t) {
    return {
      by: Math.abs(S(t * 11)) * 0.05,
      spine: [-0.25 + S(t * 11) * 0.07, 0, 0],
      head: [-0.32, 0, S(t * 5) * 0.08],
      armL: [-0.6, 0, -0.3],
      elbL: [-1.5, 0, 0],
      armR: [-0.6, 0, 0.3],
      elbR: [-1.5, 0, 0],
    };
  },
  wave(c, t) {
    return {
      armR: [-2.6, 0, -0.3 + S(t * 9) * 0.32],
      elbR: [-0.3, 0, 0],
      head: [-0.05, 0, 0.06],
    };
  },
  drink(c, t) {
    return {
      armR: [-1.5, 0, 0.32],
      elbR: [-2, 0, 0],
      head: [-0.45, 0, 0],
      spine: [-0.1, 0, 0],
    };
  },
  toast(c, t) {
    return {
      armR: [-2.25, 0, -0.2],
      elbR: [-0.4, 0, 0],
      head: [-0.12, 0, 0],
      by: Math.abs(S(t * 6)) * 0.03,
    };
  },
  phone(c, t) {
    return {
      armR: [-0.9, 0, 0.25],
      elbR: [-1.55, 0, 0],
      head: [0.32, 0, 0],
      spine: [0.08, 0, 0],
    };
  },
  point(c, t) {
    return { armR: [-1.5, 0, -0.08], head: [0, 0, 0], spine: [0.05, 0.15, 0] };
  },
  think(c, t) {
    return {
      armR: [-1, 0, 0.42],
      elbR: [-2.2, 0, 0],
      armL: [-0.3, 0, -0.5],
      elbL: [-1.4, 0, 0],
      head: [0.08, 0.2, 0.12],
    };
  },
  hold(c, t) {
    return {
      spine: [0.5, 0, S(t * 14) * 0.03],
      armL: [-0.7, 0, -0.4],
      elbL: [-1.5, 0, 0],
      armR: [-0.7, 0, 0.4],
      elbR: [-1.5, 0, 0],
      kneeL: [0.5, 0, 0],
      kneeR: [0.5, 0, 0],
      legL: [-0.3, 0, -0.08],
      legR: [-0.3, 0, 0.08],
      by: -0.07,
      head: [0.2, 0, 0],
    };
  },
};

const drinkColors = [
  0xffd55c, 0xefc46e, 0xca823d, 0xf6ba4f, 0x513630, 0xac5538, 0xfbd982,
];
drinkColors.forEach((col, i) => {
  ITEM["cup" + i] = () => {
    let g = grp();
    cyl(M(col), 0, 0.036, 0, 0.045, 0.13, g);
    cyl(M(0xfff2cc), 0, 0.104, 0, 0.045, 0.016, g);
    return g;
  };
});
const wardrobe = [
  {
    skin: 0xb87e59,
    hairStyle: "fade",
    shirt: 0x674239,
    pants: 0xc6b695,
    acc: { earrings: true },
  },
  {
    skin: 0xe4b795,
    hair: 0x715442,
    beard: "light",
    shirt: 0xd9bd93,
    pants: 0x333741,
    acc: { bag: true },
    h: 1.04,
  },
  { skin: 0xcd936d, hairStyle: "volume", shirt: 0xffedd2, pants: 0x363640 },
  { skin: 0xb78260, hairStyle: "short", shirt: 0x26282b, pants: 0x374650 },
  {
    skin: 0xb88868,
    hairStyle: "fade",
    stache: 0x302728,
    shirt: 0x24272b,
    shorts: true,
    build: -0.32,
    shoes: 0xab4536,
  },
  { skin: 0xd5a37e, hairStyle: "volume", shirt: 0xece2ce, pants: 0xc4bba7 },
  {
    skin: 0xc99673,
    hairStyle: "volume",
    beard: "full",
    shirt: 0x5e5b60,
    pants: 0x333643,
    shorts: true,
    build: 0.18,
    acc: { headset: "neck" },
  },
  {
    skin: 0xdba889,
    hair: 0xc69a5b,
    hairStyle: "long",
    shirt: 0x925575,
    pants: 0xe0c8aa,
    female: true,
  },
  {
    skin: 0xcb986f,
    hair: 0x918c85,
    shirt: 0x3b4d67,
    pants: 0x273747,
    acc: { glasses: true },
  },
];
export function makeActor(id) {
  let c = new Char(wardrobe[id]),
    specs = grp(c.H, 0, 0.236, 0.212);
  for (let x of [-0.078, 0.078])
    box(M(0x202733), x, 0, 0, 0.119, 0.063, 0.018, specs);
  box(M(0x333842), 0, 0.005, 0, 0.05, 0.014, 0.017, specs);
  specs.visible = false;
  if (id === 4) {
    let band = box(M(0xf6efe0), 0, 0.28, 0.215, 0.069, 0.53, 0.017, c.J.spine);
    band.rotation.z = 0.61;
    box(M(0xb73932), 0.113, 0.4, 0.182, 0.061, 0.018, 0.012, c.J.spine);
    box(M(0xb73932), 0.113, 0.4, 0.185, 0.018, 0.063, 0.012, c.J.spine);
  }
  if (id === 2)
    for (let i = -2; i <= 2; i++)
      box(
        M(0xc3994f),
        i * 0.065,
        0.3,
        0.202 - 0.016 * Math.abs(i),
        0.009,
        0.44,
        0.012,
        c.J.spine,
      );
  if (id === 3 || id === 4)
    for (let i = 0; i < 15; i++)
      sph(
        M(0x342927),
        0.162 * Math.cos(i * 2.4),
        0.361 + Math.sin(i) * 0.022,
        0.143 * Math.sin(i * 2.4),
        id === 3 ? 0.089 : 0.05,
        c.H,
      );
  c.s.scale.multiplyScalar(0.97);
  let heldKey = "";
  const fabrics = [];
  if (id === 7)
    c.g.traverse((n) => {
      if (n.isMesh && n.material === M(wardrobe[7].shirt)) {
        const m = n.material.clone();
        n.material = m;
        fabrics.push(m);
      }
    });

  return {
    root: c.g,
    body: c.body,
    specs,
    tint: (color) => fabrics.forEach((m) => m.color.set(color)),
    animate(dt, pose, speed, face, talk, item) {
      if ((item || "") !== heldKey) {
        heldKey = item || "";
        c.hold(item);
      }
      c.animate(dt, pose, speed, face, talk);
    },
  };
}
POSE.sleep = (c, t) => ({
  ...POSE.sit(c, t),
  head: [0.43 + Math.sin(t) * 0.08, 0, 0.14],
  spine: [0.32, 0, 0.04],
});
