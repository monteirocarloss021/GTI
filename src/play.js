// Shared by the WebGL renderer and the illustrated fallback.
const play = {
  locals: [],
  beatScene: "",
  speaker: -1,
  intoxicated: false,
  jump: 0,
  jumpTime: 0,
  stamina: 100,
  running: false,
  exhausted: false,
  fxTime: 0,
  motion: 0,
  companionLines: new Map(),
  social: null,
  lastBark: 0,
};
function resetPlayScene() {
  Object.assign(play, {
    locals: [],
    beatScene: "",
    speaker: -1,
    jump: 0,
    jumpTime: 0,
    stamina: 100,
    running: false,
    exhausted: false,
    fxTime: 0,
    motion: 0,
    social: null,
    lastBark: clock,
    approach: null,
    wave: null,
    round: null,
    rescueRound: null,
    flash: null,
  });
  play.companionLines.clear();
}
const gathering = [
  [505, 385],
  [569, 377],
  [618, 407],
  [492, 436],
  [566, 455],
  [633, 474],
  [685, 441],
];
function gather(ids) {
  play.locals = ids.map((id, i) => ({
    id,
    x: gathering[i][0],
    y: gathering[i][1],
  }));
}
function local(id, x, y) {
  return { id, x, y };
}
const banter = [
  [
    "Tira a foto agora, antes que alguém pisque.",
    "Quando essa foto for pro álbum, eu quero uma cópia.",
  ],
  [
    "Nós é os ITA! Já conferiu se vieram os sete?",
    "Se alguém ficar pra trás, a gente espera.",
  ],
  [
    "Testa esse passo comigo. Um, dois… agora vira!",
    "Na Mango funcionou. Mais ou menos.",
  ],
  [
    "Se perder a turma, procura minha camiseta preta.",
    "No pátio eu reconheço a nossa caixa até de longe.",
  ],
  [
    "Prova melada, rapaziada! Alguém avisou o Moniz?",
    "Já deixei o despertador ligado. Dessa vez vai.",
  ],
  [
    "Mais uma questão de auditor. Prometo que é a última.",
    "Marrom, para de descer gelo e lê o enunciado comigo.",
  ],
  [
    "A próxima rodada é em dupla. Quem fecha comigo?",
    "Me chama que eu vou junto. Só vou guardar o headset.",
  ],
];
function partyPositions() {
  if (world3d && !display3D.hidden) return world3d.actorPositions();
  return [
    ...play.locals,
    ...team.map((id, i) => ({
      id,
      x: companionPos[id]?.x ?? pos.x - 45 + i * 8,
      y: companionPos[id]?.y ?? pos.y - 22,
    })),
    ...voices,
  ];
}
function nearestFriend() {
  let list = partyPositions().filter((q) => q.id < 7 && q.id !== hero);
  return list
    .map((q) => ({ ...q, d: Math.hypot(q.x - pos.x, q.y - pos.y) }))
    .sort((a, b) => a.d - b.d)[0];
}
function talkFriend(targetId) {
  if (modal || paused || ending) return;
  let q = nearestFriend();
  if (Number.isInteger(targetId)) {
    q = partyPositions().find((v) => v.id === targetId);
    if (q) q.d = Math.hypot(q.x - pos.x, q.y - pos.y);
  }
  if (!q || q.d > 96) {
    caption("Chegue perto de um amigo para conversar.");
    return;
  }
  let id = q.id,
    round = play.companionLines.get(id) || 0;
  play.companionLines.set(id, round + 1);
  let line = banter[id][round % 2];
  play.speaker = id;
  panel("Conversa　/　" + areas[area], cast[id], line, [
    [
      "Responder",
      () => {
        story(
          cast[hero],
          [
            "“Tô contigo. Encontro a turma já!”",
            "“Combinado. Guarda meu lugar.”",
          ][round % 2],
          () => {
            play.speaker = -1;
          },
        );
      },
    ],
    [
      "Voltar à missão",
      () => {
        play.speaker = -1;
      },
    ],
  ]);
}
function jumpNow() {
  if (
    !modal &&
    !paused &&
    !ending &&
    mission >= 0 &&
    play.jumpTime <= 0 &&
    play.stamina >= 8
  ) {
    play.jumpTime = 0.64;
    play.stamina -= 8;
    note(174, 0.09, 0.022, "triangle");
  }
}
function tickMotion(dt, walk, sprint) {
  play.running = walk && sprint && !play.exhausted;
  play.stamina = clamp(play.stamina + dt * (play.running ? -14 : 11), 0, 100);
  if (play.stamina <= 1) play.exhausted = true;
  if (play.stamina >= 25) play.exhausted = false;
  play.jumpTime = Math.max(0, play.jumpTime - dt);
  play.jump =
    play.jumpTime > 0 ? 0.78 * Math.sin((Math.PI * play.jumpTime) / 0.64) : 0;
  play.fxTime = Math.max(0, play.fxTime - dt);
  let speed = boost ? 445 : play.running ? 330 : 205;
  play.motion += ((walk ? speed : 0) - play.motion) * (1 - Math.exp(-dt * 16));
  if (walk && team.length && clock - play.lastBark > 12 && !captionTime) {
    let id = pick(team);
    caption(cast[id] + "　·　" + banter[id][0]);
    play.lastBark = clock;
  }
  return play.motion;
}
function drawRadar() {
  const el = $("radar"),
    ctx = el.getContext("2d"),
    show = mission >= 0 && !modal && !ending;
  el.hidden = !show;
  $("meter").hidden = !show;
  $("talkBtn").hidden = !show;
  if (!show) return;
  $("fuel").style.width = play.stamina + "%";
  let friend = nearestFriend(),
    talk = $("talkBtn");
  talk.hidden = !friend || friend.d > 96;
  talk.textContent = friend ? "F · " + cast[friend.id] : "Conversar";
  ctx.clearRect(0, 0, 130, 82);
  ctx.fillStyle = "#182c2bea";
  ctx.fillRect(0, 0, 130, 82);
  ctx.strokeStyle = "#b0d9b027";
  ctx.lineWidth = 1;
  for (let x = 10; x < 129; x += 18) {
    ctx.beginPath();
    ctx.moveTo(x, 5);
    ctx.lineTo(x, 78);
    ctx.stroke();
  }
  for (let y = 8; y < 81; y += 18) {
    ctx.beginPath();
    ctx.moveTo(4, y);
    ctx.lineTo(126, y);
    ctx.stroke();
  }
  function dot(x, y, color, size) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(
      5 + (x / 1080) * 120,
      6 + ((y - 300) / 320) * 70,
      size,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  for (let q of partyPositions())
    if (q.id !== hero) dot(q.x, q.y, "#8bd7c5", 2);
  if (goal) dot(goal.x, goal.y, "#ffc966", 4);
  dot(pos.x, pos.y, "white", 3);
}
// The incoming wave first marks the spot it will hit. It is shared by both renderers.
function challengeTick(dt) {
  const fighting = mini?.kind === "duel",
    rescuing = play.beatScene === "briga" && voices.length;
  if (!fighting && !rescuing) {
    play.wave = null;
    play.round = null;
    $("alertZone").hidden = true;
    return false;
  }
  const round = fighting ? mini : play.rescueRound;
  if (play.round !== round) {
    play.round = round;
    play.wave = { t: 0, x: 0, y: 0, hp: 3, serial: 0 };
  }
  const w = play.wave;
  if (!w) return false;
  w.t += dt;
  if (w.t > 3.8 && !w.marked) {
    w.marked = true;
    w.x = pos.x;
    w.y = pos.y;
    w.serial++;
    note(200, 0.12, 0.035);
  }
  if (w.t >= 6) {
    const touched =
      Math.hypot((pos.x - w.x) * 0.022, (pos.y - w.y) * 0.03) < 1.05 &&
      play.jump < 0.18 &&
      !(rescuing && dance > 0.05);
    w.marked = false;
    w.t = 0;
    if (touched) {
      w.hp--;
      caption(
        fighting
          ? "Pulso recebido! Saia do círculo âmbar."
          : "Turma espalhada! Use X para reagrupar.",
      );
      if (w.hp <= 0) {
        play.wave = null;
        play.round = null;
        const id = hero,
          n = mini?.count || 4,
          ids = play.rescueRound;
        panel(
          "Ponto de retorno",
          fighting ? "Fim da rodada" : "O grupo se perdeu",
          fighting
            ? "O rival levou esta rodada. Você volta ao mesmo duelo."
            : "Gaba volta à saída da Mango. Os mesmos dois amigos precisam dele.",
          [
            [
              "Tentar novamente",
              () => (fighting ? duel(id, n) : searchFriends(ids, true)),
            ],
          ],
        );
        return true;
      }
    }
  }
  let el = $("alertZone");
  el.hidden = false;
  el.textContent =
    (fighting ? "Escudo " : "Grupo ") +
    "◆".repeat(w.hp) +
    "◇".repeat(3 - w.hp) +
    (w.marked ? "　•　Saia do círculo ou pule" : "");
  return false;
}

function clickCast(id) {
  const who = partyPositions().find((q) => q.id === id);
  if (!who || id === hero) return false;
  if (goal && Math.hypot(goal.x - who.x, goal.y - who.y) < 65) {
    go = { x: goal.x, y: goal.y };
    play.approach = null;
    return true;
  }
  if (id >= 7) return false;
  if (Math.hypot(pos.x - who.x, pos.y - who.y) < 96) talkFriend(id);
  else {
    play.approach = id;
    go = { x: clamp(who.x, 18, 1062), y: clamp(who.y, 320, 603) };
  }
  return true;
}
const rescueThanks = [
  "Valeu por voltar, Gaba. Agora conta de novo os sete.",
  "Achei que tu já tava no H8. Valeu por me esperar.",
  "",
  "Tava te chamando do outro lado. Ainda bem que tu ouviu.",
  "Salvou, meu parceiro. Achei que a festa ia até amanhã.",
  "Sete no portão. Pode registrar que tu voltou pra buscar a gente.",
  "Reconheci teu passo de longe. Valeu por voltar.",
];
const rescueJokes = [
  "Na próxima, deixa a dancinha lá dentro, papai.",
  "Nós é os ITA, mas aquele passinho na saída nunca mais.",
  "",
  "Avisa antes do próximo passinho que eu já vou pro portão.",
  "A dança eu aprovo. O local, nunca mais.",
  "Questão de auditor: quem autorizou aquela dança na saída?",
  "Na próxima vez que tu quiser dançar, eu seguro a porta.",
];

let lastSnap = "",
  albumToka = "";
try {
  albumToka = localStorage.getItem("infra27.photo.toka") || "";
} catch {}
function updateAlbum(canvas) {
  const mode =
    !paused && mission === 0 && drinker === 0
      ? "toka"
      : ending && mission === 3 && play.beatScene === "foto"
        ? "patio"
        : "";
  const album = $("album");
  if (!mode) {
    album.hidden = true;
    lastSnap = "";
    return;
  }
  if (lastSnap === mode) return;
  lastSnap = mode;
  const thumb = document.createElement("canvas");
  thumb.width = 360;
  thumb.height = 200;
  thumb.getContext("2d").drawImage(canvas, 0, 0, 360, 200);
  const img = thumb.toDataURL("image/jpeg", 0.72);
  if (mode === "toka") {
    albumToka = img;
    try {
      localStorage.setItem("infra27.photo.toka", img);
    } catch {}
  } else {
    $("oldPhoto").parentElement.hidden = !albumToka;
    if (albumToka) $("oldPhoto").src = albumToka;
    $("newPhoto").src = img;
    album.hidden = false;
  }
}

function exploreLocation(place, id = hero) {
  scene(place, id);
  gather(cast.map((_, index) => index).filter((index) => index !== hero));
  if (place === "room") {
    target(
      "Saída para os jardins",
      848,
      364,
      () => exploreLocation("h8"),
      "Explore o 230. A porta leva de volta aos jardins.",
    );
  } else {
    markHall();
  }
}
function markHall() {
  target(
    "Hall do H8",
    588,
    329,
    openHall,
    "Converse com a turma ou siga até o hall para visitar o 230.",
  );
}
function openHall() {
  // Choosing to stay should leave the doorway available for a later visit.
  const leave = () => {
    pos.y = Math.max(pos.y, 377);
    markHall();
  };
  panel(
    "Exploração livre",
    "Hall do H8",
    "Um corredor coberto liga os halls dos três blocos térreos do projeto de Oscar Niemeyer para o CTA.",
    [
      ["Visitar o apartamento 230", () => exploreLocation("room")],
      ["Consultar a planta", showApartmentPlan],
      ["Voltar aos jardins", leave],
    ],
  );
}
function showApartmentPlan() {
  panel(
    "H8 · planta esquemática",
    "Um apartamento de três quartos",
    "Cada quarto acomoda duas pessoas, com cama, mesa de estudo, armário e prateleiras. Há também apartamentos de dois quartos. A pequena copa e o banheiro ficam junto à entrada.",
    [
      [
        "Consultar a numeração",
        () =>
          panel(
            "H8 · diretório dos blocos",
            "Os corredores",
            "Antes do hall ficam os apartamentos 01 a 13. Depois vêm os de 15 a 30. Na face oposta estão os de 31 a 42 no bloco A e de 31 a 41 no B. O bloco C termina no 30.",
            [
              ["Voltar à planta", showApartmentPlan],
              ["Voltar ao hall", openHall],
            ],
          ),
      ],
      ["Voltar ao hall", openHall],
    ],
  );
  const plan = document.createElement("canvas");
  plan.width = 560;
  plan.height = 238;
  plan.style.cssText =
    "display:block;width:100%;max-width:420px;height:auto;margin:10px auto";
  plan.setAttribute("role", "img");
  plan.setAttribute(
    "aria-label",
    "Planta esquemática com copa e banheiro no hall de entrada e três quartos mobiliados para duas pessoas cada.",
  );
  const ctx = plan.getContext("2d");
  ctx.scale(2, 2);
  ctx.fillStyle = "#152822";
  ctx.fillRect(0, 0, 280, 119);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "#dbcdac";
  const wall = (x, y, X, Y) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(X, Y);
    ctx.stroke();
  };
  // The building plan is rotated a quarter turn to fit a phone screen.
  const walls = [
    [8, 12, 174, 12],
    [174, 12, 174, 102],
    [174, 102, 8, 102],
    [8, 12, 8, 51],
    [8, 62, 8, 102],
    [8, 42, 23, 42],
    [33, 42, 44, 42],
    [8, 72, 23, 72],
    [33, 72, 44, 72],
    [44, 12, 44, 43],
    [44, 52, 44, 62],
    [44, 71, 44, 102],
    [44, 57, 133, 57],
    [133, 12, 133, 42],
    [133, 51, 133, 63],
    [133, 72, 133, 102],
  ];
  for (const [x, y, X, Y] of walls) wall(x, y, X, Y);
  const rect = (x, y, w, h, col) => {
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
  };
  const bed = (x, y) => {
    rect(x, y, 16, 7, "#6eb6b3");
    rect(x + 1, y + 1, 4, 5, "#cce7db");
  };
  for (const [x, y] of [
    [46, 14],
    [115, 14],
    [46, 93],
    [115, 93],
    [136, 14],
    [136, 93],
  ])
    bed(x, y);
  for (const [x, y] of [
    [73, 14],
    [86, 14],
    [73, 96],
    [86, 96],
    [164, 29],
    [164, 79],
  ])
    rect(x, y, 8, 4, "#b99570");
  for (const [x, y] of [
    [85, 51],
    [85, 58],
    [136, 25],
    [136, 86],
  ])
    rect(x, y, 12, 5, "#c87d64");
  ctx.font = "5px sans-serif";
  ctx.fillStyle = "#f3e0b4";
  ctx.fillText("COPA", 20, 28);
  ctx.fillText("ENTRADA", 12, 59);
  ctx.fillText("BANHEIRO", 13, 90);
  ctx.fillText("QUARTO 1", 76, 37);
  ctx.fillText("QUARTO 2", 76, 81);
  ctx.fillText("QUARTO 3", 141, 59);
  ctx.font = "bold 7px sans-serif";
  ctx.fillText("APT. DE TRÊS QUARTOS", 182, 26);
  ctx.font = "7px sans-serif";
  bed(183, 38);
  for (const [y, txt, color] of [
    [41, "Cama", "#6eb6b3"],
    [56, "Mesa de estudo", "#b99570"],
    [71, "Armário", "#c87d64"],
  ]) {
    if (txt !== "Cama") rect(183, y - 3, 16, 6, color);
    ctx.fillStyle = "#eee3ce";
    ctx.fillText(txt, 205, y + 2);
  }
  ctx.font = "6px sans-serif";
  ctx.fillText("Referência: WikITA · H8", 182, 95);
  $("body").appendChild(plan);
}
