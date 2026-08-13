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
const GIOCO_FAME_COST = 2;
const GIOCO_IGIENE_COST = 1;
const COCCOLA_ENERGY_COST = 2;
const COCCOLA_COOLDOWN_MIN = 480; // 8 ore = 2/3 coccole al giorno massimo

// Limite ai minigiochi: max round ogni tot minuti, per non farli diventare
// l'unico modo per salire di livello troppo in fretta.
const RPS_MAX_ROUNDS = 5;
const RPS_WINDOW_MIN = 30;

const MEMORY_MAX_ROUNDS = 2;
const MEMORY_WINDOW_MIN = 30;
const MEMORY_ENERGY_COST = 3;
const MEMORY_FAME_COST = 1;
const MEMORY_IGIENE_COST = 1;

const CATCH_MAX_ROUNDS = 3;
const CATCH_WINDOW_MIN = 30;
const CATCH_ENERGY_COST = 4;
const CATCH_FAME_COST = 3;
const CATCH_IGIENE_COST = 2;
const CATCH_DURATION_SEC = 8;
const CATCH_HEART_POINTS = 1;
const CATCH_GOLD_POINTS = 3;
const CATCH_TRAP_PENALTY = 2;

const GUESS_MAX_ROUNDS = 3;
const GUESS_WINDOW_MIN = 30;
const GUESS_ENERGY_COST = 1;
const GUESS_FAME_COST = 1;
const GUESS_IGIENE_COST = 1;
const GUESS_MAX_NUMBER = 20;
const GUESS_MAX_ATTEMPTS = 5;

// Monetine bonus regalate ogni volta che si sale di livello d'affetto.
const LEVEL_UP_COIN_BONUS = 5;

// Sorpresa nascosta: una volta al giorno, con una probabilità, appare
// un piccolo bonus da toccare da qualche parte sullo schermo.
const DAILY_SURPRISE_CHANCE = 0.35;
const DAILY_SURPRISE_COINS = 8;
const DAILY_SURPRISE_AFFETTO = 3;

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

// Date speciali: quando il telefono segna uno di questi giorni, compare
// una dedica speciale (una volta al giorno). month è 1=gennaio...12=dicembre.
// "big" = oltre al messaggio, arrivano coriandoli e la cornice si illumina.
// MODIFICA QUI per cambiare date o testi.
const SPECIAL_DATES = [
  { month: 6,  day: 22, title: "💛 Buon Anniversario",
    message: "Un altro giro intorno al sole, insieme. Da quel giorno la mia vita è più bella con te dentro. Ti amo.",
    big: true },
  { month: 7,  day: 28, title: "🎂 Buon compleanno, Tommy!",
    message: "Oggi compie gli anni anche il Tommy digitale... proprio come il vero, cresce un po' ogni giorno grazie a te. Buon compleanno a noi due 🎈",
    big: true },
  { month: 8,  day: 24, title: "🎉 Buon Compleanno Amore Mio",
    message: "Oggi il mondo festeggia la persona più speciale che conosco. Grazie per ogni sorriso, ogni abbraccio, ogni piccolo momento che rendi indimenticabile. Buon compleanno, ti amo più di quanto queste parole possano dire 💛",
    big: true },
  { month: 8,  day: 8,  title: "", message: "Buon compleanno Anna 🎉", big: false },
  { month: 8,  day: 10, title: "", message: "Buon compleanno Chiara 🎉", big: false },
  { month: 12, day: 25, title: "🎄 Buon Natale",
    message: "Un altro Natale, ancora più bello perché lo passiamo insieme, anche attraverso questo piccolo gioco. Ti voglio bene.",
    big: true },
  { month: 1,  day: 1,  title: "🎆 Buon Anno Nuovo",
    message: "Un altro anno insieme. Non vedo l'ora di scoprire cosa ci riserva, un giorno alla volta, con te.",
    big: true },
];
const SPECIAL_SHOWN_KEY = "tommy_special_shown_v1";

// Calcola la data di Pasqua per un dato anno (algoritmo di Gauss).
function getEasterDate(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

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
  { id: "sushi",     label: "🍣 Sushi",        cost: 4, fame: 35, desc: "Fresco e delicato" },
  { id: "poke",      label: "🥙 Poke Bowl",    cost: 3, fame: 25, desc: "Colorato e leggero" },
  { id: "tacos",     label: "🌮 Tacos",        cost: 3, fame: 30, desc: "Un tocco messicano" },
  { id: "snack",     label: "🐟 Snack gatti",  cost: 2, fame: 0,  desc: "Ai gatti piace tantissimo (+affetto)", isCatSnack: true },
];

// Buoni regalo: costano molte monetine (obiettivo a lungo termine) e,
// quando vengono riscattati, mostrano un messaggio che ricorda di
// organizzare davvero la sorpresa nella vita reale.
// MODIFICA QUI per cambiare buoni, prezzi o testi.
const VOUCHER_ITEMS = [
  { id: "colazione", label: "🛌 Buono Colazione a Letto", cost: 20, desc: "Una colazione servita a letto",
    redeemMsg: "Hai riscattato il Buono Colazione a Letto! Domattina resta pure sotto le coperte 🛌💛" },
  { id: "fiori",     label: "💐 Buono Fiori a Sorpresa",  cost: 25, desc: "Un mazzo di fiori quando meno te lo aspetti",
    redeemMsg: "Hai riscattato il Buono Fiori a Sorpresa! Tienimi d'occhio la porta nei prossimi giorni 💐✨" },
  { id: "film",      label: "🎬 Buono Serata Film a Casa", cost: 35, desc: "Serata sul divano, film e coccole",
    redeemMsg: "Hai riscattato il Buono Serata Film! Scegli tu il film, ci penso io a popcorn e coperte 🎬🍿" },
  { id: "massaggio", label: "💆 Buono Massaggio",   cost: 45, desc: "Un massaggio rilassante, tutto per te",
    redeemMsg: "Hai riscattato il Buono Massaggio! Ricordamelo e organizzo tutto io 💆💛" },
  { id: "shopping",  label: "🛍️ Buono Shopping",    cost: 50, desc: "Un giro di shopping, senza sensi di colpa",
    redeemMsg: "Hai riscattato il Buono Shopping! Preparati, si va a fare shopping insieme 🛍️✨" },
  { id: "cena",      label: "🍽️ Buono Cena Fuori",  cost: 60, desc: "Una cena romantica fuori, dove vuoi tu",
    redeemMsg: "Hai riscattato il Buono Cena Fuori! Scegli il ristorante, al resto penso io 🍽️❤️" },
  { id: "gita",      label: "🌅 Buono Gita di un Giorno", cost: 75, desc: "Una gita fuori porta, tutta la giornata insieme",
    redeemMsg: "Hai riscattato il Buono Gita di un Giorno! Scegli la meta, pensiamo a tutto insieme 🌅🚗" },
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
      vouchers: { massaggio: 0, shopping: 0, cena: 0, colazione: 0, fiori: 0, film: 0, gita: 0 },
      affetto: 0, milestone: 0,
      lastCoccola: 0,
      rpsRoundsUsed: 0, rpsWindowStart: 0,
      memoryRoundsUsed: 0, memoryWindowStart: 0,
      catchRoundsUsed: 0, catchWindowStart: 0,
      guessRoundsUsed: 0, guessWindowStart: 0,
      streak: 0, lastStreakTs: 0,
      lastSurpriseDate: "",
      totalMealsEaten: 0, totalCoccole: 0, totalGamesPlayed: 0,
      totalVouchersRedeemed: 0, dailySurprisesFound: 0, longestStreak: 0,
      unlockedAchievements: [],
      lastUpdate: Date.now(),
    };
  }
  // Compatibilità con salvataggi di versioni precedenti del gioco.
  if (!raw.fridge || typeof raw.fridge !== "object") raw.fridge = { pizza: 2, biscotto: 1 };
  if (!raw.vouchers || typeof raw.vouchers !== "object") raw.vouchers = { massaggio: 0, shopping: 0, cena: 0, colazione: 0, fiori: 0, film: 0, gita: 0 };
  if (typeof raw.lastCoccola !== "number") raw.lastCoccola = 0;
  if (typeof raw.streak !== "number") raw.streak = 0;
  if (typeof raw.lastStreakTs !== "number") raw.lastStreakTs = 0;
  if (typeof raw.lastSurpriseDate !== "string") raw.lastSurpriseDate = "";
  if (typeof raw.totalMealsEaten !== "number") raw.totalMealsEaten = 0;
  if (typeof raw.totalCoccole !== "number") raw.totalCoccole = 0;
  if (typeof raw.totalGamesPlayed !== "number") raw.totalGamesPlayed = 0;
  if (typeof raw.totalVouchersRedeemed !== "number") raw.totalVouchersRedeemed = 0;
  if (typeof raw.dailySurprisesFound !== "number") raw.dailySurprisesFound = 0;
  if (typeof raw.longestStreak !== "number") raw.longestStreak = raw.streak || 0;
  if (!Array.isArray(raw.unlockedAchievements)) raw.unlockedAchievements = [];
  ["rps", "memory", "catch", "guess"].forEach(g => {
    if (typeof raw[g + "RoundsUsed"] !== "number") raw[g + "RoundsUsed"] = 0;
    if (typeof raw[g + "WindowStart"] !== "number") raw[g + "WindowStart"] = 0;
  });
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
  streakTxt: document.getElementById("streak-txt"),
  coccolaBtn: document.querySelector('[data-action="coccola"]'),
  coinsTxt: document.getElementById("coins-txt"),
  giorniCount: document.getElementById("giorni-count"),
  shelfBtns: document.querySelectorAll(".action-btn"),
  sheetBackdrop: document.getElementById("sheet-backdrop"),
  sheet: document.getElementById("sheet"),
  sheetContent: document.getElementById("sheet-content"),
  sheetClose: document.getElementById("sheet-close"),
  sheetHandle: document.getElementById("sheet-handle"),
  noteBackdrop: document.getElementById("note-backdrop"),
  noteTitle: document.getElementById("note-title"),
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

// Come formatMMSS ma per attese lunghe (es. la coccola): mostra "2h 14m"
// invece di un minutaggio scomodo da leggere tipo "134:07".
function formatDuration(ms) {
  const totalMin = Math.max(0, Math.ceil(ms / 60000));
  if (totalMin >= 60) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h}h ${m}m`;
  }
  return formatMMSS(ms);
}

// Ogni gioco ha il proprio "limitatore": ogni tot minuti si ricaricano
// un tot di round. Un solo pezzo di codice riusato per tutti i minigiochi.
function makeLimiter(gameKey, maxRounds, windowMin) {
  const usedKey = gameKey + "RoundsUsed";
  const startKey = gameKey + "WindowStart";
  return {
    refresh() {
      if (!state[startKey] || Date.now() - state[startKey] >= windowMin * 60000) {
        state[startKey] = Date.now();
        state[usedKey] = 0;
        save();
      }
    },
    remainingMs() { return windowMin * 60000 - (Date.now() - state[startKey]); },
    roundsLeft() { return maxRounds - state[usedKey]; },
    use() { state[usedKey] += 1; save(); },
    max: maxRounds,
  };
}

const rpsLimiter = makeLimiter("rps", RPS_MAX_ROUNDS, RPS_WINDOW_MIN);
const memoryLimiter = makeLimiter("memory", MEMORY_MAX_ROUNDS, MEMORY_WINDOW_MIN);
const catchLimiter = makeLimiter("catch", CATCH_MAX_ROUNDS, CATCH_WINDOW_MIN);
const guessLimiter = makeLimiter("guess", GUESS_MAX_ROUNDS, GUESS_WINDOW_MIN);

// Aggiorna ogni secondo l'orologio e il conto alla rovescia della coccola.
function fastTick() {
  updateClock();
  if (isBusy) return; // durante un'animazione/il sonno non tocchiamo il pulsante
  const remain = COCCOLA_COOLDOWN_MIN * 60000 - (Date.now() - state.lastCoccola);
  const lbl = el.coccolaBtn.querySelector(".lbl");
  if (remain > 0) {
    el.coccolaBtn.disabled = true;
    lbl.textContent = formatDuration(remain);
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
    const levelsGained = reached - state.milestone;
    const bonus = LEVEL_UP_COIN_BONUS * levelsGained;
    state.milestone = reached;
    state.coins += bonus;
    const note = LOVE_NOTES[(reached - 1) % LOVE_NOTES.length];
    setTimeout(() => openNote(`${note}\n\n+${bonus} 💰 monetine bonus!`, `🎉 Livello ${reached + 1}!`), 500);
  }
  updateBars();
  save();
}

function openNote(text, title = "") {
  el.noteTitle.textContent = title;
  el.noteTitle.style.display = title ? "block" : "none";
  el.noteText.textContent = text;
  el.noteBackdrop.classList.add("show");
}
el.noteClose.addEventListener("click", () => el.noteBackdrop.classList.remove("show"));

// Cornice che si illumina di dorato per le occasioni speciali.
function celebrateFrame(ms = 7000) {
  const frame = document.querySelector(".frame");
  frame.classList.add("celebrate");
  setTimeout(() => frame.classList.remove("celebrate"), ms);
}

// Controlla se oggi è una data speciale e mostra la dedica (una volta al giorno).
function checkSpecialDay() {
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  if (localStorage.getItem(SPECIAL_SHOWN_KEY) === todayKey) return;

  const month = now.getMonth() + 1, day = now.getDate();
  let special = SPECIAL_DATES.find(s => s.month === month && s.day === day);
  if (!special) {
    const easter = getEasterDate(now.getFullYear());
    if (easter.month === month && easter.day === day) {
      special = {
        title: "🐣 Buona Pasqua",
        message: "Anche i gatti di Tommy oggi indossano le orecchie da coniglietto. Buona Pasqua, amore mio!",
        big: true,
      };
    }
  }
  if (!special) return;

  localStorage.setItem(SPECIAL_SHOWN_KEY, todayKey);
  if (special.big) {
    celebrateFrame(7000);
    spawnParticles(["🎉", "🎈", "✨", "💛"], 10);
    setTimeout(() => spawnParticles(["🎉", "🎈", "✨", "💛"], 10), 900);
  }
  setTimeout(() => openNote(special.message, special.title), special.big ? 500 : 0);
}

// Un giorno di fila in più ogni volta che si apre il gioco in un giorno
// nuovo rispetto all'ultima visita; si azzera se salta un giorno intero.
function updateStreak() {
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (state.lastStreakTs !== todayMidnight) {
    const diffDays = state.lastStreakTs ? Math.round((todayMidnight - state.lastStreakTs) / 86400000) : null;
    state.streak = diffDays === 1 ? state.streak + 1 : 1;
    state.lastStreakTs = todayMidnight;
    if (state.streak > state.longestStreak) state.longestStreak = state.streak;
    save();
  }
  el.streakTxt.textContent = state.streak;
}

// Una volta al giorno, con una probabilità, appare una piccola sorpresa
// toccabile da qualche parte sulla scena.
function checkDailySurprise() {
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  if (state.lastSurpriseDate === todayKey) return; // già deciso per oggi
  state.lastSurpriseDate = todayKey;
  save();
  if (Math.random() < DAILY_SURPRISE_CHANCE) spawnDailySurprise();
}

function spawnDailySurprise() {
  const screen = document.getElementById("screen");
  if (!screen || screen.querySelector(".daily-surprise")) return;
  const btn = document.createElement("button");
  btn.className = "daily-surprise";
  btn.textContent = "✨";
  btn.style.left = 20 + Math.random() * 60 + "%";
  btn.style.top = 18 + Math.random() * 55 + "%";
  btn.addEventListener("click", () => {
    state.coins += DAILY_SURPRISE_COINS;
    state.dailySurprisesFound += 1;
    addAffetto(DAILY_SURPRISE_AFFETTO);
    save();
    updateBars();
    spawnParticles(["✨", "💰", "💗"], 8);
    setDiary(`Hai trovato una sorpresa nascosta! +${DAILY_SURPRISE_COINS} 💰`);
    btn.remove();
    checkAchievements();
  });
  screen.appendChild(btn);
  setTimeout(() => btn.remove(), 60000); // scompare da sola se non viene notata
}

/* ---------- TRAGUARDI / TROFEI ---------- */

// MODIFICA QUI per aggiungere o cambiare i traguardi. "check" riceve lo
// stato del gioco e restituisce true quando il traguardo è raggiunto.
const ACHIEVEMENTS = [
  { id: "primo-pasto", icon: "🌱", title: "Primi Passi", desc: "Hai dato da mangiare a Tommy per la prima volta",
    check: s => s.totalMealsEaten >= 1 },
  { id: "settimana-fuoco", icon: "🔥", title: "Settimana di Fuoco", desc: "7 giorni di fila prendendoti cura di Tommy",
    check: s => s.longestStreak >= 7 },
  { id: "livello-10", icon: "💗", title: "Cuore d'Oro", desc: "Hai raggiunto il livello 10 d'affetto",
    check: s => s.milestone >= 10 },
  { id: "livello-25", icon: "👑", title: "Amore Vero", desc: "Hai raggiunto il livello 25 d'affetto",
    check: s => s.milestone >= 25 },
  { id: "game-master", icon: "🎮", title: "Game Master", desc: "Hai giocato 20 partite ai minigiochi",
    check: s => s.totalGamesPlayed >= 20 },
  { id: "coccole-infinite", icon: "🤗", title: "Coccole Infinite", desc: "10 coccole regalate a Tommy",
    check: s => s.totalCoccole >= 10 },
  { id: "primo-buono", icon: "🎁", title: "Prima Sorpresa", desc: "Hai riscattato il tuo primo buono regalo",
    check: s => s.totalVouchersRedeemed >= 1 },
  { id: "regina-regali", icon: "🎊", title: "Regina dei Regali", desc: "Hai riscattato 5 buoni regalo",
    check: s => s.totalVouchersRedeemed >= 5 },
  { id: "occhio-falco", icon: "✨", title: "Occhio di Falco", desc: "Hai trovato 5 sorprese nascoste",
    check: s => s.dailySurprisesFound >= 5 },
  { id: "giorni-500", icon: "📅", title: "500 Giorni Insieme", desc: "500 giorni passati insieme a Tommy",
    check: s => Math.floor((Date.now() - START_DATE.getTime()) / 86400000) >= 500 },
  { id: "giorni-600", icon: "📅", title: "600 Giorni Insieme", desc: "600 giorni passati insieme a Tommy",
    check: s => Math.floor((Date.now() - START_DATE.getTime()) / 86400000) >= 600 },
  { id: "giorni-700", icon: "📅", title: "700 Giorni Insieme", desc: "700 giorni passati insieme a Tommy",
    check: s => Math.floor((Date.now() - START_DATE.getTime()) / 86400000) >= 700 },
  { id: "giorni-800", icon: "📅", title: "800 Giorni Insieme", desc: "800 giorni passati insieme a Tommy",
    check: s => Math.floor((Date.now() - START_DATE.getTime()) / 86400000) >= 800 },
  { id: "giorni-900", icon: "📅", title: "900 Giorni Insieme", desc: "900 giorni passati insieme a Tommy",
    check: s => Math.floor((Date.now() - START_DATE.getTime()) / 86400000) >= 900 },
  { id: "giorni-1000", icon: "🎂", title: "1000 Giorni Insieme", desc: "1000 giorni passati insieme a Tommy: un traguardo pazzesco",
    check: s => Math.floor((Date.now() - START_DATE.getTime()) / 86400000) >= 1000 },
];

// Controlla se qualche nuovo traguardo è stato appena raggiunto e, se sì,
// lo sblocca mostrando un piccolo popup di festeggiamento.
function checkAchievements() {
  const justUnlocked = ACHIEVEMENTS.filter(a => !state.unlockedAchievements.includes(a.id) && a.check(state));
  if (justUnlocked.length === 0) return;
  justUnlocked.forEach(a => state.unlockedAchievements.push(a.id));
  save();
  const first = justUnlocked[0];
  spawnParticles(["🏆", "✨"], 8);
  setTimeout(() => openNote(`${first.desc}`, `${first.icon} Traguardo sbloccato: ${first.title}!`), 1300);
}

function renderTrofeiSheet() {
  el.sheetContent.innerHTML = `
    <h3>🏆 Traguardi</h3>
    <div class="sheet-note">${state.unlockedAchievements.length}/${ACHIEVEMENTS.length} sbloccati</div>
    <div class="trophy-list">
      ${ACHIEVEMENTS.map(a => {
        const unlocked = state.unlockedAchievements.includes(a.id);
        return `
          <div class="trophy-row ${unlocked ? "unlocked" : "locked"}">
            <span class="trophy-icon">${unlocked ? a.icon : "🔒"}</span>
            <span class="trophy-text">
              <strong>${a.title}</strong>
              <small>${a.desc}</small>
            </span>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

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
  checkSpecialDay();
  updateStreak();
  if (nightSleepActive) return; // tutto in pausa mentre Tommy dorme da solo

  applyDecay();
  updateBars();
  refreshIdleVisual();
  refreshIdleDiary();
  checkDailySurprise();
  checkAchievements();
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
    setDiary(`Che dolcezza, ma aspetta ancora ${formatDuration(remain)} per la prossima coccola 🤍`);
    return;
  }
  isBusy = true;
  lockButtons(true);
  state.lastCoccola = Date.now();
  state.energia = clamp(state.energia - COCCOLA_ENERGY_COST);
  state.totalCoccole += 1;
  addAffetto(4);
  showTransient("felice", 1600);
  spawnParticles(["💗", "💛", "🐾"]);
  setDiary(randomOf(MESSAGES.love));
  save();
  updateBars();
  setTimeout(() => { isBusy = false; lockButtons(false); refreshIdleVisual(); refreshIdleDiary(true); }, 1600);
  checkAchievements();
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
  state.totalMealsEaten += 1;
  addAffetto(2);
  showTransient("felice", 1500);
  spawnParticles(["🍕", "😋"]);
  setDiary(randomOf(MESSAGES.feed));
  save();
  updateBars();
  renderFridgeSheet();
  checkAchievements();
  setTimeout(() => refreshIdleDiary(true), 1600);
}

function compra(itemId) {
  const item = SHOP_ITEMS.find(i => i.id === itemId) || VOUCHER_ITEMS.find(i => i.id === itemId);
  if (!item || state.coins < item.cost) return;
  state.coins -= item.cost;
  if (item.isCatSnack) {
    addAffetto(1);
  } else if (VOUCHER_ITEMS.includes(item)) {
    state.vouchers[itemId] = (state.vouchers[itemId] || 0) + 1;
  } else {
    state.fridge[itemId] = (state.fridge[itemId] || 0) + 1;
  }
  save();
  updateBars();
  renderNegozioSheet();
}

function redeemVoucher(itemId) {
  const item = VOUCHER_ITEMS.find(v => v.id === itemId);
  if (!item || (state.vouchers[itemId] || 0) <= 0) return;
  state.vouchers[itemId] -= 1;
  state.totalVouchersRedeemed += 1;
  save();
  celebrateFrame(5000);
  spawnParticles(["🎁", "✨", "💛"], 8);
  openNote(item.redeemMsg, "🎁 Buono riscattato!");
  renderNegozioSheet();
  checkAchievements();
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
el.sheetClose.addEventListener("click", closeSheet);
el.sheetHandle.addEventListener("click", closeSheet);

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
  const ownedVouchers = VOUCHER_ITEMS.filter(v => (state.vouchers[v.id] || 0) > 0);
  el.sheetContent.innerHTML = `
    <h3>🛒 Negozio — 💰 ${state.coins} monetine</h3>
    <div class="shop-section-title">🍽️ Cibo</div>
    ${SHOP_ITEMS.map(item => `
      <div class="sheet-row">
        <span>${item.label}<br><small style="font-weight:500;opacity:.7">${item.desc}${item.isCatSnack ? "" : ` · +${item.fame}% fame`}</small></span>
        <button data-buy="${item.id}" ${state.coins < item.cost ? "disabled" : ""}>${item.cost} 💰</button>
      </div>
    `).join("")}
    <div class="shop-section-title">🎁 Buoni Regalo</div>
    ${VOUCHER_ITEMS.map(item => `
      <div class="sheet-row">
        <span>${item.label}<br><small style="font-weight:500;opacity:.7">${item.desc}</small></span>
        <button data-buy="${item.id}" ${state.coins < item.cost ? "disabled" : ""}>${item.cost} 💰</button>
      </div>
    `).join("")}
    ${ownedVouchers.length ? `
      <div class="shop-section-title">🎫 I tuoi buoni</div>
      ${ownedVouchers.map(v => `
        <div class="sheet-row">
          <span>${v.label} × ${state.vouchers[v.id]}</span>
          <button data-redeem="${v.id}">Riscuoti</button>
        </div>
      `).join("")}
    ` : ""}
    <div class="sheet-note">Guadagna monetine giocando ai minigiochi! 🎮</div>
  `;
  el.sheetContent.querySelectorAll("[data-buy]").forEach(btn => {
    btn.addEventListener("click", () => compra(btn.dataset.buy));
  });
  el.sheetContent.querySelectorAll("[data-redeem]").forEach(btn => {
    btn.addEventListener("click", () => redeemVoucher(btn.dataset.redeem));
  });
}

/* ---------- HUB DEI MINIGIOCHI ---------- */

function renderGiocoHub() {
  [rpsLimiter, memoryLimiter, catchLimiter, guessLimiter].forEach(l => l.refresh());
  el.sheetContent.innerHTML = `
    <h3>🎮 Giochiamo insieme</h3>
    <div class="game-grid">
      <button class="game-card" data-game="rps">
        🪨<span>Sasso Carta Forbice</span><small>${rpsLimiter.roundsLeft()}/${rpsLimiter.max}</small>
      </button>
      <button class="game-card" data-game="memory">
        🃏<span>Memory dei Gatti</span><small>${memoryLimiter.roundsLeft()}/${memoryLimiter.max}</small>
      </button>
      <button class="game-card" data-game="catch">
        💗<span>Acchiappa il Cuore</span><small>${catchLimiter.roundsLeft()}/${catchLimiter.max}</small>
      </button>
      <button class="game-card" data-game="guess">
        🔢<span>Indovina il Numero</span><small>${guessLimiter.roundsLeft()}/${guessLimiter.max}</small>
      </button>
    </div>
  `;
  el.sheetContent.querySelectorAll("[data-game]").forEach(btn => {
    btn.addEventListener("click", () => {
      const g = btn.dataset.game;
      if (g === "rps") renderRpsView();
      else if (g === "memory") renderMemoryView();
      else if (g === "catch") renderCatchView();
      else if (g === "guess") renderGuessView();
    });
  });
}

function backButton(onBack) {
  return `<button class="back-btn" id="game-back">← Indietro</button>`;
}
function bindBack(handler) {
  document.getElementById("game-back")?.addEventListener("click", handler);
}

/* ---------- 1) SASSO, CARTA, FORBICE ---------- */

const RPS = ["🪨", "📄", "✂️"];

function renderRpsView() {
  rpsLimiter.refresh();
  const roundsLeft = rpsLimiter.roundsLeft();
  const metaText = roundsLeft > 0
    ? `Round rimasti: ${roundsLeft}/${rpsLimiter.max}`
    : `Round esauriti — riprova tra ${formatMMSS(rpsLimiter.remainingMs())} ⏳`;
  el.sheetContent.innerHTML = `
    ${backButton()}
    <h3>🪨 Sasso, carta, forbice</h3>
    <div class="rps-meta" id="rps-meta">${metaText}</div>
    <div class="rps-row">
      <button data-rps="0" ${roundsLeft <= 0 ? "disabled" : ""}>🪨</button>
      <button data-rps="1" ${roundsLeft <= 0 ? "disabled" : ""}>📄</button>
      <button data-rps="2" ${roundsLeft <= 0 ? "disabled" : ""}>✂️</button>
    </div>
    <div class="rps-result" id="rps-result"></div>
  `;
  bindBack(renderGiocoHub);
  el.sheetContent.querySelectorAll("[data-rps]").forEach(btn => {
    btn.addEventListener("click", () => giocaRPS(Number(btn.dataset.rps)));
  });
}

function giocaRPS(choice) {
  if (isBusy) return;
  rpsLimiter.refresh();
  if (rpsLimiter.roundsLeft() <= 0) {
    setDiary(`Basta gare per ora! Si ricomincia tra ${formatMMSS(rpsLimiter.remainingMs())} ⏳`);
    return;
  }
  rpsLimiter.use();
  state.totalGamesPlayed += 1;
  state.energia = clamp(state.energia - GIOCO_ENERGY_COST);
  state.fame = clamp(state.fame - GIOCO_FAME_COST);
  state.igiene = clamp(state.igiene - GIOCO_IGIENE_COST);

  const cpu = Math.floor(Math.random() * 3);
  const resultEl = document.getElementById("rps-result");
  let outcome; // 0 pareggio, 1 vince tu, -1 vince Tommy
  if (choice === cpu) outcome = 0;
  else if ((cpu + 1) % 3 === choice) outcome = 1;
  else outcome = -1;

  showTransient("gioco", 900);
  spawnParticles(["🎮"], 3);

  const summary = `Tu: ${RPS[choice]} — Tommy: ${RPS[cpu]}`;
  if (outcome === 1) {
    state.coins += 2;
    addAffetto(3);
    resultEl.textContent = `${summary} → Hai vinto! +2 💰`;
    setDiary(randomOf(MESSAGES.playWin));
    setTimeout(() => showTransient("felice", 1200), 950);
  } else if (outcome === -1) {
    resultEl.textContent = `${summary} → Ha vinto Tommy!`;
    setDiary(randomOf(MESSAGES.playLose));
  } else {
    resultEl.textContent = `${summary} → Pareggio!`;
    setDiary(randomOf(MESSAGES.playTie));
  }
  save();
  updateBars();

  const meta = document.getElementById("rps-meta");
  const roundsLeft = rpsLimiter.roundsLeft();
  if (meta) {
    meta.textContent = roundsLeft > 0
      ? `Round rimasti: ${roundsLeft}/${rpsLimiter.max}`
      : `Round esauriti — riprova tra ${formatMMSS(rpsLimiter.remainingMs())} ⏳`;
  }
  if (roundsLeft <= 0) el.sheetContent.querySelectorAll("[data-rps]").forEach(b => (b.disabled = true));

  checkAchievements();
  setTimeout(() => refreshIdleDiary(true), 1800);
}

/* ---------- 2) MEMORY DEI GATTI ---------- */

const MEMORY_SYMBOLS = [
  "assets/cats/cat1.webp",
  "assets/cats/cat2.webp",
  "assets/cats/cat3.webp",
  "assets/cats/cat4.webp",
  "assets/cats/cat5.webp",
  "assets/cats/cat6.webp",
];
let memoryState = null;

function renderMemoryView() {
  memoryLimiter.refresh();
  const roundsLeft = memoryLimiter.roundsLeft();
  let inner;
  if (!memoryState) {
    inner = `
      <div class="sheet-note">Trova tutte le coppie! Partite rimaste: ${roundsLeft}/${memoryLimiter.max}</div>
      <button id="memory-start-btn" class="primary-btn" ${roundsLeft <= 0 ? "disabled" : ""}>
        ${roundsLeft <= 0 ? `Riprova tra ${formatMMSS(memoryLimiter.remainingMs())}` : `Inizia partita (-${MEMORY_ENERGY_COST}⚡)`}
      </button>
    `;
  } else {
    inner = `
      <div class="sheet-note">Errori: ${memoryState.mistakes}</div>
      <div class="memory-grid">
        ${memoryState.cards.map((c, i) => `
          <button class="memory-card ${c.matched ? "matched" : ""}" data-idx="${i}" ${c.matched || memoryState.busy ? "disabled" : ""}>
            ${c.matched || memoryState.flipped.includes(i)
              ? `<img src="${c.symbol}" alt="" class="memory-card-img">`
              : `<span class="memory-card-back">🐾</span>`}
          </button>
        `).join("")}
      </div>
    `;
  }
  el.sheetContent.innerHTML = `${backButton()}<h3>🃏 Memory dei Gatti</h3>${inner}`;
  bindBack(() => { memoryState = null; renderGiocoHub(); });
  document.getElementById("memory-start-btn")?.addEventListener("click", startMemoryGame);
  el.sheetContent.querySelectorAll(".memory-card[data-idx]").forEach(btn => {
    btn.addEventListener("click", () => flipMemoryCard(Number(btn.dataset.idx)));
  });
}

function startMemoryGame() {
  memoryLimiter.refresh();
  if (memoryLimiter.roundsLeft() <= 0) { renderMemoryView(); return; }
  memoryLimiter.use();
  state.totalGamesPlayed += 1;
  state.energia = clamp(state.energia - MEMORY_ENERGY_COST);
  state.fame = clamp(state.fame - MEMORY_FAME_COST);
  state.igiene = clamp(state.igiene - MEMORY_IGIENE_COST);
  save();
  updateBars();
  const deck = [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS]
    .map(symbol => ({ symbol, matched: false }))
    .sort(() => Math.random() - 0.5);
  memoryState = { cards: deck, flipped: [], busy: false, mistakes: 0 };
  renderMemoryView();
}

function flipMemoryCard(idx) {
  if (!memoryState || memoryState.busy) return;
  const card = memoryState.cards[idx];
  if (card.matched || memoryState.flipped.includes(idx)) return;
  memoryState.flipped.push(idx);
  renderMemoryView();
  if (memoryState.flipped.length === 2) {
    memoryState.busy = true;
    const [i1, i2] = memoryState.flipped;
    const match = memoryState.cards[i1].symbol === memoryState.cards[i2].symbol;
    setTimeout(() => {
      if (match) { memoryState.cards[i1].matched = true; memoryState.cards[i2].matched = true; }
      else memoryState.mistakes++;
      memoryState.flipped = [];
      memoryState.busy = false;
      if (memoryState.cards.every(c => c.matched)) finishMemoryGame();
      else renderMemoryView();
    }, 700);
  }
}

function finishMemoryGame() {
  const mistakes = memoryState.mistakes;
  let affettoGain, coinGain, msg;
  if (mistakes <= 2) { affettoGain = 4; coinGain = 2; msg = "Perfetto! Che memoria di ferro 🧠✨"; }
  else if (mistakes <= 5) { affettoGain = 2; coinGain = 1; msg = "Ben fatto, tutte le coppie trovate!"; }
  else { affettoGain = 1; coinGain = 0; msg = "Fatto! Un po' di allenamento e sarai perfetta 😄"; }
  state.coins += coinGain;
  addAffetto(affettoGain);
  save();
  updateBars();
  setDiary(msg);
  spawnParticles(["🐱", "💗", "✨"], 6);
  memoryState = null;
  checkAchievements();
  setTimeout(() => refreshIdleDiary(true), 1800);
  renderMemoryView();
}

/* ---------- 3) ACCHIAPPA IL CUORE ---------- */

let catchState = null;

function renderCatchView() {
  catchLimiter.refresh();
  const roundsLeft = catchLimiter.roundsLeft();
  let inner;
  if (!catchState) {
    inner = `
      <div class="sheet-note">Tocca i cuori 💗 e quelli dorati 💛, evita quelli spezzati 💔! ${CATCH_DURATION_SEC} secondi, si fa più veloce col tempo. Partite rimaste: ${roundsLeft}/${catchLimiter.max}</div>
      <button id="catch-start-btn" class="primary-btn" ${roundsLeft <= 0 ? "disabled" : ""}>
        ${roundsLeft <= 0 ? `Riprova tra ${formatMMSS(catchLimiter.remainingMs())}` : `Inizia (-${CATCH_ENERGY_COST}⚡)`}
      </button>
    `;
  } else {
    inner = `
      <div class="sheet-note" id="catch-note">Punteggio: ${catchState.score} · Tempo: ${catchState.timeLeft}s</div>
      <div class="catch-area" id="catch-area"></div>
    `;
  }
  el.sheetContent.innerHTML = `${backButton()}<h3>💗 Acchiappa il Cuore</h3>${inner}`;
  bindBack(() => { stopCatchGame(true); renderGiocoHub(); });
  document.getElementById("catch-start-btn")?.addEventListener("click", startCatchGame);
}

function startCatchGame() {
  catchLimiter.refresh();
  if (catchLimiter.roundsLeft() <= 0) { renderCatchView(); return; }
  catchLimiter.use();
  state.totalGamesPlayed += 1;
  state.energia = clamp(state.energia - CATCH_ENERGY_COST);
  state.fame = clamp(state.fame - CATCH_FAME_COST);
  state.igiene = clamp(state.igiene - CATCH_IGIENE_COST);
  save();
  updateBars();
  catchState = { score: 0, timeLeft: CATCH_DURATION_SEC, spawnTimer: null, countdownTimer: null, startedAt: Date.now() };
  renderCatchView();
  const area = document.getElementById("catch-area");
  scheduleNextHeart(area, catchState.startedAt);
  catchState.countdownTimer = setInterval(() => {
    if (!catchState) return;
    catchState.timeLeft -= 1;
    const note = document.getElementById("catch-note");
    if (note) note.textContent = `Punteggio: ${catchState.score} · Tempo: ${catchState.timeLeft}s`;
    if (catchState.timeLeft <= 0) finishCatchGame();
  }, 1000);
}

// Il ritmo di comparsa accelera piano piano: si parte più comodi e si
// finisce dovendo reagire più in fretta, così la partita non è sempre
// uguale dall'inizio alla fine.
function scheduleNextHeart(area, startedAt) {
  if (!catchState) return;
  const progress = Math.min(1, (Date.now() - startedAt) / (CATCH_DURATION_SEC * 1000));
  const interval = 750 - progress * 350; // da 750ms a 400ms
  catchState.spawnTimer = setTimeout(() => {
    spawnHeart(area);
    scheduleNextHeart(area, startedAt);
  }, interval);
}

function spawnHeart(area) {
  if (!area || !catchState) return;
  const roll = Math.random();
  // 18% cuore dorato (bonus), 17% cuore spezzato (da evitare), il resto cuore normale
  const type = roll < 0.18 ? "gold" : roll < 0.35 ? "trap" : "normal";
  const heart = document.createElement("button");
  heart.className = "flying-heart";
  heart.textContent = type === "gold" ? "💛" : type === "trap" ? "💔" : "💗";
  heart.style.left = 8 + Math.random() * 78 + "%";
  heart.style.top = 8 + Math.random() * 68 + "%";
  const lifespan = type === "gold" ? 550 : 850;
  heart.addEventListener("click", () => {
    if (!catchState) return;
    if (type === "trap") {
      catchState.score = Math.max(0, catchState.score - CATCH_TRAP_PENALTY);
    } else {
      catchState.score += type === "gold" ? CATCH_GOLD_POINTS : CATCH_HEART_POINTS;
    }
    const note = document.getElementById("catch-note");
    if (note) note.textContent = `Punteggio: ${catchState.score} · Tempo: ${catchState.timeLeft}s`;
    heart.remove();
  });
  area.appendChild(heart);
  setTimeout(() => heart.remove(), lifespan);
}

function stopCatchGame(discard) {
  if (catchState) {
    clearTimeout(catchState.spawnTimer);
    clearInterval(catchState.countdownTimer);
  }
  if (discard) catchState = null;
}

function finishCatchGame() {
  stopCatchGame(false);
  const score = catchState.score;
  let affettoGain, coinGain, msg;
  if (score >= 12) { affettoGain = 4; coinGain = 2; msg = "Riflessi fulminei! Che squadra 💗"; }
  else if (score >= 6) { affettoGain = 2; coinGain = 1; msg = "Bel punteggio!"; }
  else { affettoGain = 1; coinGain = 0; msg = "Fatto! Alla prossima andrà ancora meglio 😊"; }
  state.coins += coinGain;
  addAffetto(affettoGain);
  save();
  updateBars();
  setDiary(msg);
  spawnParticles(["💗", "✨"], 6);
  catchState = null;
  checkAchievements();
  setTimeout(() => refreshIdleDiary(true), 1800);
  renderCatchView();
}

/* ---------- 4) INDOVINA IL NUMERO ---------- */

let guessState = null;

function renderGuessView() {
  guessLimiter.refresh();
  const roundsLeft = guessLimiter.roundsLeft();
  let inner;
  if (!guessState) {
    inner = `
      <div class="sheet-note">Tommy pensa un numero da 1 a ${GUESS_MAX_NUMBER}, hai ${GUESS_MAX_ATTEMPTS} tentativi! Partite rimaste: ${roundsLeft}/${guessLimiter.max}</div>
      <button id="guess-start-btn" class="primary-btn" ${roundsLeft <= 0 ? "disabled" : ""}>
        ${roundsLeft <= 0 ? `Riprova tra ${formatMMSS(guessLimiter.remainingMs())}` : `Inizia (-${GUESS_ENERGY_COST}⚡)`}
      </button>
    `;
  } else {
    inner = `
      <div class="sheet-note">Tentativi rimasti: ${guessState.attemptsLeft} · ${guessState.hint}</div>
      <div class="guess-row">
        <input type="number" id="guess-input" min="1" max="${GUESS_MAX_NUMBER}" inputmode="numeric" placeholder="1-${GUESS_MAX_NUMBER}">
        <button id="guess-submit">Prova</button>
      </div>
      <div class="guess-history">${guessState.guesses.map(g => `<span class="guess-chip">${g}</span>`).join("")}</div>
    `;
  }
  el.sheetContent.innerHTML = `${backButton()}<h3>🔢 Indovina il Numero</h3>${inner}`;
  bindBack(() => { guessState = null; renderGiocoHub(); });
  document.getElementById("guess-start-btn")?.addEventListener("click", startGuessGame);
  document.getElementById("guess-submit")?.addEventListener("click", submitGuess);
  document.getElementById("guess-input")?.addEventListener("keydown", e => { if (e.key === "Enter") submitGuess(); });
}

function startGuessGame() {
  guessLimiter.refresh();
  if (guessLimiter.roundsLeft() <= 0) { renderGuessView(); return; }
  guessLimiter.use();
  state.totalGamesPlayed += 1;
  state.energia = clamp(state.energia - GUESS_ENERGY_COST);
  state.fame = clamp(state.fame - GUESS_FAME_COST);
  state.igiene = clamp(state.igiene - GUESS_IGIENE_COST);
  save();
  updateBars();
  guessState = {
    target: 1 + Math.floor(Math.random() * GUESS_MAX_NUMBER),
    attemptsLeft: GUESS_MAX_ATTEMPTS,
    guesses: [],
    hint: "Fai il tuo primo tentativo!",
  };
  renderGuessView();
}

function submitGuess() {
  if (!guessState) return;
  const input = document.getElementById("guess-input");
  const val = parseInt(input.value, 10);
  if (!val || val < 1 || val > GUESS_MAX_NUMBER) return;
  guessState.guesses.push(val);
  guessState.attemptsLeft -= 1;
  if (val === guessState.target) { finishGuessGame(true); return; }
  guessState.hint = val < guessState.target ? "Più alto! 📈" : "Più basso! 📉";
  if (guessState.attemptsLeft <= 0) { finishGuessGame(false); return; }
  renderGuessView();
}

function finishGuessGame(won) {
  let affettoGain, coinGain, msg;
  if (won) {
    const attemptsUsed = GUESS_MAX_ATTEMPTS - guessState.attemptsLeft;
    if (attemptsUsed <= 2) { affettoGain = 4; coinGain = 2; msg = "Incredibile, mi conosci alla perfezione! 🔢💗"; }
    else { affettoGain = 2; coinGain = 1; msg = "Trovato! Bel colpo 🎯"; }
    spawnParticles(["🎯", "💗"], 6);
  } else {
    affettoGain = 1; coinGain = 0; msg = `Era ${guessState.target}! Alla prossima 😄`;
  }
  state.coins += coinGain;
  addAffetto(affettoGain);
  save();
  updateBars();
  setDiary(msg);
  guessState = null;
  checkAchievements();
  setTimeout(() => refreshIdleDiary(true), 1800);
  renderGuessView();
}

/* ---------- 9. COLLEGAMENTO PULSANTI ---------- */

document.querySelectorAll(".action-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    if (action === "frigo") { renderFridgeSheet(); openSheet(); }
    else if (action === "negozio") { renderNegozioSheet(); openSheet(); }
    else if (action === "gioco") { renderGiocoHub(); openSheet(); }
    else if (action === "doccia") doccia();
    else if (action === "dormi") dormi();
    else if (action === "coccola") coccola();
    else if (action === "trofei") { renderTrofeiSheet(); openSheet(); }
  });
});

/* ---------- 10. AVVIO ---------- */

tick();
updateBars();
fastTick();
setInterval(tick, 15000);   // decadimento statistiche + notte, ogni 15s
setInterval(fastTick, 1000); // orologio + countdown coccola, ogni secondo
