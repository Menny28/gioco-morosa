/* =============================================================
   TOMMY ❤ — logica di gioco
   Tutte le parti pensate per essere personalizzate sono segnate
   con "MODIFICA QUI" — cercale per adattare il gioco a voi due.
   ============================================================= */

/* ---------- 1. CONFIGURAZIONE (MODIFICA QUI) ---------- */

// Data di inizio, per il contatore "giorni insieme". Mese 0=gennaio.
const START_DATE = new Date(2025, 5, 22);

// Quanto tempo reale serve perché una statistica scenda da 100 a 0.
// Aumenta le ore se vuoi che Tommy resti in forma più a lungo tra una visita e l'altra.
const HOURS_TO_EMPTY = { fame: 20, igiene: 30, energia: 24 };
const DECAY_PER_MIN = {
  fame:    100 / (HOURS_TO_EMPTY.fame    * 60),
  igiene:  100 / (HOURS_TO_EMPTY.igiene  * 60),
  energia: 100 / (HOURS_TO_EMPTY.energia * 60),
};
const LOW_THRESHOLD = 35;

// Ore in cui Tommy va a dormire da solo (formato 24h). Durante questa
// fascia il gioco si blocca, le statistiche non calano e al risveglio
// l'energia torna piena.
const NIGHT_START_HOUR = 22; // dalle 22:00...
const NIGHT_END_HOUR = 7;    // ...alle 7:00

// Quanta energia "costano" le varie attività.
const DOCCIA_ENERGY_COST = 5;
const GIOCO_ENERGY_COST = 3;
const COCCOLA_ENERGY_COST = 2;
const COCCOLA_COOLDOWN_MIN = 30; // minuti di attesa tra una coccola e l'altra

// Messaggietti d'amore sbloccati ogni 10 punti di "affetto".
// Scrivi qui i vostri messaggi personali, verranno mostrati in ordine.
const LOVE_NOTES = [
  "Ogni volta che ti prendi cura di me mi fai sorridere. Grazie di esistere 💛",
  "Non vedo l'ora di riabbracciarti per davvero.",
  "Sei la persona più dolce che conosca. Buon compleanno, amore mio.",
  "I gatti ti adorano tanto quanto me (quasi).",
  "Con te ogni giorno qualsiasi diventa speciale.",
  "Questo gioco non basterà mai a dirti quanto tieni a te.",
  "Sei il mio posto preferito nel mondo.",
  "Grazie per avermi scelto, ogni singolo giorno.",
];

// Frasi del "diario" in base allo stato di Tommy.
const MESSAGES = {
  hungry:  ["Tommy ha un languorino... 🍕", "Il pancino di Tommy brontola.", "Un pisolino? No, prima ho fame!"],
  dirty:   ["Tommy avrebbe bisogno di una doccia... 🚿", "Un po' impolverato oggi.", "Mmm, profumo di bucato mancante."],
  tired:   ["Tommy sbadiglia... 😴", "Le palpebre sono pesanti.", "Un pisolino ci starebbe benissimo."],
  content: ["Tommy sta benissimo grazie a te 💛", "I gatti fanno le fusa accanto a lui.", "Giornata tranquilla in compagnia dei gatti.", "Tutto sotto controllo, merito tuo!"],
  feed:    ["Buonissima! Grazie 🍕", "Ora sì che si sta bene.", "Fame placata, missione compiuta."],
  wash:    ["Che sollievo, tutto pulito! ✨", "Profuma di bucato fresco.", "Splendente come non mai."],
  wake:    ["Buongiorno! Che bel sonnellino 😊", "Sveglio e pieno di energia!", "Ho sognato te."],
  love:    ["Grazie delle coccole 🤍", "Mi scaldi il cuore.", "Potrei stare così per ore."],
  playWin: ["Ho vinto! Giocare con te è il mio gioco preferito 🎉", "Vittoria! Sei un portafortuna."],
  playLose:["Ho perso ma mi sono divertito lo stesso 😄", "Rivincita al prossimo giro?"],
  playTie: ["Pareggio! Che sfida 😏"],
};

// Oggetti acquistabili al negozio. "fame" = quanta % di fame recupera
// quando viene mangiato dal frigo. isCatSnack = non va nel frigo, dà
// solo affetto extra.
const SHOP_ITEMS = [
  { id: "biscotto",  label: "🍪 Biscotto",     cost: 1, fame: 10, desc: "Uno spuntino veloce" },
  { id: "insalata",  label: "🥗 Insalata",     cost: 2, fame: 15, desc: "Leggera ma nutriente" },
  { id: "panino",    label: "🥪 Panino",       cost: 2, fame: 20, desc: "Il classico che non delude" },
  { id: "pizza",     label: "🍕 Pizza",        cost: 3, fame: 30, desc: "Il preferito di Tommy" },
  { id: "hamburger", label: "🍔 Hamburger",    cost: 4, fame: 40, desc: "Per una fame vera" },
  { id: "pasta",     label: "🍝 Pasta",        cost: 4, fame: 45, desc: "Un piatto che riempie" },
  { id: "torta",     label: "🍰 Torta",        cost: 5, fame: 50, desc: "Un dolce speciale" },
  { id: "snack",     label: "🐟 Snack gatti",  cost: 2, fame: 0,  desc: "Ai gatti piace tantissimo (+affetto)", isCatSnack: true },
];

/* ---------- 2. STATO / SALVATAGGIO ---------- */

const SAVE_KEY = "tommy_save_v2";

function loadState() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { raw = null; }
  if (!raw) {
    raw = {
      fame: 100, igiene: 100, energia: 100,
      coins: 5, fridge: { pizza: 2, biscotto: 1 },
      affetto: 0, milestone: 0,
      lastCoccola: 0,
      lastUpdate: Date.now(),
    };
  }
  // Compatibilità con salvataggi di versioni precedenti del gioco.
  if (!raw.fridge || typeof raw.fridge !== "object") raw.fridge = { pizza: 2, biscotto: 1 };
  if (typeof raw.lastCoccola !== "number") raw.lastCoccola = 0;
  return raw;
}

let state = loadState();
let isBusy = false; // true durante animazioni/sonno, blocca altre azioni
let nightSleepActive = false; // true quando Tommy dorme da solo (22-7)

function save() {
  state.lastUpdate = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

/* ---------- 3. RIFERIMENTI DOM ---------- */

const el = {
  statusImg: document.getElementById("status-img"),
  bgVideo: document.getElementById("bg-video"),
  sleepVeil: document.getElementById("sleep-veil"),
  particles: document.getElementById("particles"),
  diary: document.getElementById("diary"),
  barFame: document.getElementById("bar-fame"),
  barIgiene: document.getElementById("bar-igiene"),
  barEnergia: document.getElementById("bar-energia"),
  barAffetto: document.getElementById("bar-affetto"),
  affettoTxt: document.getElementById("affetto-txt"),
  affettoLevel: document.getElementById("affetto-level"),
  pctFame: document.getElementById("pct-fame"),
  pctIgiene: document.getElementById("pct-igiene"),
  pctEnergia: document.getElementById("pct-energia"),
  clockTxt: document.getElementById("clock-txt"),
  coccolaBtn: document.querySelector('[data-action="coccola"]'),
  coinsTxt: document.getElementById("coins-txt"),
  giorniCount: document.getElementById("giorni-count"),
  shelfBtns: document.querySelectorAll(".action-btn"),
  sheetBackdrop: document.getElementById("sheet-backdrop"),
  sheet: document.getElementById("sheet"),
  sheetContent: document.getElementById("sheet-content"),
  noteBackdrop: document.getElementById("note-backdrop"),
  noteText: document.getElementById("note-text"),
  noteClose: document.getElementById("note-close"),
};

/* ---------- 4. UTILITÀ DI VISUALIZZAZIONE ---------- */

function clamp(v) { return Math.max(0, Math.min(100, v)); }

function setDiary(text) {
  el.diary.classList.add("fade");
  setTimeout(() => {
    el.diary.textContent = text;
    el.diary.classList.remove("fade");
  }, 180);
}

function randomOf(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function spawnParticles(emojis, count = 6) {
  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    span.className = "particle";
    span.textContent = randomOf(emojis);
    span.style.left = 10 + Math.random() * 80 + "%";
    span.style.animationDelay = Math.random() * 0.3 + "s";
    span.style.fontSize = 0.9 + Math.random() * 0.7 + "rem";
    el.particles.appendChild(span);
    setTimeout(() => span.remove(), 2200);
  }
}

// Mostra temporaneamente un'immagine di reazione, poi torna allo stato idle.
function showTransient(name, ms) {
  el.statusImg.src = `assets/${name}.webp`;
  el.statusImg.classList.add("show");
  el.bgVideo.style.opacity = 0;
  clearTimeout(showTransient._t);
  showTransient._t = setTimeout(() => {
    refreshIdleVisual();
  }, ms);
}

// Determina cosa mostrare quando non c'è nessuna azione in corso.
function refreshIdleVisual() {
  if (isBusy) return; // il sonno gestisce da sé la visuale
  const stats = { igiene: state.igiene, fame: state.fame, energia: state.energia };
  const lowestKey = Object.keys(stats).reduce((a, b) => (stats[a] <= stats[b] ? a : b));
  const lowestVal = stats[lowestKey];

  if (lowestVal < LOW_THRESHOLD) {
    const imgFor = { igiene: "sporco", fame: "affamato", energia: "sonno" };
    el.statusImg.src = `assets/${imgFor[lowestKey]}.webp`;
    el.statusImg.classList.add("show");
    el.bgVideo.style.opacity = 0;
  } else {
    el.statusImg.classList.remove("show");
    el.bgVideo.style.opacity = 1;
  }
}

function updateBars() {
  el.barFame.style.width = state.fame + "%";
  el.barIgiene.style.width = state.igiene + "%";
  el.barEnergia.style.width = state.energia + "%";
  el.pctFame.textContent = Math.round(state.fame) + "%";
  el.pctIgiene.textContent = Math.round(state.igiene) + "%";
  el.pctEnergia.textContent = Math.round(state.energia) + "%";
  const affettoPct = (state.affetto % 10) * 10;
  el.barAffetto.style.width = affettoPct + "%";
  el.affettoTxt.textContent = state.affetto;
  el.affettoLevel.textContent = "Livello " + (state.milestone + 1);
  el.coinsTxt.textContent = state.coins;
}

/* ---------- orologio digitale + fascia notturna ---------- */

function isNightTime(date = new Date()) {
  const h = date.getHours();
  if (NIGHT_START_HOUR > NIGHT_END_HOUR) {
    return h >= NIGHT_START_HOUR || h < NIGHT_END_HOUR;
  }
  return h >= NIGHT_START_HOUR && h < NIGHT_END_HOUR;
}

function updateClock() {
  el.clockTxt.textContent = new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

function formatMMSS(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  return mm + ":" + String(ss).padStart(2, "0");
}

// Aggiorna ogni secondo l'orologio e il conto alla rovescia della coccola.
function fastTick() {
  updateClock();
  if (isBusy) return; // durante un'animazione/il sonno non tocchiamo il pulsante
  const remain = COCCOLA_COOLDOWN_MIN * 60000 - (Date.now() - state.lastCoccola);
  const lbl = el.coccolaBtn.querySelector(".lbl");
  if (remain > 0) {
    el.coccolaBtn.disabled = true;
    lbl.textContent = formatMMSS(remain);
  } else {
    el.coccolaBtn.disabled = false;
    lbl.textContent = "Coccola";
  }
}

function updateDaysCounter() {
  const days = Math.max(0, Math.floor((Date.now() - START_DATE.getTime()) / 86400000));
  el.giorniCount.textContent = days;
}

// Aggiorna il diario in base allo stato attuale, senza scriverci sopra
// troppo spesso (solo quando cambia "categoria" o ogni tanto).
let lastDiaryCategory = null;
function refreshIdleDiary(force = false) {
  const stats = { igiene: state.igiene, fame: state.fame, energia: state.energia };
  const lowestKey = Object.keys(stats).reduce((a, b) => (stats[a] <= stats[b] ? a : b));
  let category = "content";
  if (stats[lowestKey] < LOW_THRESHOLD) {
    category = { igiene: "dirty", fame: "hungry", energia: "tired" }[lowestKey];
  }
  if (force || category !== lastDiaryCategory) {
    setDiary(randomOf(MESSAGES[category]));
    lastDiaryCategory = category;
  }
}

/* ---------- 5. AFFETTO / MESSAGGI D'AMORE ---------- */

function addAffetto(n) {
  state.affetto += n;
  const reached = Math.floor(state.affetto / 10);
  if (reached > state.milestone) {
    state.milestone = reached;
    const note = LOVE_NOTES[(reached - 1) % LOVE_NOTES.length];
    setTimeout(() => openNote(note), 500); // dopo l'animazione dell'azione
  }
  updateBars();
  save();
}

function openNote(text) {
  el.noteText.textContent = text;
  el.noteBackdrop.classList.add("show");
}
el.noteClose.addEventListener("click", () => el.noteBackdrop.classList.remove("show"));

/* ---------- 6. CICLO DI DECADIMENTO (basato sul tempo reale) ---------- */

function applyDecay() {
  const now = Date.now();
  const elapsedMin = (now - state.lastUpdate) / 60000;
  if (elapsedMin <= 0) return;
  state.fame    = clamp(state.fame    - DECAY_PER_MIN.fame    * elapsedMin);
  state.igiene  = clamp(state.igiene  - DECAY_PER_MIN.igiene  * elapsedMin);
  state.energia = clamp(state.energia - DECAY_PER_MIN.energia * elapsedMin);
  save();
}

function enterNightSleep() {
  nightSleepActive = true;
  isBusy = true;
  lockButtons(true);
  el.statusImg.src = "assets/sonno.webp";
  el.statusImg.classList.add("show");
  el.bgVideo.style.opacity = 0;
  el.sleepVeil.classList.add("show");
  setDiary("Zzz... Tommy dorme, la notte è per riposare. Torna dopo le 7! 🌙");
}

function exitNightSleep() {
  nightSleepActive = false;
  isBusy = false;
  el.sleepVeil.classList.remove("show");
  state.energia = 100;
  save();
  updateBars();
  lockButtons(false);
  refreshIdleVisual();
  lastDiaryCategory = null;
  setDiary(randomOf(MESSAGES.wake));
}

function tick() {
  const night = isNightTime();
  if (night && !nightSleepActive) enterNightSleep();
  else if (!night && nightSleepActive) exitNightSleep();

  updateDaysCounter();
  if (nightSleepActive) return; // tutto in pausa mentre Tommy dorme da solo

  applyDecay();
  updateBars();
  refreshIdleVisual();
  refreshIdleDiary();
}

/* ---------- 7. AZIONI ---------- */

function lockButtons(lock) {
  el.shelfBtns.forEach(b => (b.disabled = lock));
  if (!lock) fastTick(); // riapplica subito l'eventuale cooldown della coccola
}

function doccia() {
  if (isBusy) return;
  isBusy = true;
  lockButtons(true);
  state.igiene = 100;
  state.energia = clamp(state.energia - DOCCIA_ENERGY_COST);
  addAffetto(2);
  showTransient("pulizia", 1800);
  spawnParticles(["✨", "🫧", "💧"]);
  setDiary(randomOf(MESSAGES.wash));
  setTimeout(() => { isBusy = false; lockButtons(false); refreshIdleVisual(); refreshIdleDiary(true); }, 1800);
  save();
  updateBars();
}

function coccola() {
  if (isBusy) return;
  const remain = COCCOLA_COOLDOWN_MIN * 60000 - (Date.now() - state.lastCoccola);
  if (remain > 0) {
    setDiary(`Che dolcezza, ma aspetta ancora ${formatMMSS(remain)} per la prossima coccola 🤍`);
    return;
  }
  isBusy = true;
  lockButtons(true);
  state.lastCoccola = Date.now();
  state.energia = clamp(state.energia - COCCOLA_ENERGY_COST);
  addAffetto(4);
  showTransient("felice", 1600);
  spawnParticles(["💗", "💛", "🐾"]);
  setDiary(randomOf(MESSAGES.love));
  save();
  updateBars();
  setTimeout(() => { isBusy = false; lockButtons(false); refreshIdleVisual(); refreshIdleDiary(true); }, 1600);
}

function dormi() {
  if (isBusy) return;
  isBusy = true;
  lockButtons(true);
  el.statusImg.src = "assets/sonno.webp";
  el.statusImg.classList.add("show");
  el.bgVideo.style.opacity = 0;
  el.sleepVeil.classList.add("show");
  setDiary("Tommy si addormenta sereno... 🌙");
  const sparkle = setInterval(() => spawnParticles(["⭐", "💤"], 2), 1200);
  setTimeout(() => {
    clearInterval(sparkle);
    state.energia = 100;
    save();
    updateBars();
    el.sleepVeil.classList.remove("show");
    isBusy = false;
    lockButtons(false);
    addAffetto(1);
    showTransient("felice", 1400);
    setDiary(randomOf(MESSAGES.wake));
    setTimeout(() => refreshIdleDiary(true), 1500);
  }, 5000);
}

function mangia(itemId) {
  if (isBusy) return;
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item || (state.fridge[itemId] || 0) <= 0) return;
  state.fridge[itemId] -= 1;
  state.fame = clamp(state.fame + item.fame);
  addAffetto(2);
  showTransient("felice", 1500);
  spawnParticles(["🍕", "😋"]);
  setDiary(randomOf(MESSAGES.feed));
  save();
  updateBars();
  renderFridgeSheet();
  setTimeout(() => refreshIdleDiary(true), 1600);
}

function compra(itemId) {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item || state.coins < item.cost) return;
  state.coins -= item.cost;
  if (item.isCatSnack) {
    addAffetto(1);
  } else {
    state.fridge[itemId] = (state.fridge[itemId] || 0) + 1;
  }
  save();
  updateBars();
  renderNegozioSheet();
}

/* ---------- 8. PANNELLI (bottom sheet) ---------- */

function openSheet() {
  el.sheetBackdrop.classList.add("show");
  el.sheet.classList.add("show");
}
function closeSheet() {
  el.sheetBackdrop.classList.remove("show");
  el.sheet.classList.remove("show");
}
el.sheetBackdrop.addEventListener("click", closeSheet);

function renderFridgeSheet() {
  const foodItems = SHOP_ITEMS.filter(i => !i.isCatSnack);
  const rows = foodItems
    .filter(item => (state.fridge[item.id] || 0) > 0)
    .map(item => `
      <div class="sheet-row">
        <span>${item.label} × ${state.fridge[item.id]}<br><small style="font-weight:500;opacity:.7">+${item.fame}% fame</small></span>
        <button data-eat="${item.id}">Mangia</button>
      </div>
    `).join("");
  el.sheetContent.innerHTML = `
    <h3>🧊 Frigo</h3>
    ${rows || ""}
    <div class="sheet-note">${rows ? "Un morso e la fame passa." : "Il frigo è vuoto — passa dal negozio! 🛒"}</div>
  `;
  el.sheetContent.querySelectorAll("[data-eat]").forEach(btn => {
    btn.addEventListener("click", () => mangia(btn.dataset.eat));
  });
}

function renderNegozioSheet() {
  el.sheetContent.innerHTML = `
    <h3>🛒 Negozio — 💰 ${state.coins} monetine</h3>
    ${SHOP_ITEMS.map(item => `
      <div class="sheet-row">
        <span>${item.label}<br><small style="font-weight:500;opacity:.7">${item.desc}${item.isCatSnack ? "" : ` · +${item.fame}% fame`}</small></span>
        <button data-buy="${item.id}" ${state.coins < item.cost ? "disabled" : ""}>${item.cost} 💰</button>
      </div>
    `).join("")}
    <div class="sheet-note">Guadagna monetine giocando a sasso-carta-forbice! 🎮</div>
  `;
  el.sheetContent.querySelectorAll("[data-buy]").forEach(btn => {
    btn.addEventListener("click", () => compra(btn.dataset.buy));
  });
}

const RPS = ["🪨", "📄", "✂️"];
const RPS_DISPLAY = ['<span class="rock-icon"></span>', "📄", "✂️"];
function renderGiocoSheet() {
  el.sheetContent.innerHTML = `
    <h3>🎮 Sasso, carta, forbice</h3>
    <div class="rps-row">
      <button data-rps="0" aria-label="Sasso">${RPS_DISPLAY[0]}</button>
      <button data-rps="1" aria-label="Carta">${RPS_DISPLAY[1]}</button>
      <button data-rps="2" aria-label="Forbice">${RPS_DISPLAY[2]}</button>
    </div>
    <div class="rps-result" id="rps-result"></div>
  `;
  el.sheetContent.querySelectorAll("[data-rps]").forEach(btn => {
    btn.addEventListener("click", () => giocaRPS(Number(btn.dataset.rps)));
  });
}

function giocaRPS(choice) {
  if (isBusy) return;
  const cpu = Math.floor(Math.random() * 3);
  const resultEl = document.getElementById("rps-result");
  let outcome; // 0 pareggio, 1 vince tu, -1 vince Tommy
  if (choice === cpu) outcome = 0;
  else if ((cpu + 1) % 3 === choice) outcome = 1; // la tua scelta batte quella di Tommy
  else outcome = -1;

  showTransient("gioco", 900);
  spawnParticles(["🎮"], 3);

  const summary = `Tu: ${RPS_DISPLAY[choice]} — Tommy: ${RPS_DISPLAY[cpu]}`;
  if (outcome === 1) {
    state.coins += 2;
    state.energia = clamp(state.energia - GIOCO_ENERGY_COST);
    addAffetto(3);
    resultEl.innerHTML = `${summary} → Hai vinto! +2 💰`;
    setDiary(randomOf(MESSAGES.playWin));
    setTimeout(() => showTransient("felice", 1200), 950);
  } else if (outcome === -1) {
    state.energia = clamp(state.energia - GIOCO_ENERGY_COST);
    resultEl.innerHTML = `${summary} → Ha vinto Tommy!`;
    setDiary(randomOf(MESSAGES.playLose));
  } else {
    resultEl.innerHTML = `${summary} → Pareggio!`;
    setDiary(randomOf(MESSAGES.playTie));
  }
  save();
  updateBars();
  setTimeout(() => refreshIdleDiary(true), 1800);
}

/* ---------- 9. COLLEGAMENTO PULSANTI ---------- */

document.querySelectorAll(".action-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    if (action === "frigo") { renderFridgeSheet(); openSheet(); }
    else if (action === "negozio") { renderNegozioSheet(); openSheet(); }
    else if (action === "gioco") { renderGiocoSheet(); openSheet(); }
    else if (action === "doccia") doccia();
    else if (action === "dormi") dormi();
    else if (action === "coccola") coccola();
  });
});

/* ---------- 10. AVVIO ---------- */

tick();
updateBars();
fastTick();
setInterval(tick, 15000);   // decadimento statistiche + notte, ogni 15s
setInterval(fastTick, 1000); // orologio + countdown coccola, ogni secondo
