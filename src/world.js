import { makeActor } from "./actors.js";
import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// Coordinates used by the mission scripts correspond to positions on the XZ plane.
const X = (x) => (x - 540) * 0.022,
  Z = (y) => (y - 460) * 0.03;
const V = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z);
const geo = {
  box: new T.BoxGeometry(1, 1, 1),
  ball: new T.SphereGeometry(0.5, 14, 10),
  cyl: new T.CylinderGeometry(0.5, 0.5, 1, 16),
  leaf: new T.IcosahedronGeometry(0.5, 0),
  cone: new T.ConeGeometry(0.5, 1, 12),
  ring: new T.TorusGeometry(1, 0.041, 6, 56),
};
const paint = new T.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.88,
});
const group = (parent, x = 0, y = 0, z = 0) => {
  let obj = new T.Group();
  parent.add(obj);
  obj.position.set(x, y, z);
  return obj;
};
const temp = new T.Object3D();
function part(
  parent,
  shape,
  color,
  x,
  y,
  z,
  sx,
  sy,
  sz,
  rx = 0,
  ry = 0,
  rz = 0,
) {
  const source = geo[shape],
    mesh = source.index ? source.toNonIndexed() : source.clone();
  mesh.deleteAttribute("uv");
  temp.position.set(x, y, z);
  temp.scale.set(sx, sy, sz);
  temp.rotation.set(rx, ry, rz);
  temp.updateMatrix();
  mesh.applyMatrix4(temp.matrix);
  let rgb = new T.Color(color),
    colors = new Float32Array(mesh.attributes.position.count * 3);
  for (let i = 0; i < colors.length; i += 3) rgb.toArray(colors, i);
  mesh.setAttribute("color", new T.BufferAttribute(colors, 3));
  (parent.userData.parts ??= []).push(mesh);
}
function bake(root) {
  root.traverse((n) => {
    const list = n.userData.parts;
    if (!list?.length) return;
    const m = new T.Mesh(mergeGeometries(list), paint);
    n.add(m);
    for (let g of list) g.dispose();
    delete n.userData.parts;
  });
}
function box(p, col, x, y, z, w, h, d, ...rot) {
  part(p, "box", col, x, y, z, w, h, d, ...rot);
}
function ball(p, col, x, y, z, w, h, d, ...rot) {
  part(p, "ball", col, x, y, z, w, h, d, ...rot);
}
function cyl(p, col, x, y, z, w, h, d, ...rot) {
  part(p, "cyl", col, x, y, z, w, h, d, ...rot);
}
const skins = [
  "#b17a57",
  "#e4b795",
  "#c89371",
  "#ba825e",
  "#b48263",
  "#d9a47f",
  "#ce9a76",
  "#dba889",
];
function sign(root, value, x, y, z, w, h, bg = "#1c4641") {
  let cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 96;
  let c = cv.getContext("2d");
  c.fillStyle = bg;
  c.fillRect(0, 0, 512, 96);
  c.fillStyle = "#ffdb91";
  c.fillRect(0, 86, 512, 6);
  c.font = "bold 46px system-ui";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(value, 256, 45, 486);
  let t = new T.CanvasTexture(cv);
  t.colorSpace = T.SRGBColorSpace;
  let mat = new T.MeshBasicMaterial({ map: t });
  let m = new T.Mesh(new T.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z);
  root.add(m);
}
function tree(r, x, z, k, palm = false) {
  cyl(r, "#8a6c4c", x, 1.6 * k, z, 0.29 * k, 3.2 * k, 0.34 * k);
  for (let i = 0; i < 7; i++) {
    let a = i * 2.399;
    part(
      r,
      "leaf",
      i % 2 ? "#436e4e" : "#6d8e5d",
      x + Math.cos(a) * k * 0.78,
      (3.1 + (i % 2) * 0.52) * k,
      z + Math.sin(a) * k * 0.78,
      (palm ? 3.3 : 2.4) * k,
      (palm ? 0.42 : 1.8) * k,
      1.37 * k,
      0,
      -a,
      palm ? 0.19 : 0,
    );
  }
}
function desk(r, x, z, w, d, top = "#cfad76", y = 0.94) {
  box(r, top, x, y, z, w, 0.12, d);
  for (let a of [-1, 1])
    for (let b of [-1, 1])
      box(
        r,
        "#605a50",
        x + a * (w * 0.43),
        y / 2,
        z + b * d * 0.36,
        0.1,
        y,
        0.11,
      );
}
function chair(r, x, z) {
  box(r, "#3a4647", x, 0.5, z, 0.57, 0.14, 0.59);
  box(r, "#354245", x, 0.95, z - 0.27, 0.55, 0.79, 0.11, -0.12);
  cyl(r, "#4d5553", x, 0.24, z, 0.13, 0.48, 0.13);
  cyl(r, "#4d5553", x, 0.055, z, 0.51, 0.07, 0.51);
}
function building(r, x, z, w, letter) {
  const wing = (w - 2.8) / 2;
  for (const side of [-1, 1])
    box(r, "#d1cbb2", x + side * (1.4 + wing / 2), 1.4, z, wing, 2.8, 3);
  box(r, "#f2ddbc", x, 2.86, z, w + 0.65, 0.23, 3.9);
  for (let k = 0; k < Math.floor(w / 2); k++) {
    let xx = x - w / 2 + 1.15 + k * 2;
    if (Math.abs(xx - x) < 1.55) continue;
    box(r, "#4d6c68", xx, 1.57, z + 1.52, 1.22, 1, 0.06);
    box(r, "#c4c1a8", xx, 1.56, z + 1.57, 0.055, 1, 0.04);
    box(r, "#dfd9bd", xx - 0.78, 1.35, z + 1.88, 0.12, 2.7, 0.15);
  }
  sign(r, "H8  " + letter, x + w / 2 - 1.3, 2.4, z + 1.58, 1.9, 0.42);
  sign(r, "HALL  " + letter, x, 2.69, z + 1.75, 1.5, 0.3);
}
function sceneArt(r, a) {
  let club = ["club", "bar", "mango", "arena"].includes(a),
    room = ["room", "class"].includes(a);
  box(
    r,
    club ? "#4a4351" : room ? "#bfad94" : "#8ba27b",
    0,
    -0.17,
    -6,
    150,
    0.3,
    120,
  );
  box(
    r,
    club ? "#78646b" : room ? "#dfceb4" : "#d6c7a8",
    0,
    -0.08,
    0,
    26,
    0.15,
    10.2,
  );
  for (let n = -12; n <= 12; n += 2)
    box(
      r,
      club ? "#8a7676" : room ? "#c6b8a0" : "#bfbaa0",
      n,
      0.002,
      0,
      0.014,
      0.009,
      10,
    );
  for (let n = -4; n <= 4; n += 2)
    box(
      r,
      club ? "#8a7676" : room ? "#c6b8a0" : "#bfbaa0",
      0,
      0.002,
      n,
      26,
      0.009,
      0.014,
    );
  if (!room && a !== "arena") {
    // Distant tree line gives the orbit camera a horizon on every side.
    for (let i = 0; i < 25; i++) {
      let angle = (i * Math.PI * 2) / 25,
        d = 46 + (i % 4) * 2;
      part(
        r,
        "leaf",
        club ? "#514864" : "#809e90",
        Math.cos(angle) * d,
        1.2,
        Math.sin(angle) * d,
        18,
        7 + (i % 5) * 1.45,
        13,
        0,
        angle,
        0,
      );
    }
  }
  if (a === "h8" || a === "yard") {
    box(r, "#c2b69a", 1, 0.015, -14, 2.8, 0.03, 20);
    box(r, "#f1dfbd", 1, 2.83, -16, 2.67, 0.14, 14);
    for (let k = 0; k < 3; k++) building(r, 1, -9 - k * 7, 26, "CBA"[k]);
    for (let k = 0; k < 18; k++) {
      let x = (k % 2 ? 1 : -1) * (13 + (Math.floor(k / 2) % 3) * 2.3);
      tree(r, x, 6 - Math.floor(k / 2) * 3, 1.05 + (k % 3) * 0.16);
    }
    sign(r, "CINECLUBE   ·   H8", -7, 1.7, -5.1, 3.7, 0.68);
    sign(r, "LANCHONETE", 8, 1.7, -5.1, 3.3, 0.68);
    for (let x of [-7, 8]) box(r, "#756450", x, 0.83, -5.17, 0.13, 1.7, 0.13);
    for (let j = 0; j < 7; j++) {
      let x = -11 + j * 3.5,
        z = -5.6;
      box(r, "#b0a084", x, 0.13, z, 2.0, 0.25, 0.62);
      for (let k = 0; k < 4; k++)
        part(
          r,
          "leaf",
          k % 2 ? "#64805a" : "#708e5b",
          x - 0.72 + k * 0.46,
          0.45,
          z,
          0.68,
          0.58,
          0.57,
        );
    }
    for (let x of [-10.5, 3, 10.4]) {
      desk(r, x, -4.94, 1.9, 0.53, "#976f4f", 0.51);
      box(r, "#916d4c", x, 0.79, -5.19, 1.9, 0.22, 0.11);
    }
    for (let x of [-11.7, 1.4, 11.8]) {
      cyl(r, "#566662", x, 1.4, -5.33, 0.085, 2.8, 0.085);
      ball(r, "#f5dea1", x, 2.88, -5.33, 0.32, 0.3, 0.32);
    }
    if (a === "yard")
      for (let k = 0; k < 6; k++) {
        let x = 2 + k * 0.83,
          z = -4.9;
        box(r, k % 2 ? "#587284" : "#6599a8", x, 0.33, z, 0.74, 0.66, 0.8);
        box(r, "#e1c465", x, 0.668, z, 0.1, 0.018, 0.8);
      }
  } else if (room) {
    box(r, "#e5d6be", 0, 2.05, -5.7, 27, 4.1, 0.2);
    box(r, "#efe3c9", -13.1, 1.6, -0.8, 0.18, 3.2, 9.6);
    for (let x of [-10, 3, 9]) {
      box(r, "#9a866a", x, 1.17, -5.55, 1.38, 2.34, 0.12);
      box(r, "#e8dcc6", x, 1.13, -5.45, 1.19, 2.24, 0.12);
      ball(r, "#958871", x + 0.4, 1.02, -5.36, 0.11, 0.11, 0.09);
    }
    if (a === "room") {
      desk(r, -3, -5, 6, 1.03, "#f3e8d8");
      desk(r, -6, -4.96, 1.5, 1, "#f3e8d8");
      chair(r, -3, -4.29);
      box(r, "#343c43", -3.25, 1.63, -5.1, 1.37, 0.83, 0.11);
      box(r, "#1d2730", -3.25, 1.63, -5.02, 1.29, 0.74, 0.02);
      box(r, "#4b4d4e", -3.25, 1.16, -5.1, 0.12, 0.35, 0.11);
      box(r, "#db8b48", -2.49, 1.024, -4.77, 0.48, 0.02, 0.29);
      for (let j = 0; j < 2; j++) {
        box(r, "#ede3ce", -3, 2.55 + j * 0.48, -5.35, 6, 0.095, 0.43);
        for (let k = 0; k < 18; k++)
          box(
            r,
            ["#698882", "#b18e60", "#ad715c"][k % 3],
            -5.7 + k * 0.29,
            2.75 + j * 0.48,
            -5.3,
            0.11,
            0.33,
            0.17,
          );
      }
      box(r, "#e7d7b1", 6, 1.13, -5.03, 1, 2.26, 0.85);
      for (let i = 0; i < 6; i++)
        box(
          r,
          ["#bc675c", "#588782", "#c1a263"][i % 3],
          5.74 + (i % 3) * 0.24,
          1.8 - (i % 2) * 0.25,
          -4.59,
          0.15,
          0.11,
          0.01,
        );
      box(r, "#755d4b", 10, 0.28, -4.94, 3.35, 0.52, 1.4);
      box(r, "#819699", 10, 0.58, -4.94, 3.35, 0.21, 1.43);
      box(r, "#d9ccaf", 11.12, 0.77, -4.95, 0.8, 0.17, 1.12);
      sign(r, "230", 2.98, 1.72, -5.34, 0.67, 0.32);
    } else {
      box(r, "#365653", -2, 2, -5.55, 9, 2, 0.11);
      sign(r, "CONCRETO ESTRUTURAL", -2, 2.15, -5.45, 6.8, 0.62);
      for (let i = 0; i < 4; i++) {
        desk(r, 3 + i * 2.3, -5, 1.6, 0.8);
        chair(r, 3 + i * 2.3, -4.45);
      }
    }
  } else if (a === "arena") {
    for (let k = -14; k <= 14; k += 2) {
      box(r, "#65b9ba", k, 0.02, -5, 0.045, 0.025, 11);
      box(r, "#51517c", k, 2.3, -6, 0.09, 4.6, 0.09);
    }
    sign(r, "INFRA   /   ARCADE", 0, 3.8, -6, 7, 1, "#26304c");
  } else {
    let toka = a === "club",
      mango = a === "mango";
    cyl(r, "#3c3945", 0, 0.29, -7.2, 10, 0.58, 4.5);
    box(r, "#3e3f49", 0, 1, -7, 3.5, 0.98, 0.9);
    for (let i of [-1, 1]) {
      box(r, "#36323b", i * 4.16, 2, -7, 0.19, 4, 0.19);
      box(r, "#302c38", i * 3.25, 1.02, -6.4, 0.74, 1.45, 0.64);
      for (let j = 0; j < 2; j++)
        ball(r, "#524e60", i * 3.25, 0.78 + j * 0.54, -6.06, 0.46, 0.46, 0.1);
    }
    cyl(r, toka ? "#c79550" : "#555267", 0, 4.03, -7.1, 10.1, 0.55, 5.7);
    for (let j = 0; j < 2; j++)
      part(
        r,
        "ring",
        mango ? "#f880b1" : "#ffdc7d",
        0,
        3.78 + j * 0.47,
        -7.1,
        5.12,
        2.89,
        0.97,
        Math.PI / 2,
        0,
        0,
      );
    if (toka || mango) {
      let dj = group(r, 0, 0.52, -7.05);
      ball(dj, "#313849", 0, 0.93, 0, 0.49, 0.64, 0.33);
      ball(dj, "#bf865f", 0, 1.4, 0, 0.32, 0.39, 0.3);
      ball(dj, "#3b3031", 0, 1.55, -0.02, 0.33, 0.2, 0.31);
      for (let side of [-1, 1]) {
        ball(dj, "#262b31", side * 0.16, 1.4, 0, 0.08, 0.14, 0.13);
        ball(dj, "#c49472", side * 0.25, 1.02, 0.19, 0.12, 0.13, 0.37, -0.34);
        cyl(r, "#232934", side * 0.66, 1.51, -6.9, 0.55, 0.025, 0.55);
        cyl(r, "#aa8a65", side * 0.66, 1.53, -6.9, 0.15, 0.025, 0.15);
      }
    }
    sign(
      r,
      toka
        ? "T   O   K   A"
        : mango
          ? "M   A   N   G   O"
          : "ESPETINHO  DA  EMA",
      0,
      4.06,
      -4.19,
      4.1,
      0.5,
      "#524249",
    );
    for (let i = 0; i < 22; i++) {
      let x = i * 1.3 - 14;
      ball(
        r,
        i % 2 ? "#ffdd91" : "#edb9a2",
        x,
        3.2 + Math.abs(x) * 0.035,
        -4.8,
        0.12,
        0.16,
        0.12,
      );
    }
    for (let i of [-1, 1]) {
      tree(r, i * 11, -6.4, 1.12, true);
      desk(r, i * 8, -5.2, 4, 0.95, "#b88357");
      for (let j = 0; j < 5; j++)
        cyl(
          r,
          ["#d7a84b", "#7c9a89", "#ab7758"][j % 3],
          i * 8 - 1.2 + j * 0.51,
          1.15,
          -5.2,
          0.12,
          0.33,
          0.12,
        );
    }
  }
  // Low, soft contact patches anchor trees and architecture without dynamic shadow maps.
  if (a === "h8" || a === "yard") {
    for (let k = 0; k < 13; k++)
      ball(r, "#7d946e", -12 + 2 * k, 0.005, -7.2, 3, 0.012, 1.6);
  }
  bake(r);
}
function create(canvas) {
  const renderer = new T.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.55));
  renderer.outputColorSpace = T.SRGBColorSpace;
  const world = new T.Scene(),
    camera = new T.PerspectiveCamera(44, 1, 0.1, 115);
  const sky = new T.HemisphereLight(0xffedd0, 0xa4adb3, 2.05),
    sun = new T.DirectionalLight(0xffe2b2, 2.4);
  sun.position.set(-8, 18, 9);
  world.add(sky, sun);
  const ray = new T.Raycaster(),
    plane = new T.Plane(V(0, 1, 0), 0),
    hitPoint = V(),
    ndc = new T.Vector2();
  const goalMarker = new T.Group();
  world.add(goalMarker);
  let gold = new T.MeshBasicMaterial({ color: 0xffb93a });
  const ring = new T.Mesh(new T.TorusGeometry(0.49, 0.045, 8, 42), gold);
  ring.rotation.x = Math.PI / 2;
  goalMarker.add(ring);
  const arrow = new T.Mesh(new T.ConeGeometry(0.14, 0.28, 5), gold);
  arrow.rotation.z = Math.PI;
  goalMarker.add(arrow);
  const shadowGeo = new T.CircleGeometry(0.33, 20),
    shadowMat = new T.MeshBasicMaterial({
      color: 0x3a3135,
      transparent: true,
      opacity: 0.19,
      depthWrite: false,
    });
  const actors = Array.from({ length: 9 }, (_, id) => {
    let rig = makeActor(id);
    let sh = new T.Mesh(shadowGeo, shadowMat);
    sh.rotation.x = -Math.PI / 2;
    sh.position.y = 0.018;
    rig.root.add(sh);
    world.add(rig.root);
    rig.root.visible = false;
    return rig;
  });
  let azimuth = 0,
    zoomScale = 1;
  let scenery = null,
    current = "",
    audience = [],
    discMeshes = [],
    beam = null,
    barrel = null,
    focus = V(),
    prior = null,
    heroYaw = 0,
    step = 0,
    hasGoal = false;
  const discMat = new T.MeshBasicMaterial({ color: 0x79f1d7 }),
    coreMat = new T.MeshBasicMaterial({ color: 0xffc976 }),
    discGeo = new T.SphereGeometry(0.55, 22, 15);
  function rebuild(a) {
    azimuth = 0;
    zoomScale = 1;
    if (scenery) {
      world.remove(scenery);
      scenery.traverse((n) => {
        if (n.isMesh) {
          n.geometry.dispose();
          if (n.material.map) {
            n.material.map.dispose();
            n.material.dispose();
          }
        }
      });
    }
    current = a;
    scenery = new T.Group();
    world.add(scenery);
    sceneArt(scenery, a);
    prior = null;
    const night = ["club", "bar", "mango", "arena"].includes(a);
    world.background = new T.Color(
      night ? "#4a425e" : a === "room" || a === "class" ? "#dfc9a2" : "#b6d6cd",
    );
    world.fog = new T.FogExp2(world.background, night ? 0.031 : 0.02);
    sun.color.set(night ? "#ffd7b5" : "#ffedd0");
    audience = [];
    if (["club", "mango", "bar"].includes(a)) {
      for (let i = 0; i < 20; i++) {
        let sprite = new T.Group();
        let x = -10 + (i % 10) * 2.12,
          z = i < 10 ? -4.7 : -2.4 + ((i * 7) % 11) * 0.55;
        sprite.userData.home = { x, z };
        sprite.rotation.y = i * 2.39;
        sprite.position.set(x, 0, z);
        let col = ["#685477", "#d68764", "#508782", "#79875d", "#bf7f94"][
          i % 5
        ];
        for (let s of [-1, 1]) {
          ball(sprite, "#4a454a", s * 0.085, 0.39, 0, 0.13, 0.75, 0.14);
          ball(
            sprite,
            skins[i % 7],
            s * 0.22,
            1.04,
            0,
            0.1,
            0.43,
            0.11,
            0,
            0,
            s * 0.19,
          );
        }
        ball(sprite, col, 0, 1.04, 0, 0.45, 0.6, 0.25);
        ball(sprite, skins[i % 7], 0, 1.5, 0, 0.28, 0.36, 0.26);
        ball(sprite, "#463834", 0, 1.64, -0.017, 0.3, 0.18, 0.27);
        bake(sprite);
        scenery.add(sprite);
        audience.push(sprite);
      }
    }
    beam = group(scenery);
    beam.visible = false;
    for (let i = 0; i < 2; i++) {
      for (let s of [-1, 1])
        box(
          beam,
          "#b79d77",
          (i - 0.5) * 4 + s * 1.3,
          0.34,
          -1,
          0.3,
          0.68,
          0.45,
        );
    }
    bake(beam);
    for (let i = 0; i < 2; i++) {
      const frame = group(beam);
      for (let k = 0; k < 12; k++) {
        let slat = group(frame, (i - 0.5) * 4 - 1.33 + k * 0.24, 0.72, -1);
        box(
          slat,
          i ? "#ad835d" : "#588679",
          0,
          0,
          0,
          0.247,
          i ? 0.12 : 0.17,
          0.42,
        );
      }
      bake(frame);
      frame.userData.index = i;
    }
    barrel = group(scenery);
    for (let j = 0; j < 7; j++)
      cyl(
        barrel,
        "#ffbd59",
        ((j % 4) - 1.5) * 0.062,
        0.02,
        -Math.floor(j / 4) * 0.077,
        0.045,
        0.1,
        0.045,
      );
    cyl(barrel, "#777781", 0, -0.045, 0, 0.34, 0.028, 0.27);
    bake(barrel);
  }
  const warning = new T.Mesh(
    new T.RingGeometry(0.94, 1.05, 48),
    new T.MeshBasicMaterial({ color: 0xff982f, side: T.DoubleSide }),
  );
  warning.rotation.x = -Math.PI / 2;
  world.add(warning);
  const pulse = new T.Mesh(
    new T.CylinderGeometry(0.048, 0.048, 1, 8),
    new T.MeshBasicMaterial({ color: 0xc4ffff }),
  );
  world.add(pulse);
  const haze = Array.from({ length: 5 }, () => {
    const puff = new T.Mesh(
      geo.ball,
      new T.MeshBasicMaterial({
        color: 0xcbd1c2,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
      }),
    );
    world.add(puff);
    return puff;
  });
  let shot = null,
    frameDt = 0;
  function setRig(id, x, z, yaw, walk, dancing, time, showSpecs) {
    const p = actors[id],
      s = shot,
      lead = id === s.hero,
      speaking = id === s.speaker;
    let pose = walk
        ? s.running && lead
          ? "sprint"
          : "walk"
        : dancing
          ? "dance"
          : "idle",
      face = dancing ? "happy" : "neutral",
      item = null;
    if (!walk && (s.intoxicated || (s.mission === 1 && s.area === "bar")))
      pose = "dizzy";
    if (dancing) {
      pose = "dance";
      if (id === 2) item = "cig";
    }
    if (lead && s.fx && s.fxTime > 0) {
      let motions = [
        "drink",
        "drink",
        "dance",
        "vape",
        "dance",
        "think",
        "vape",
      ];
      pose = motions[id];
      item = ["cup", "cup", "cig", "cig", null, "book", "vape"][id];
    }
    if (speaking && !walk) {
      pose = "talk";
      face = "happy";
    }
    if (lead && s.jump > 0) pose = "jump";
    if (s.drinker === id) {
      pose = "toast";
      face = "grin";
      item = "cup" + (s.beerIndex ?? 0);
    }
    if (s.beatScene === "mic" && id === 2) {
      pose = "raise";
      item = "mic";
    }
    if (s.beatScene === "briga" && s.voices.some((v) => v.id === id))
      pose = "wave";
    if (s.beatScene === "foto") {
      pose = "celebrate";
      face = "grin";
    }
    if (s.beatScene === "moniz") pose = id === 4 ? "sleep" : "sit";
    if (s.beatScene === "beijo" || s.beatScene === "tapa") {
      if (id === 0 || id === 7) {
        x = X(711) + (id === 0 ? -0.2 : 0.2);
        z = Z(405);
        yaw = id === 0 ? Math.PI / 2 : -Math.PI / 2;
        pose =
          s.beatScene === "beijo"
            ? "flirt"
            : id === 0
              ? "embarrassed"
              : "point";
        face =
          s.beatScene === "beijo" ? "happy" : id === 0 ? "shock" : "annoyed";
      } else pose = s.beatScene === "beijo" ? "celebrate" : "laugh";
    }
    if (id === 8) pose = speaking ? "point" : "think";
    if (!walk && speaking && id !== s.hero)
      yaw = Math.atan2(X(s.pos.x) - x, Z(s.pos.y) - z);
    p.root.visible = true;
    p.root.position.set(x, lead ? s.jump : 0, z);
    p.root.rotation.y = yaw;
    p.specs.visible = showSpecs;
    if (id === 3 && lead && s.fxTime > 1.3) {
      pose = "think";
      item = "paper";
    }
    if (s.beatScene === "console" && id === 6) {
      pose = "game";
      face = "shock";
    }
    if (s.beatScene === "moniz" && id === 4) face = "sleepy";
    p.animate(
      frameDt,
      pose,
      walk * (s.running && lead ? 9 : 4),
      face,
      speaking,
      item,
    );
  }
  function frame(s) {
    if (s.area !== current) rebuild(s.area);
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    if (!w || !h) return;
    if (canvas.dataset.extent !== w + "x" + h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      canvas.dataset.extent = w + "x" + h;
    }
    let x = X(s.pos.x),
      z = Z(s.pos.y),
      t = s.time,
      dt = prior ? Math.min(0.09, Math.max(0, t - prior.t)) : 0;
    shot = s;
    frameDt = dt;
    const dx = prior ? x - prior.x : 0,
      dz = prior ? z - prior.z : 0,
      travel = Math.hypot(dx, dz),
      walk = travel > 0.0005;
    if (walk) {
      let yaw = Math.atan2(dx, dz);
      heroYaw +=
        Math.atan2(Math.sin(yaw - heroYaw), Math.cos(yaw - heroYaw)) *
        Math.min(1, dt * 19);
      step += travel * 4.35;
    }
    if (!prior) {
      heroYaw = 0.15;
      focus.set(x, 0, z);
    }
    const panning = 1 - Math.exp(-6.5 * dt);
    let target = s.mini?.kind === "duel" ? V(-2, 0, -2) : V(x, 0, z);
    let focusId = s.drinker >= 0 ? s.drinker : s.cinematic ? s.speaker : -1;
    if (s.beatScene === "foto") {
      target.set(x - 1, 0, z - 0.5);
    }
    if (
      s.cinematic &&
      s.beatScene !== "foto" &&
      focusId >= 0 &&
      actors[focusId]?.root.visible
    ) {
      let f = actors[focusId].root.position;
      target.set(f.x, 0, f.z);
    }
    if (!prior) focus.copy(target);
    else focus.lerp(target, panning);
    prior = { x, z, t };
    actors.forEach((p) => (p.root.visible = false));
    setRig(
      s.hero,
      x,
      z,
      heroYaw,
      walk ? 1 : 0,
      s.dance > 0,
      s.dance > 0 ? t * 9 : step,
      s.glasses,
    );
    s.team.forEach((id, i) => {
      let parked = s.area === "club" && s.mission === 0;
      let tx = parked ? -6.55 + (i % 3) * 0.91 : x + ((i % 3) - 1) * 0.99,
        tz = parked
          ? 0.5 + Math.floor(i / 3) * 1.02
          : z - 0.96 - Math.floor(i / 3) * 0.88;
      let p = actors[id],
        worldKey = s.area + ":" + s.hero;
      if (
        p.key !== worldKey ||
        Math.hypot(p.root.position.x - tx, p.root.position.z - tz) > 6
      ) {
        p.root.position.set(tx, 0, tz);
        p.key = worldKey;
      }
      let px = p.root.position.x,
        pz = p.root.position.z,
        amt = 1 - Math.exp(-5 * dt),
        d = Math.hypot(tx - px, tz - pz);
      setRig(
        id,
        px + (tx - px) * amt,
        pz + (tz - pz) * amt,
        d > 0.11 ? Math.atan2(tx - px, tz - pz) : 0.2 + (i - 3) * 0.13,
        Math.min(1, d),
        parked && id === 2,
        t * 8 + i,
        false,
      );
    });
    for (const q of s.locals)
      setRig(q.id, X(q.x), Z(q.y), q.yaw ?? 0.32, 0, q.dancing, t, false);
    if (s.area === "mango")
      for (let v of s.voices)
        setRig(v.id, X(v.x), Z(v.y), -0.2, 0, true, t * 6 + v.id, false);
    if (s.girl) actors[7].tint(s.girl.color);
    if (s.girl && s.area === "club")
      setRig(7, X(731), Z(416), -0.35, 0, false, 0, false);
    audience.forEach((a, i) => {
      a.rotation.z = 0.047 * Math.sin(t * 3 + i);
      a.position.y = 0.025 * Math.sin(t * 4 + i);
      const h = a.userData.home,
        ax = h.x + 0.29 * Math.sin(t * 0.68 + i),
        az = h.z + 0.24 * Math.cos(t * 0.73 + i),
        dx = ax - x,
        dz = az - z,
        d = Math.hypot(dx, dz),
        avoid = Math.max(0, 1.3 - d);
      a.position.x = T.MathUtils.lerp(
        a.position.x,
        ax + (dx / (d || 1)) * avoid,
        Math.min(1, dt * 6),
      );
      a.position.z = T.MathUtils.lerp(
        a.position.z,
        az + (dz / (d || 1)) * avoid,
        Math.min(1, dt * 6),
      );
    });
    barrel.visible = s.tray;
    if (s.tray) barrel.position.set(x + 0.27, 1.08, z + 0.15);
    beam.visible = s.mini?.kind === "beam";
    if (beam.visible) {
      for (let f of beam.children.filter((n) => "index" in n.userData)) {
        f.children.forEach((n, k) => {
          let wave = Math.sin((Math.PI * k) / 11);
          n.position.y =
            0.72 -
            wave * (s.mini.load || 0) * (f.userData.index ? 0.12 : 0.045);
        });
      }
    }
    let far = s.mini?.kind === "duel",
      zoom = far
        ? Math.max(15, 20 / camera.aspect)
        : Math.max(6.9, 5.7 / camera.aspect);
    zoom *= far
      ? 1
      : zoomScale *
        (s.cinematic &&
        focusId >= 0 &&
        s.drinker !== 0 &&
        s.beatScene !== "foto"
          ? 0.68
          : 1);
    if (s.cinematic && s.beatScene === "moniz") zoom *= 1.1;
    let angle = far ? 0 : azimuth;
    camera.position.set(
      focus.x + Math.sin(angle) * zoom,
      zoom * 0.49 + 1.16,
      focus.z + Math.cos(angle) * zoom,
    );
    camera.lookAt(focus.x, far ? 0.65 : 1.16, focus.z);
    camera.updateMatrixWorld();
    hasGoal = Boolean(s.goal);
    goalMarker.visible = hasGoal;
    if (hasGoal) {
      goalMarker.position.set(X(s.goal.x), 0.04, Z(s.goal.y));
      arrow.position.y = 0.52 + 0.09 * Math.sin(4 * t);
      ring.scale.setScalar(1 + 0.055 * Math.sin(t * 4));
    }
    let targets = far ? s.mini.targets : [];
    while (discMeshes.length < targets.length) {
      let m = new T.Mesh(discGeo, discMat);
      let core = new T.Mesh(discGeo, coreMat);
      core.scale.setScalar(0.48);
      core.position.z = 0.4;
      m.add(core);
      // Abstract rival on an arcade pedestal; the illuminated disc is the hit area.
      let rival = new T.Group();
      ball(rival, "#796ab6", 0, -0.53, -0.13, 0.44, 0.66, 0.31);
      ball(rival, "#c49ce8", 0, 0.1, -0.4, 0.36, 0.36, 0.29);
      for (let side of [-1, 1]) {
        box(rival, "#695795", side * 0.13, -1, -0.15, 0.14, 0.46, 0.15);
        ball(rival, "#9a80c6", side * 0.27, -0.46, -0.15, 0.13, 0.45, 0.13);
      }
      bake(rival);
      m.add(rival);
      world.add(m);
      discMeshes.push(m);
    }
    discMeshes.forEach((m, i) => {
      let q = targets[i];
      m.visible = !!q;
      if (q) {
        m.position.set(
          X(q.x) + Math.sin(t * 2 + q.phase) * 0.86,
          1.45 + Math.cos(t * 3 + q.phase) * 0.24,
          Z(q.y),
        );
        m.userData.target = q;
      }
    });
    if (s.beatScene === "briga") {
      audience.forEach((a, i) => {
        a.rotation.z = 0.28 * Math.sin(t * 5 + i);
        a.position.x += Math.sin(t * 3 + i) * dt * 0.6;
      });
    }
    warning.visible = !!s.wave?.marked && !s.cinematic;
    if (warning.visible) {
      warning.position.set(X(s.wave.x), 0.035, Z(s.wave.y));
      warning.material.color.set(s.wave.t > 5.3 ? 0xff5540 : 0xffba54);
    }
    pulse.visible = far && s.flash && t - s.flash.t < 0.22;
    if (pulse.visible) {
      let a = V(x, 1.12, z),
        b = V(X(s.flash.x), 1.45, Z(s.flash.y)),
        v = b.clone().sub(a);
      pulse.position.copy(a).lerp(b, 0.5);
      pulse.scale.y = v.length();
      pulse.quaternion.setFromUnitVectors(V(0, 1, 0), v.normalize());
    }
    const smoking =
      s.beatScene === "console" || (s.fxTime > 0 && [2, 3, 6].includes(s.hero));
    haze.forEach((p, i) => {
      p.visible = smoking;
      if (!smoking) return;
      const fire = s.beatScene === "console",
        k = (t * 0.62 + i / 5) % 1;
      p.position.set(
        (fire ? -3.25 : x) + k * 0.25,
        (fire ? 1.78 : 1.65) + k * 0.92,
        (fire ? -5.05 : z) + 0.1 * Math.sin(t + i),
      );
      p.scale.setScalar(0.09 + k * 0.34);
      p.material.opacity = 0.43 * (1 - k);
    });
    renderer.render(world, camera);
  }
  function click(e, s) {
    let r = canvas.getBoundingClientRect();
    ndc.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      1 - ((e.clientY - r.top) / r.height) * 2,
    );
    ray.setFromCamera(ndc, camera);
    if (s?.kind === "duel") {
      let hit = ray.intersectObjects(
        discMeshes.filter((m) => m.visible),
        false,
      )[0];
      if (hit) return { disc: hit.object.userData.target };
    }
    if (hasGoal && ray.intersectObjects(goalMarker.children, false).length)
      return { goal: true };
    if (!s || s.kind !== "duel") {
      const roots = actors.filter((p) => p.root.visible).map((p) => p.root),
        hit = ray.intersectObjects(roots, true)[0];
      if (hit) {
        let o = hit.object;
        while (o && !roots.includes(o)) o = o.parent;
        const id = actors.findIndex((p) => p.root === o);
        if (id >= 0 && id !== shot.hero) return { actor: id };
      }
    }
    if (ray.ray.intersectPlane(plane, hitPoint))
      return { x: hitPoint.x / 0.022 + 540, y: hitPoint.z / 0.03 + 460 };
  }
  function marker(goal) {
    let r = V(X(goal.x), 0.95, Z(goal.y)).project(camera);
    return { x: (r.x + 1) / 2, y: (1 - r.y) / 2 };
  }
  return {
    actorPositions: () =>
      actors.flatMap((p, id) =>
        p.root.visible
          ? [
              {
                id,
                x: p.root.position.x / 0.022 + 540,
                y: p.root.position.z / 0.03 + 460,
              },
            ]
          : [],
      ),
    frame,
    click,
    marker,
    rotate: (amount) => {
      azimuth += amount;
    },
    zoom: (scale) => {
      zoomScale = T.MathUtils.clamp(zoomScale * scale, 0.73, 1.5);
    },
    angle: () => (current === "arena" ? 0 : azimuth),
    reset: () => {
      prior = null;
      azimuth = 0;
      zoomScale = 1;
    },
  };
}
window.createInfraWorld = create;
