const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const overlay = document.querySelector("#overlay");
const pauseMenu = document.querySelector("#pauseMenu");
const overlayTitle = document.querySelector("#overlayTitle");
const overlayText = document.querySelector("#overlayText");
const pauseDetails = document.querySelector("#pauseDetails");
const runSummary = document.querySelector("#runSummary");
const badgeGrid = document.querySelector("#badgeGrid");
const tokenCodex = document.querySelector("#tokenCodex");
const contractCard = document.querySelector("#contractCard");
const historyList = document.querySelector("#historyList");
const installCard = document.querySelector("#installCard");
const installText = document.querySelector("#installText");
const menuTabs = document.querySelector("#menuTabs");
const startButton = document.querySelector("#startButton");
const resetButton = document.querySelector("#resetButton");
const installButton = document.querySelector("#installButton");
const exportButton = document.querySelector("#exportButton");
const importButton = document.querySelector("#importButton");
const importInput = document.querySelector("#importInput");
const resumeButton = document.querySelector("#resumeButton");
const restartButton = document.querySelector("#restartButton");
const quitButton = document.querySelector("#quitButton");
const pauseButton = document.querySelector("#pauseButton");
const soundButton = document.querySelector("#soundButton");
const missionGrid = document.querySelector("#missionGrid");
const coreGrid = document.querySelector("#coreGrid");
const upgradeRow = document.querySelector("#upgradeRow");
const settingsRow = document.querySelector("#settingsRow");
const difficultyRow = document.querySelector("#difficultyRow");
const saveRow = document.querySelector("#saveRow");
const scoreEl = document.querySelector("#score");
const streakEl = document.querySelector("#streak");
const livesEl = document.querySelector("#lives");
const creditsEl = document.querySelector("#credits");
const coreLabel = document.querySelector("#coreLabel");
const menuPanels = Array.from(document.querySelectorAll(".menu-panel"));
const menuTabButtons = Array.from(document.querySelectorAll("#menuTabs button"));

const W = canvas.width;
const H = canvas.height;
const lanes = [W * 0.22, W * 0.5, W * 0.78];
const storeKey = "the-ai-game-v2";

const missions = [
  { id: "alignment", name: "Alignment Lab", brief: "Keep streaks alive and avoid bad outputs.", target: 4200, hazardBias: 0.9, rewardBias: 1.06, spawnGap: 0.95, focus: "bug", objective: { kind: "streak", label: "Reach a 10x streak", goal: 10 } },
  { id: "retrieval", name: "RAG Sprint", brief: "Context is common, but injection is hunting you.", target: 5200, hazardBias: 1.08, rewardBias: 1.18, spawnGap: 0.9, focus: "injection", objective: { kind: "retrieval", label: "Collect 5 C/R tokens", goal: 5 } },
  { id: "agent", name: "Agent Mode", brief: "Faster tasks, more drift, bigger payouts.", target: 5700, hazardBias: 1.28, rewardBias: 1.26, spawnGap: 0.78, focus: "drift", objective: { kind: "survive", label: "Survive 45 seconds", goal: 45 } },
  { id: "vision", name: "Vision Stack", brief: "Noisy inputs and quick reactions.", target: 5200, hazardBias: 1.16, rewardBias: 1.12, spawnGap: 0.84, focus: "mixed", objective: { kind: "lanes", label: "Collect from all lanes", goal: 3 } },
  { id: "edge", name: "Edge Deploy", brief: "Lean model, tight pacing, no room for waste.", target: 5600, hazardBias: 1.2, rewardBias: 1.2, spawnGap: 0.76, focus: "bug", objective: { kind: "power", label: "Collect 4 powerups", goal: 4 } },
  { id: "ethics", name: "Ethics Review", brief: "Guardrails matter more than raw throughput.", target: 5000, hazardBias: 1.04, rewardBias: 1.08, spawnGap: 0.88, focus: "injection", objective: { kind: "block", label: "Block 3 hazards", goal: 3 } },
  { id: "multimodal", name: "Multimodal Lab", brief: "Signals jump lanes while hazards mix together.", target: 6000, hazardBias: 1.24, rewardBias: 1.22, spawnGap: 0.8, focus: "mixed", objective: { kind: "route", label: "Reach a 5-step route", goal: 5 } }
];

function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function hashSeed(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function dailyMission() {
  const key = todayKey();
  const seed = hashSeed(key);
  const variants = [
    { kind: "streak", label: "Reach an 8x streak", goal: 8, focus: "bug" },
    { kind: "retrieval", label: "Collect 4 C/R tokens", goal: 4, focus: "injection" },
    { kind: "survive", label: "Survive 35 seconds", goal: 35, focus: "drift" },
    { kind: "lanes", label: "Collect from all lanes", goal: 3, focus: "mixed" }
  ];
  const variant = variants[seed % variants.length];
  return {
    id: "daily",
    name: "Daily Benchmark",
    brief: `${key}: fixed seed, one shared challenge.`,
    target: 5000 + (seed % 5) * 220,
    hazardBias: 1.08 + (seed % 3) * 0.06,
    rewardBias: 1.12,
    spawnGap: 0.86,
    focus: variant.focus,
    objective: { kind: variant.kind, label: variant.label, goal: variant.goal },
    dailyKey: key,
    seed
  };
}

function dailyContract() {
  const key = todayKey();
  const seed = hashSeed(`${key}-contract`);
  const options = [
    { kind: "collect", label: "Collect 8 good tokens", goal: 8 },
    { kind: "block", label: "Block 2 hazards", goal: 2 },
    { kind: "near", label: "Make 3 near misses", goal: 3 },
    { kind: "route", label: "Reach a 4-step route", goal: 4 },
    { kind: "power", label: "Collect 3 powerups", goal: 3 }
  ];
  return { ...options[seed % options.length], key };
}

const types = {
  signal: { color: "#8be46d", label: "S", points: 78, good: true, shape: "circle" },
  context: { color: "#49d6d2", label: "C", points: 122, good: true, shape: "hex" },
  guardrail: { color: "#f1f7fa", label: "G", points: 58, good: true, shape: "shield" },
  fineTune: { color: "#b6a4ff", label: "F", points: 68, good: true, shape: "diamond" },
  rag: { color: "#78e3ff", label: "R", points: 88, good: true, shape: "ring" },
  bug: { color: "#ff5f91", label: "!", bad: true, shape: "square" },
  drift: { color: "#ffc45c", label: "?", bad: true, shape: "triangle" },
  injection: { color: "#ff8b5c", label: "#", bad: true, shape: "slash" }
};

const upgrades = {
  shield: { name: "Guard", max: 3, baseCost: 4 },
  magnet: { name: "RAG", max: 3, baseCost: 5 },
  slow: { name: "Tune", max: 3, baseCost: 5 }
};

const difficultyModes = {
  standard: { name: "Standard", brief: "Baseline pressure.", hazard: 1, spawn: 1, reward: 1, xp: 1, target: 1 },
  hard: { name: "Hard", brief: "More hazards, better rewards.", hazard: 1.22, spawn: 0.88, reward: 1.25, xp: 1.2, target: 1.22 },
  chaos: { name: "Chaos", brief: "Fast and volatile.", hazard: 1.46, spawn: 0.74, reward: 1.55, xp: 1.35, target: 1.45 }
};

const systemEvents = [
  { id: "surge", name: "Data Surge", brief: "Collect 5 good tokens", goal: 5, duration: 12, reward: 260 },
  { id: "audit", name: "Safety Audit", brief: "Collect 2 guard/context tokens", goal: 2, duration: 14, reward: 300 },
  { id: "redteam", name: "Red Team Test", brief: "Avoid hits for 8 seconds", goal: 8, duration: 8, reward: 340 },
  { id: "mitigation", name: "Mitigation Drill", brief: "Block 1 hazard", goal: 1, duration: 13, reward: 320 },
  { id: "latency", name: "Latency Spike", brief: "Reach a 4x streak", goal: 4, duration: 12, reward: 280 },
  { id: "routing", name: "Routing Shift", brief: "Collect from 2 new lanes", goal: 2, duration: 13, reward: 300 }
];

const cores = [
  { id: "nano", name: "Nano", cost: 0, perk: "Balanced starter core.", colors: ["#eff8fb", "#49d6d2", "#ff5f91"] },
  { id: "sentinel", name: "Sentinel", cost: 8, perk: "Starts with one extra guard.", colors: ["#eff8fb", "#8be46d", "#49d6d2"] },
  { id: "retriever", name: "Retriever", cost: 10, perk: "RAG pull lasts longer.", colors: ["#eff8fb", "#78e3ff", "#b6a4ff"] },
  { id: "sprinter", name: "Sprinter", cost: 12, perk: "Earns more passive score.", colors: ["#eff8fb", "#ffc45c", "#ff5f91"] }
];

const badges = {
  firstRun: "First Run",
  objective: "Objective Clear",
  daily: "Daily Clear",
  focus: "Focus Guard",
  perfect: "Perfect Route",
  route: "Adaptive Route",
  mastery: "Core Mastery",
  contract: "Contract Clear",
  incident: "Incident Clear"
};

const tutorialSteps = [
  { kind: "signal", lane: 1, hint: "First: collect S tokens for score." },
  { kind: "context", lane: 1, hint: "C adds guard shield. Stay centered." },
  { kind: "bug", lane: 0, hint: "! is hallucination. Dodge bad tokens." },
  { kind: "guardrail", lane: 2, hint: "G clears hazards in your current lane." },
  { kind: "rag", lane: 1, hint: "R is RAG. It pulls good tokens toward you." }
];

let player;
let items;
let particles;
let stars;
let state;
let profile;
let selectedMission;
let popups;
let audioContext;
let lastTime = 0;
let spawnTimer = 0;
let swipeStart = null;
let installPromptEvent = null;
let activeMenuTab = "run";

function loadProfile() {
  const blank = {
    credits: 0,
    sound: false,
    haptics: true,
    reduceMotion: false,
    runs: 0,
    tutorialDone: false,
    difficulty: "standard",
    selectedMission: "alignment",
    selectedCore: "nano",
    unlockedCores: ["nano"],
    coreXp: {},
    daily: {},
    contracts: {},
    badges: [],
    history: [],
    best: {},
    upgrades: { shield: 0, magnet: 0, slow: 0 }
  };
  try {
    const saved = JSON.parse(localStorage.getItem(storeKey));
    return {
      credits: Number(saved?.credits) || 0,
      sound: saved?.sound === true,
      haptics: saved?.haptics !== false,
      reduceMotion: saved?.reduceMotion === true,
      runs: Number(saved?.runs) || 0,
      tutorialDone: saved?.tutorialDone === true,
      difficulty: difficultyModes[saved?.difficulty] ? saved.difficulty : blank.difficulty,
      selectedMission: saved?.selectedMission || blank.selectedMission,
      selectedCore: saved?.selectedCore || blank.selectedCore,
      unlockedCores: Array.isArray(saved?.unlockedCores) ? saved.unlockedCores : blank.unlockedCores,
      coreXp: saved?.coreXp || {},
      daily: saved?.daily || {},
      contracts: saved?.contracts || {},
      badges: Array.isArray(saved?.badges) ? saved.badges : [],
      history: Array.isArray(saved?.history) ? saved.history.slice(0, 5) : [],
      best: saved?.best || {},
      upgrades: {
        shield: Number(saved?.upgrades?.shield) || 0,
        magnet: Number(saved?.upgrades?.magnet) || 0,
        slow: Number(saved?.upgrades?.slow) || 0
      }
    };
  } catch {
    return blank;
  }
}

function blankProfile(settings = {}) {
  return {
    credits: 0,
    sound: settings.sound === true,
    haptics: settings.haptics !== false,
    reduceMotion: settings.reduceMotion === true,
    runs: 0,
    tutorialDone: false,
    difficulty: difficultyModes[settings.difficulty] ? settings.difficulty : "standard",
    selectedMission: "alignment",
    selectedCore: "nano",
    unlockedCores: ["nano"],
    coreXp: {},
    daily: {},
    contracts: {},
    badges: [],
    history: [],
    best: {},
    upgrades: { shield: 0, magnet: 0, slow: 0 }
  };
}

function saveProfile() {
  localStorage.setItem(storeKey, JSON.stringify(profile));
}

function exportProfile() {
  const payload = JSON.stringify({ game: "The AI Game", version: 1, exportedAt: new Date().toISOString(), profile }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `the-ai-game-save-${todayKey()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function normalizeImportedProfile(value) {
  const incoming = value?.profile || value;
  if (!incoming || typeof incoming !== "object") throw new Error("Save file is not a profile.");
  const previous = localStorage.getItem(storeKey);
  localStorage.setItem(storeKey, JSON.stringify(incoming));
  try {
    return loadProfile();
  } finally {
    if (previous === null) localStorage.removeItem(storeKey);
    else localStorage.setItem(storeKey, previous);
  }
}

function vibrate(pattern) {
  if (!profile.haptics) return;
  navigator.vibrate?.(pattern);
}

function unlockBadge(id) {
  if (!badges[id] || profile.badges.includes(id)) return;
  profile.badges.push(id);
  saveProfile();
  if (state?.running) addPopup(`BADGE: ${badges[id]}`, W / 2, H * 0.42, "#ffc45c", 28);
}

function getMission() {
  if (selectedMission === "daily") return dailyMission();
  return missions.find((mission) => mission.id === selectedMission) || missions[0];
}

function getCore() {
  return cores.find((core) => core.id === profile.selectedCore) || cores[0];
}

function getDifficulty() {
  return difficultyModes[profile.difficulty] || difficultyModes.standard;
}

function targetScore(mission = getMission()) {
  return Math.round(mission.target * getDifficulty().target);
}

function coreXp(coreId) {
  return Number(profile.coreXp?.[coreId]) || 0;
}

function coreLevel(coreId) {
  return Math.floor(coreXp(coreId) / 100) + 1;
}

function coreProgress(coreId) {
  return coreXp(coreId) % 100;
}

function maxShield() {
  return 2 + profile.upgrades.shield;
}

function upgradeCost(key) {
  return upgrades[key].baseCost + profile.upgrades[key] * 3;
}

function canBuy(key) {
  return profile.upgrades[key] < upgrades[key].max && profile.credits >= upgradeCost(key);
}

function setMenuTab(tab) {
  activeMenuTab = tab || "run";
  installCard.hidden = menuTabs.hidden || activeMenuTab !== "tools";
  overlay.classList.toggle("is-run-menu", !menuTabs.hidden && activeMenuTab === "run");
  for (const button of menuTabButtons) {
    const selected = button.dataset.tab === activeMenuTab;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-selected", String(selected));
  }
  for (const panel of menuPanels) {
    const active = panel.dataset.panel === activeMenuTab;
    panel.hidden = !active || menuTabs.hidden;
    panel.classList.toggle("is-active", active);
  }
}

function renderMenus() {
  const mission = getMission();
  const allMissions = [dailyMission(), ...missions];
  const daily = profile.daily[todayKey()];
  creditsEl.textContent = profile.credits;
  soundButton.textContent = profile.sound ? "Sound on" : "Sound off";
  const canInstall = Boolean(installPromptEvent);
  installButton.hidden = !canInstall;
  installText.textContent = canInstall
    ? "Install The AI Game for full-screen offline play."
    : location.protocol === "file:"
      ? "Serve over localhost or HTTPS to enable install and offline caching."
      : "Use your browser menu to add The AI Game to your home screen.";
  missionGrid.innerHTML = "";
  coreGrid.innerHTML = "";
  upgradeRow.innerHTML = "";
  settingsRow.innerHTML = "";
  difficultyRow.innerHTML = "";
  badgeGrid.innerHTML = "";
  tokenCodex.innerHTML = "";
  contractCard.innerHTML = "";
  historyList.innerHTML = "";

  const earnedBadges = profile.badges.map((id) => badges[id]).filter(Boolean);
  if (earnedBadges.length === 0) {
    badgeGrid.innerHTML = `<span class="badge is-empty">No badges yet</span>`;
  } else {
    badgeGrid.innerHTML = earnedBadges.map((name) => `<span class="badge">${name}</span>`).join("");
  }

  const codexItems = [
    ["S", "signal"],
    ["C", "context"],
    ["G", "guard"],
    ["R", "RAG"],
    ["F", "tune"],
    ["!", "bad"],
    ["?", "drift"],
    ["#", "inject"]
  ];
  tokenCodex.innerHTML = codexItems
    .map(([symbol, label]) => `<div class="token-cell"><strong>${symbol}</strong><span>${label}</span></div>`)
    .join("");

  const contract = dailyContract();
  const savedContract = profile.contracts[contract.key];
  contractCard.innerHTML = `<strong>Daily Contract</strong>${contract.label} - ${savedContract?.cleared ? "cleared" : `${savedContract?.best || 0}/${contract.goal}`}`;

  if (profile.history.length === 0) {
    historyList.innerHTML = `<div class="history-item is-empty">No completed runs yet</div>`;
  } else {
    historyList.innerHTML = profile.history
      .map((run) => {
        const tags = [run.objective ? "objective" : "", run.contract ? "contract" : "", run.incidents ? "incident" : "", run.perfect ? "perfect" : "", run.daily ? "daily" : ""].filter(Boolean).join(", ");
        return `<div class="history-item"><strong>${run.mission}</strong> ${run.score} pts, ${run.difficulty || "Standard"}, +${run.earned} data, +${run.masteryXp || 0} XP${tags ? ` - ${tags}` : ""}<br>${run.date}</div>`;
      })
      .join("");
  }

  const missionSelect = document.createElement("select");
  missionSelect.className = "mission-select";
  missionSelect.setAttribute("aria-label", "Benchmark");
  for (const option of allMissions) {
    const item = document.createElement("option");
    item.value = option.id;
    item.textContent = option.name;
    item.selected = option.id === mission.id;
    missionSelect.append(item);
  }
  missionSelect.addEventListener("change", () => {
    selectedMission = missionSelect.value;
    profile.selectedMission = missionSelect.value;
    saveProfile();
    renderMenus();
    paintIdle();
  });
  const missionSelectWrap = document.createElement("div");
  missionSelectWrap.className = "select-wrap";
  missionSelectWrap.append(missionSelect);
  missionGrid.append(missionSelectWrap);

  const status = mission.id === "daily"
    ? `Best: ${daily?.best || 0}${daily?.cleared ? " - cleared" : ""}`
    : `Best: ${profile.best[mission.id] || 0}`;
  const displayTarget = Math.round(mission.target * getDifficulty().target);
  const missionDetail = document.createElement("div");
  missionDetail.className = "mission-card is-selected";
  missionDetail.innerHTML = `<strong>${mission.name}</strong><span>${mission.brief}</span><span>${status}. Target ${displayTarget}. Objective: ${mission.objective.label}</span>`;
  missionGrid.append(missionDetail);

  for (const [key, option] of Object.entries(difficultyModes)) {
    const button = document.createElement("button");
    button.className = `difficulty-button${profile.difficulty === key ? " is-selected" : ""}`;
    button.type = "button";
    button.innerHTML = `<strong>${option.name}</strong><span>${option.brief}</span><span>${Math.round(option.reward * 100)}% data, ${Math.round(option.target * 100)}% target</span>`;
    button.addEventListener("click", () => {
      profile.difficulty = key;
      saveProfile();
      renderMenus();
      paintIdle();
    });
    difficultyRow.append(button);
  }

  const coreSelect = document.createElement("select");
  coreSelect.className = "core-select";
  coreSelect.setAttribute("aria-label", "Model core");
  for (const core of cores) {
    const owned = profile.unlockedCores.includes(core.id);
    const item = document.createElement("option");
    item.value = core.id;
    item.textContent = owned ? `${core.name} L${coreLevel(core.id)}` : `${core.name} - ${core.cost} data`;
    item.selected = profile.selectedCore === core.id;
    item.disabled = !owned && profile.credits < core.cost;
    coreSelect.append(item);
  }
  coreSelect.addEventListener("change", () => {
    const nextCore = cores.find((core) => core.id === coreSelect.value) || cores[0];
    const owned = profile.unlockedCores.includes(nextCore.id);
    if (!owned) {
      if (profile.credits < nextCore.cost) return;
      profile.credits -= nextCore.cost;
      profile.unlockedCores.push(nextCore.id);
    }
    profile.selectedCore = nextCore.id;
    saveProfile();
    renderMenus();
    paintIdle();
  });
  const coreSelectWrap = document.createElement("div");
  coreSelectWrap.className = "select-wrap";
  coreSelectWrap.append(coreSelect);
  coreGrid.append(coreSelectWrap);

  const core = getCore();
  const coreDetail = document.createElement("div");
  coreDetail.className = "core-card is-selected";
  coreDetail.innerHTML = `<strong>${core.name} core L${coreLevel(core.id)}</strong><span>${core.perk}</span><span>${coreProgress(core.id)}/100 mastery</span>`;
  coreGrid.append(coreDetail);

  for (const key of Object.keys(upgrades)) {
    const def = upgrades[key];
    const level = profile.upgrades[key];
    const cost = upgradeCost(key);
    const button = document.createElement("button");
    button.className = "upgrade-card";
    button.type = "button";
    button.disabled = level >= def.max || !canBuy(key);
    button.innerHTML = `<strong>${def.name} ${level}/${def.max}</strong><span>${level >= def.max ? "Maxed" : `${cost} data`}</span>`;
    button.addEventListener("click", () => {
      if (!canBuy(key)) return;
      profile.credits -= cost;
      profile.upgrades[key] += 1;
      saveProfile();
      renderMenus();
    });
    upgradeRow.append(button);
  }

  const settings = [
    ["sound", "Sound"],
    ["haptics", "Haptics"],
    ["reduceMotion", "Calm"]
  ];
  for (const [key, label] of settings) {
    const button = document.createElement("button");
    button.className = `setting-button${profile[key] ? " is-on" : ""}`;
    button.type = "button";
    button.textContent = `${label} ${profile[key] ? "on" : "off"}`;
    button.addEventListener("click", () => {
      profile[key] = !profile[key];
      saveProfile();
      renderMenus();
      if (key === "sound") {
        soundButton.textContent = profile.sound ? "Sound on" : "Sound off";
        ensureAudio();
        playTone(profile.sound ? 620 : 220, 0.1, "triangle");
      }
    });
    settingsRow.append(button);
  }
  setMenuTab(activeMenuTab);
}

function resetGame() {
  const mission = getMission();
  const core = getCore();
  player = {
    lane: 1,
    x: lanes[1],
    y: H - 150,
    shield: Math.min(1 + profile.upgrades.shield + (core.id === "sentinel" ? 1 : 0), maxShield() + 1),
    magnet: 0,
    slow: 0,
    core
  };
  items = [];
  particles = [];
  popups = [];
  stars = Array.from({ length: 72 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 1 + Math.random() * 2.4,
    s: 24 + Math.random() * 70
  }));
  state = {
    running: true,
    paused: false,
    over: false,
    score: 0,
    streak: 0,
    lives: 3,
    level: 1,
    time: 0,
    mission,
    completed: false,
    shake: 0,
    flash: 0,
    hint: "",
    hintTime: 0,
    seenTips: new Set(),
    rng: mission.id === "daily" ? seededRandom(mission.seed) : Math.random,
    tutorial: {
      active: !profile.tutorialDone && mission.id !== "daily",
      index: 0
    },
    stats: {
      spawned: 0,
      collected: 0,
      powerups: 0,
      blocked: 0,
      hits: 0,
      missed: 0,
      nearMisses: 0,
      systemEvents: 0,
      routeChain: 0,
      maxRouteChain: 0,
      lastCollectLane: null,
      maxStreak: 0,
      retrieval: 0,
      lanes: [false, false, false],
      objectiveComplete: false
    },
    contract: dailyContract(),
    contractComplete: false,
    systemEvent: null,
    nextSystemEvent: 18
  };
  state.nextSystemEvent = 16 + state.rng() * 7;
  syncHud();
}

function syncHud() {
  scoreEl.textContent = Math.floor(state.score);
  streakEl.textContent = state.streak;
  livesEl.textContent = state.lives;
  creditsEl.textContent = profile.credits;
  coreLabel.textContent = `${getCore().name} core L${coreLevel(getCore().id)}`;
}

function setOverlay(title, text, showMenus) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  runSummary.hidden = true;
  menuTabs.hidden = !showMenus;
  if (showMenus) {
    setMenuTab(activeMenuTab);
  } else {
    overlay.classList.remove("is-run-menu");
    installCard.hidden = true;
    for (const panel of menuPanels) panel.hidden = true;
  }
  resetButton.hidden = !showMenus;
}

function showRunSummary(result) {
  const stats = state.stats;
  const target = targetScore(state.mission);
  const best = profile.best[state.mission.id] || 0;
  const cells = [
    [result.finalScore, "score"],
    [result.difficulty, "difficulty"],
    [`${result.finalScore}/${target}`, "target"],
    [result.objectiveComplete ? "yes" : "no", "objective"],
    [result.earned, "data earned"],
    [result.masteryXp, "core XP"],
    [result.contractComplete ? "yes" : "no", "contract"],
    [stats.systemEvents, "incidents cleared"],
    [best, "best"],
    [stats.collected, "tokens collected"],
    [stats.powerups, "powerups"],
    [stats.blocked, "hazards blocked"],
    [stats.nearMisses, "near misses"],
    [stats.maxRouteChain, "best route"],
    [stats.hits, "model hits"],
    [result.perfect ? "yes" : "no", "perfect route"],
    [stats.maxStreak, "best streak"],
    [`${Math.floor(state.time)}s`, "survival"]
  ];
  runSummary.innerHTML = cells
    .map(([value, label]) => `<div class="summary-cell"><strong>${value}</strong><span>${label}</span></div>`)
    .join("");
  runSummary.hidden = false;
}

function ensureAudio() {
  if (!profile.sound) return;
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  audioContext.resume?.();
}

function playTone(frequency, duration = 0.09, type = "sine", gainValue = 0.045) {
  if (!profile.sound || !audioContext) return;
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(gainValue, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

function showHint(text, seconds = 2.3) {
  if (!state?.running || state.hintTime > 1.1) return;
  state.hint = text;
  state.hintTime = seconds;
}

function showTip(kind) {
  if (state.seenTips.has(kind) || state.seenTips.size > 5) return;
  state.seenTips.add(kind);
  const tips = {
    signal: "S is signal. Collect it for score.",
    context: "C is context. It adds guard shield.",
    guardrail: "G is guardrail. It clears lane hazards.",
    fineTune: "F is fine-tune. It slows hazards.",
    rag: "R is RAG. It pulls good tokens toward you.",
    bug: "! is hallucination. Dodge it.",
    drift: "? is drift. Stay out of its lane.",
    injection: "# is prompt injection. Treat it as hostile."
  };
  showHint(tips[kind]);
}

function addPopup(text, x, y, color = "#eff8fb", size = 28) {
  popups.push({ text, x, y, color, size, life: 0.85, vy: -58 });
}

function objectiveProgress() {
  const objective = state.mission.objective;
  if (objective.kind === "streak") return Math.min(objective.goal, state.stats.maxStreak);
  if (objective.kind === "retrieval") return Math.min(objective.goal, state.stats.retrieval);
  if (objective.kind === "survive") return Math.min(objective.goal, Math.floor(state.time));
  if (objective.kind === "lanes") return state.stats.lanes.filter(Boolean).length;
  if (objective.kind === "power") return Math.min(objective.goal, state.stats.powerups);
  if (objective.kind === "block") return Math.min(objective.goal, state.stats.blocked);
  if (objective.kind === "route") return Math.min(objective.goal, state.stats.maxRouteChain);
  return 0;
}

function isObjectiveComplete() {
  return objectiveProgress() >= state.mission.objective.goal;
}

function updateObjective() {
  if (state.stats.objectiveComplete || !isObjectiveComplete()) return;
  state.stats.objectiveComplete = true;
  state.score += 300;
  addPopup("OBJECTIVE COMPLETE", W / 2, H * 0.34, "#ffc45c", 32);
  showHint("Objective complete. Bonus data armed.");
  playTone(698, 0.08, "triangle", 0.04);
  playTone(880, 0.16, "triangle", 0.035);
}

function contractProgress() {
  const contract = state.contract;
  if (contract.kind === "collect") return Math.min(contract.goal, state.stats.collected);
  if (contract.kind === "block") return Math.min(contract.goal, state.stats.blocked);
  if (contract.kind === "near") return Math.min(contract.goal, state.stats.nearMisses);
  if (contract.kind === "route") return Math.min(contract.goal, state.stats.maxRouteChain);
  if (contract.kind === "power") return Math.min(contract.goal, state.stats.powerups);
  return 0;
}

function updateContract() {
  if (state.contractComplete || contractProgress() < state.contract.goal) return;
  state.contractComplete = true;
  state.score += 220;
  addPopup("CONTRACT CLEAR", W / 2, H * 0.5, "#78e3ff", 30);
  unlockBadge("contract");
}

function startSystemEvent(forcedId) {
  if (!state?.running || state.systemEvent || state.tutorial.active) return;
  const event = systemEvents.find((option) => option.id === forcedId) || systemEvents[Math.floor(state.rng() * systemEvents.length)];
  state.systemEvent = {
    ...event,
    progress: 0,
    lanes: [false, false, false],
    startedAt: state.time,
    expiresAt: state.time + event.duration
  };
  addPopup(event.name.toUpperCase(), W / 2, H * 0.38, "#ffc45c", 30);
  showHint(`${event.name}: ${event.brief}.`, 3);
  playTone(587, 0.08, "triangle", 0.035);
  playTone(740, 0.12, "triangle", 0.03);
}

function completeSystemEvent() {
  if (!state.systemEvent) return;
  const event = state.systemEvent;
  state.score += event.reward;
  state.stats.systemEvents += 1;
  if (event.id === "mitigation") player.shield = Math.min(maxShield() + 1, player.shield + 1);
  addPopup(`INCIDENT CLEAR +${event.reward}`, W / 2, H * 0.42, "#8be46d", 28);
  unlockBadge("incident");
  state.systemEvent = null;
  state.nextSystemEvent = state.time + 24 + state.rng() * 12;
  playTone(659, 0.08, "triangle", 0.04);
  playTone(988, 0.14, "triangle", 0.032);
}

function expireSystemEvent(failed = false) {
  if (!state.systemEvent) return;
  addPopup(failed ? "INCIDENT FAILED" : "INCIDENT EXPIRED", W / 2, H * 0.42, "#ff5f91", 26);
  state.systemEvent = null;
  state.nextSystemEvent = state.time + 18 + state.rng() * 10;
}

function updateSystemEventProgress(kind, itemKind) {
  const event = state.systemEvent;
  if (!event) return;
  if (event.id === "surge" && kind === "good") event.progress += 1;
  if (event.id === "audit" && kind === "good" && (itemKind === "guardrail" || itemKind === "context")) event.progress += 1;
  if (event.id === "mitigation" && kind === "block") event.progress += 1;
  if (event.id === "latency" && kind === "good") event.progress = Math.max(event.progress, state.streak);
  if (event.progress >= event.goal) completeSystemEvent();
}

function updateSystemEventLane(lane) {
  const event = state.systemEvent;
  if (!event || event.id !== "routing") return;
  if (!event.lanes[lane]) {
    event.lanes[lane] = true;
    event.progress = event.lanes.filter(Boolean).length;
  }
  if (event.progress >= event.goal) completeSystemEvent();
}

function startGame() {
  ensureAudio();
  activeMenuTab = "run";
  resetGame();
  overlay.hidden = true;
  pauseMenu.hidden = true;
  runSummary.hidden = true;
  pauseButton.textContent = "Pause";
  showHint(profile.tutorialDone ? "Swipe, tap lanes, or use arrows to move." : "Guided run: follow the first tokens.");
  playTone(440, 0.08, "triangle");
  playTone(660, 0.12, "triangle", 0.035);
  vibrate(20);
}

function pauseGame() {
  if (!state?.running || state.paused) return;
  state.paused = true;
  pauseButton.textContent = "Resume";
  pauseDetails.textContent = `${state.mission.name} on ${getDifficulty().name}: ${objectiveProgress()}/${state.mission.objective.goal} ${state.mission.objective.label}. Core: ${player.core.name}. Score: ${Math.floor(state.score)}.`;
  pauseMenu.hidden = false;
}

function resumeGame() {
  if (!state?.running || !state.paused) return;
  state.paused = false;
  pauseButton.textContent = "Pause";
  pauseMenu.hidden = true;
}

function quitRun() {
  if (!state?.running) return;
  state.running = false;
  state.paused = false;
  pauseButton.textContent = "Pause";
  pauseMenu.hidden = true;
  overlay.hidden = false;
  startButton.textContent = "Start";
  activeMenuTab = "run";
  setOverlay("Choose your benchmark.", "Run quit. Pick a benchmark, tune your model, and go again.", true);
  renderMenus();
  paintIdle();
}

function awardRun() {
  const mission = state.mission;
  const difficulty = getDifficulty();
  const finalScore = Math.floor(state.score);
  const oldBest = profile.best[mission.id] || 0;
  const completed = finalScore >= targetScore(mission);
  const objectiveComplete = state.stats.objectiveComplete;
  const contractComplete = state.contractComplete;
  const perfect = finalScore > 500 && state.stats.hits === 0 && state.stats.missed === 0;
  const baseEarned = Math.max(1, Math.floor(finalScore / 650)) + (completed ? 4 : 0) + (objectiveComplete ? 3 : 0) + (contractComplete ? 2 : 0) + state.stats.systemEvents + (perfect ? 2 : 0) + (finalScore > oldBest ? 2 : 0) + (getCore().id === "sprinter" ? 1 : 0);
  const earned = Math.max(1, Math.ceil(baseEarned * difficulty.reward));
  const core = getCore();
  const baseMasteryXp = Math.max(5, Math.floor(finalScore / 120)) + (completed ? 8 : 0) + (objectiveComplete ? 8 : 0) + (perfect ? 10 : 0);
  const masteryXp = Math.ceil(baseMasteryXp * difficulty.xp);
  const oldLevel = coreLevel(core.id);
  profile.coreXp[core.id] = coreXp(core.id) + masteryXp;
  const newLevel = coreLevel(core.id);
  if (newLevel > oldLevel) addPopup(`${core.name} L${newLevel}`, W / 2, H * 0.46, "#78e3ff", 30);
  if (newLevel >= 3) unlockBadge("mastery");
  const historyEntry = {
    mission: mission.name,
    difficulty: difficulty.name,
    score: finalScore,
    earned,
    masteryXp,
    objective: objectiveComplete,
    contract: contractComplete,
    incidents: state.stats.systemEvents,
    perfect,
    daily: mission.id === "daily",
    date: todayKey()
  };
  profile.credits += earned;
  profile.runs += 1;
  profile.best[mission.id] = Math.max(oldBest, finalScore);
  profile.history = [historyEntry, ...profile.history].slice(0, 5);
  const contract = state.contract;
  const priorContract = profile.contracts[contract.key] || { best: 0, cleared: false };
  profile.contracts[contract.key] = {
    best: Math.max(priorContract.best || 0, contractProgress()),
    cleared: Boolean(priorContract.cleared || contractComplete)
  };
  unlockBadge("firstRun");
  if (objectiveComplete) unlockBadge("objective");
  if (perfect) unlockBadge("perfect");
  if (mission.id === "daily") {
    const prior = profile.daily[mission.dailyKey] || { best: 0, cleared: false, runs: 0 };
    profile.daily[mission.dailyKey] = {
      best: Math.max(prior.best || 0, finalScore),
      cleared: Boolean(prior.cleared || completed || objectiveComplete),
      runs: (prior.runs || 0) + 1
    };
    if (completed || objectiveComplete) unlockBadge("daily");
  }
  saveProfile();
  return { earned, completed, finalScore, objectiveComplete, contractComplete, perfect, masteryXp, difficulty: difficulty.name };
}

function endGame() {
  state.running = false;
  state.over = true;
  const result = awardRun();
  overlay.hidden = false;
  startButton.textContent = "Restart";
  activeMenuTab = "run";
  setOverlay(
    result.completed ? "Benchmark passed." : "Benchmark complete.",
    `Score ${result.finalScore}. Earned ${result.earned} data. ${result.perfect ? "Perfect route" : result.objectiveComplete ? "Objective cleared" : state.mission.objective.label}.`,
    true
  );
  showRunSummary(result);
  renderMenus();
}

function moveLane(delta) {
  if (!state?.running || state.paused) return;
  player.lane = Math.max(0, Math.min(2, player.lane + delta));
}

function setLaneFromX(x) {
  if (!state?.running || state.paused) return;
  player.lane = x < canvas.clientWidth / 3 ? 0 : x > (canvas.clientWidth * 2) / 3 ? 2 : 1;
}

function weightedKind() {
  const mission = getMission();
  const difficulty = getDifficulty();
  const focus = mission.focus;
  const event = state.systemEvent?.id;
  const goodBoost = event === "surge" ? 1.22 : 1;
  const auditBoost = event === "audit" ? 2.15 : 1;
  const hazardBoost = event === "redteam" || event === "mitigation" ? 1.28 : 1;
  const table = [
    ["signal", 48 * mission.rewardBias * goodBoost],
    ["context", (mission.id === "retrieval" ? 24 : 14) * auditBoost],
    ["guardrail", (6 + profile.upgrades.shield) * auditBoost],
    ["fineTune", (focus === "drift" ? 7 : 5) + profile.upgrades.slow],
    ["rag", (mission.id === "retrieval" ? 8 : 5) + profile.upgrades.magnet],
    ["bug", (focus === "bug" ? 18 : 13) * mission.hazardBias * difficulty.hazard * hazardBoost],
    ["drift", (focus === "drift" ? 16 : focus === "mixed" ? 11 : 8) * mission.hazardBias * difficulty.hazard * hazardBoost],
    ["injection", (focus === "injection" ? 15 : focus === "mixed" ? 9 : 6) * mission.hazardBias * difficulty.hazard * hazardBoost]
  ];
  const total = table.reduce((sum, item) => sum + item[1], 0);
  let roll = state.rng() * total;
  for (const [kind, weight] of table) {
    roll -= weight;
    if (roll <= 0) return kind;
  }
  return "signal";
}

function spawnItem() {
  const kind = weightedKind();
  showTip(kind);
  state.stats.spawned += 1;
  items.push({
    kind,
    lane: Math.floor(state.rng() * 3),
    y: -50,
    spin: state.rng() * Math.PI,
    speed: 230 + state.level * 30 + state.rng() * 70
  });
}

function spawnSpecificItem(kind, lane) {
  showTip(kind);
  state.stats.spawned += 1;
  items.push({
    kind,
    lane,
    y: -50,
    spin: state.rng() * Math.PI,
    speed: 245 + state.level * 24
  });
}

function spawnTutorialItem() {
  const step = tutorialSteps[state.tutorial.index];
  spawnSpecificItem(step.kind, step.lane);
  showHint(step.hint, 2.6);
  state.tutorial.index += 1;
  if (state.tutorial.index >= tutorialSteps.length) {
    state.tutorial.active = false;
    profile.tutorialDone = true;
    saveProfile();
  }
}

function burst(x, y, color, amount = 14) {
  for (let i = 0; i < amount; i += 1) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 260,
      vy: (Math.random() - 0.5) * 260,
      life: 0.5 + Math.random() * 0.35,
      color
    });
  }
}

function collect(item) {
  const def = types[item.kind];
  if (def.good) {
    state.streak += 1;
    state.stats.collected += 1;
    state.stats.maxStreak = Math.max(state.stats.maxStreak, state.streak);
    state.stats.lanes[item.lane] = true;
    if (item.kind === "context" || item.kind === "rag") state.stats.retrieval += 1;
    if (state.stats.lastCollectLane !== null && state.stats.lastCollectLane !== item.lane) {
      state.stats.routeChain += 1;
      state.stats.maxRouteChain = Math.max(state.stats.maxRouteChain, state.stats.routeChain);
      const routeBonus = Math.min(150, 25 * state.stats.routeChain);
      state.score += routeBonus;
      addPopup(`ROUTE +${routeBonus}`, lanes[item.lane], player.y - 126, "#78e3ff", 26);
      if (state.stats.maxRouteChain >= 5) unlockBadge("route");
    } else if (state.stats.lastCollectLane === item.lane) {
      state.stats.routeChain = 0;
    }
    state.stats.lastCollectLane = item.lane;
    const points = def.points + state.streak * 12;
    state.score += points;
    addPopup(`+${points}`, lanes[item.lane], player.y - 82, def.color);
    if (state.streak > 0 && state.streak % 5 === 0) {
      addPopup(`${state.streak}x COMBO`, W / 2, player.y - 170, "#ffc45c", 34);
      playTone(660 + state.streak * 8, 0.08, "square", 0.03);
    } else {
      playTone(420 + Math.min(state.streak, 12) * 18, 0.07, "triangle", 0.03);
    }
    if (item.kind === "context") player.shield = Math.min(maxShield(), player.shield + 1);
    if (item.kind === "guardrail") {
      items = items.filter((other) => {
        const cleared = types[other.kind].bad && Math.round(other.lane) === player.lane;
        if (cleared) {
          state.stats.blocked += 1;
          updateSystemEventProgress("block", other.kind);
          burst(lanes[Math.round(other.lane)], other.y, "#f1f7fa", 10);
        }
        return !cleared;
      });
    }
    if (item.kind === "guardrail" || item.kind === "fineTune" || item.kind === "rag") state.stats.powerups += 1;
    if (item.kind === "fineTune") player.slow = 4 + profile.upgrades.slow * 1.5;
    if (item.kind === "rag") player.magnet = 5 + profile.upgrades.magnet * 1.4 + (player.core.id === "retriever" ? 2.2 : 0);
    burst(lanes[item.lane], player.y, def.color);
    vibrate(8);
    updateObjective();
    updateContract();
    updateSystemEventLane(item.lane);
    updateSystemEventProgress("good", item.kind);
  } else if (player.shield > 0) {
    player.shield -= 1;
    state.score += 35;
    state.stats.blocked += 1;
    addPopup("BLOCKED", lanes[item.lane], player.y - 84, "#49d6d2", 30);
    burst(lanes[item.lane], player.y, "#49d6d2", 18);
    playTone(260, 0.08, "sawtooth", 0.025);
    vibrate(18);
    updateContract();
    updateSystemEventProgress("block", item.kind);
  } else {
    state.streak = 0;
    state.lives -= 1;
    state.stats.hits += 1;
    state.shake = profile.reduceMotion ? 0 : 0.35;
    state.flash = profile.reduceMotion ? 0 : 0.28;
    addPopup("MODEL HIT", lanes[item.lane], player.y - 84, def.color, 32);
    burst(lanes[item.lane], player.y, def.color, 24);
    playTone(110, 0.16, "sawtooth", 0.052);
    vibrate([25, 20, 25]);
    if (state.systemEvent?.id === "redteam") expireSystemEvent(true);
    if (state.lives <= 0) endGame();
  }
  syncHud();
}

function update(dt) {
  if (!state?.running || state.paused) return;
  state.time += dt;
  state.level = 1 + Math.floor(state.time / 18);
  state.score += dt * ((player.core.id === "sprinter" ? 9 : 6) + state.level);
  state.shake = Math.max(0, state.shake - dt);
  state.flash = Math.max(0, state.flash - dt);
  state.hintTime = Math.max(0, state.hintTime - dt);
  player.slow = Math.max(0, player.slow - dt);
  player.magnet = Math.max(0, player.magnet - dt);
  updateObjective();
  updateContract();

  if (!state.systemEvent && state.time >= state.nextSystemEvent) startSystemEvent();
  if (state.systemEvent) {
    if (state.systemEvent.id === "redteam") {
      state.systemEvent.progress = Math.min(state.systemEvent.goal, Math.floor(state.time - state.systemEvent.startedAt));
    }
    if (state.systemEvent.progress >= state.systemEvent.goal) {
      completeSystemEvent();
    } else if (state.time >= state.systemEvent.expiresAt) {
      expireSystemEvent(false);
    }
  }

  if (!state.completed && state.score >= targetScore(state.mission)) {
    state.completed = true;
    state.lives += 1;
    burst(W / 2, H * 0.22, "#8be46d", 34);
    addPopup("BENCHMARK PASSED", W / 2, H * 0.28, "#8be46d", 34);
    showHint("Target passed. Extra life granted.");
    playTone(523, 0.09, "triangle");
    playTone(784, 0.16, "triangle", 0.038);
  }

  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    if (state.tutorial.active) {
      spawnTutorialItem();
      spawnTimer = 1.3;
    } else {
      spawnItem();
      spawnTimer = Math.max(0.24, state.mission.spawnGap * getDifficulty().spawn - state.level * 0.045);
    }
  }

  player.x += (lanes[player.lane] - player.x) * Math.min(1, dt * 14);

  for (const star of stars) {
    star.y += star.s * dt;
    if (star.y > H) {
      star.y = -6;
      star.x = Math.random() * W;
    }
  }

  for (const item of items) {
    if (player.magnet > 0 && types[item.kind].good && Math.abs(item.y - player.y) < 300) {
      item.lane += (player.lane - item.lane) * Math.min(1, dt * 2.7);
    }
    const slowFactor = player.slow > 0 && types[item.kind].bad ? 0.55 : 1;
    item.y += item.speed * slowFactor * dt;
    item.spin += dt * 4;

    const itemLane = Math.round(item.lane);
    const isNearMiss = types[item.kind].bad && !item.nearMissed && item.y > player.y + 70 && item.y < player.y + 126 && Math.abs(itemLane - player.lane) === 1;
    if (isNearMiss) {
      item.nearMissed = true;
      state.stats.nearMisses += 1;
      state.score += 45;
      addPopup("NEAR MISS +45", lanes[itemLane], player.y - 118, "#ffc45c", 26);
      updateContract();
      if (state.stats.nearMisses % 3 === 0) {
        player.shield = Math.min(maxShield() + 1, player.shield + 1);
        addPopup("FOCUS GUARD", player.x, player.y - 170, "#49d6d2", 28);
        unlockBadge("focus");
      }
      playTone(740, 0.06, "triangle", 0.025);
    }
  }

  for (let i = items.length - 1; i >= 0; i -= 1) {
    const item = items[i];
    const itemLane = Math.round(item.lane);
    const caught = itemLane === player.lane && Math.abs(item.y - player.y) < 68;
    if (caught) {
      items.splice(i, 1);
      collect({ ...item, lane: itemLane });
    } else if (item.y > H + 80) {
      if (types[item.kind].good) {
        state.streak = 0;
        state.stats.missed += 1;
      }
      items.splice(i, 1);
      syncHud();
    }
  }

  particles = particles.filter((p) => {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 160 * dt;
    return p.life > 0;
  });

  popups = popups.filter((popup) => {
    popup.life -= dt;
    popup.y += popup.vy * dt;
    return popup.life > 0;
  });

  syncHud();
}

function drawBackground() {
  ctx.fillStyle = "#09131c";
  ctx.fillRect(0, 0, W, H);

  if (state?.systemEvent) {
    const pulse = 0.08 + Math.sin(state.time * 5) * 0.025;
    ctx.fillStyle = state.systemEvent.id === "redteam" || state.systemEvent.id === "mitigation"
      ? `rgba(255,95,145,${pulse})`
      : `rgba(120,227,255,${pulse})`;
    ctx.fillRect(0, 0, W, H);
  }

  for (const star of stars) {
    ctx.globalAlpha = 0.34;
    ctx.fillStyle = "#eff8fb";
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "rgba(255,255,255,0.09)";
  ctx.lineWidth = 2;
  for (const x of lanes) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  for (let y = ((state?.time || 0) * 120) % 90; y < H; y += 90) {
    ctx.strokeStyle = "rgba(73,214,210,0.12)";
    ctx.beginPath();
    ctx.moveTo(52, y);
    ctx.lineTo(W - 52, y + 28);
    ctx.stroke();
  }
}

function drawPolygon(sides, radius) {
  ctx.beginPath();
  for (let i = 0; i < sides; i += 1) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * i) / sides;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawItem(item) {
  const def = types[item.kind];
  const roundedLane = Math.round(item.lane);
  const x = lanes[roundedLane] + (item.lane - roundedLane) * 116;
  const pulse = profile.reduceMotion ? 0 : Math.sin((state?.time || 0) * 8 + item.spin) * 3;
  ctx.save();
  ctx.translate(x, item.y);
  ctx.rotate(item.spin);
  ctx.fillStyle = def.color;
  ctx.strokeStyle = "rgba(255,255,255,0.74)";
  ctx.lineWidth = 5;
  if (def.shape === "hex") {
    drawPolygon(6, 35 + pulse);
  } else if (def.shape === "shield") {
    ctx.beginPath();
    ctx.moveTo(0, -40 - pulse);
    ctx.lineTo(34, -20);
    ctx.lineTo(24, 32 + pulse);
    ctx.lineTo(0, 44 + pulse);
    ctx.lineTo(-24, 32 + pulse);
    ctx.lineTo(-34, -20);
    ctx.closePath();
  } else if (def.shape === "diamond") {
    drawPolygon(4, 39 + pulse);
  } else if (def.shape === "ring") {
    ctx.beginPath();
    ctx.arc(0, 0, 37 + pulse, 0, Math.PI * 2);
  } else if (def.shape === "triangle") {
    drawPolygon(3, 39 + pulse);
  } else if (def.shape === "slash") {
    ctx.beginPath();
    ctx.roundRect(-34, -28, 68, 56, 10);
  } else if (def.shape === "square") {
    ctx.beginPath();
    ctx.roundRect(-31, -31, 62, 62, 8);
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, 34 + pulse, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.stroke();
  if (def.shape === "ring") {
    ctx.strokeStyle = "#071018";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, 0, 17, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (def.shape === "slash") {
    ctx.strokeStyle = "#071018";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-22, 22);
    ctx.lineTo(22, -22);
    ctx.stroke();
  }
  ctx.rotate(-item.spin);
  ctx.fillStyle = item.kind === "drift" ? "#1d1410" : "#071018";
  ctx.font = "900 34px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(def.label, 0, 1);
  ctx.restore();
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);

  if (player.magnet > 0) {
    ctx.strokeStyle = "rgba(120,227,255,0.3)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 150, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (player.shield > 0) {
    ctx.strokeStyle = "rgba(73,214,210,0.78)";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, 66 + player.shield * 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  const body = ctx.createLinearGradient(-55, -55, 60, 60);
  body.addColorStop(0, player.core.colors[0]);
  body.addColorStop(0.58, player.core.colors[1]);
  body.addColorStop(1, player.core.colors[2]);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.roundRect(-56, -56, 112, 112, 24);
  ctx.fill();

  ctx.fillStyle = "#071018";
  ctx.font = "900 36px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("AI", 0, -2);

  ctx.strokeStyle = "rgba(7,16,24,0.56)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-28, 34);
  ctx.lineTo(28, 34);
  ctx.stroke();
  ctx.restore();
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life * 1.7);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPopups() {
  for (const popup of popups) {
    ctx.globalAlpha = Math.max(0, popup.life / 0.85);
    ctx.fillStyle = popup.color;
    ctx.font = `900 ${popup.size}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(popup.text, popup.x, popup.y);
  }
  ctx.globalAlpha = 1;
}

function drawWrappedText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let offset = 0;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, y + offset);
      line = word;
      offset += lineHeight;
    } else {
      line = next;
    }
  }
  ctx.fillText(line, x, y + offset);
}

function drawRunStatus() {
  if (!state?.running) return;
  const mission = state.mission;
  const progress = Math.min(1, state.score / targetScore(mission));
  ctx.fillStyle = "rgba(7,16,24,0.58)";
  ctx.fillRect(40, 28, W - 80, state.systemEvent ? 156 : 126);
  ctx.fillStyle = "#eff8fb";
  ctx.font = "800 24px system-ui";
  ctx.textAlign = "left";
  ctx.fillText(mission.name, 64, 62);
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fillRect(64, 78, W - 128, 10);
  ctx.fillStyle = state.completed ? "#8be46d" : "#49d6d2";
  ctx.fillRect(64, 78, (W - 128) * progress, 10);
  ctx.fillStyle = "#95a9b3";
  ctx.font = "700 18px system-ui";
  const effects = [];
  if (player.shield > 0) effects.push(`guard ${player.shield}`);
  if (player.magnet > 0) effects.push("rag");
  if (player.slow > 0) effects.push("tune");
  effects.push(getDifficulty().name.toLowerCase());
  ctx.fillText(effects.join("  ") || "stable", 64, 98);
  ctx.textAlign = "left";
  ctx.fillStyle = state.stats.objectiveComplete ? "#ffc45c" : "#95a9b3";
  ctx.fillText(`${objectiveProgress()}/${mission.objective.goal} ${mission.objective.label}`, 64, 120);
  ctx.fillStyle = state.contractComplete ? "#78e3ff" : "#95a9b3";
  ctx.fillText(`${contractProgress()}/${state.contract.goal} Contract: ${state.contract.label}`, 64, 142);
  if (state.systemEvent) {
    ctx.fillStyle = "#ffc45c";
    ctx.fillText(`${state.systemEvent.progress}/${state.systemEvent.goal} ${state.systemEvent.name}: ${state.systemEvent.brief}`, 64, 164);
  }
}

function drawHint() {
  if (!state?.running || state.hintTime <= 0) return;
  const alpha = Math.min(1, state.hintTime / 0.35);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(7,16,24,0.76)";
  ctx.fillRect(56, H - 292, W - 112, 82);
  ctx.strokeStyle = "rgba(73,214,210,0.42)";
  ctx.lineWidth = 2;
  ctx.strokeRect(56, H - 292, W - 112, 82);
  ctx.fillStyle = "#eff8fb";
  ctx.font = "800 21px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  drawWrappedText(state.hint, W / 2, H - 263, W - 152, 24);
  ctx.globalAlpha = 1;
}

function drawFlash() {
  if (!state?.flash) return;
  ctx.globalAlpha = Math.min(0.38, state.flash * 1.3);
  ctx.fillStyle = "#ff5f91";
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
}

function render() {
  ctx.save();
  if (state?.shake > 0) {
    const amount = state.shake * 22;
    ctx.translate((Math.random() - 0.5) * amount, (Math.random() - 0.5) * amount);
  }
  drawBackground();
  for (const item of items) drawItem(item);
  drawPlayer();
  drawParticles();
  drawPopups();
  ctx.restore();
  drawRunStatus();
  drawHint();
  drawFlash();

  if (state?.paused) {
    ctx.fillStyle = "rgba(7,16,24,0.58)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#eff8fb";
    ctx.font = "900 62px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Paused", W / 2, H / 2);
  }
}

function paintIdle() {
  drawBackground();
  drawPlayer();
}

function loop(time) {
  const dt = Math.min(0.033, (time - lastTime) / 1000 || 0);
  lastTime = time;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

startButton.addEventListener("click", startGame);
soundButton.addEventListener("click", () => {
  profile.sound = !profile.sound;
  saveProfile();
  soundButton.textContent = profile.sound ? "Sound on" : "Sound off";
  renderMenus();
  ensureAudio();
  playTone(profile.sound ? 620 : 220, 0.1, "triangle");
});

resetButton.addEventListener("click", () => {
  const answer = window.prompt("This deletes runs, upgrades, cores, badges, and history. Type RESET to continue.");
  if (answer !== "RESET") return;
  const settings = {
    sound: profile.sound,
    haptics: profile.haptics,
    reduceMotion: profile.reduceMotion,
    difficulty: profile.difficulty
  };
  profile = blankProfile(settings);
  selectedMission = profile.selectedMission;
  saveProfile();
  startButton.textContent = "Start";
  activeMenuTab = "run";
  setOverlay("Choose your benchmark.", "Progress reset. Pick a benchmark and start fresh.", true);
  renderMenus();
  resetGame();
  state.running = false;
  paintIdle();
});

installButton.addEventListener("click", async () => {
  if (!installPromptEvent) return;
  installPromptEvent.prompt();
  await installPromptEvent.userChoice.catch(() => null);
  installPromptEvent = null;
  renderMenus();
});

exportButton.addEventListener("click", exportProfile);

importButton.addEventListener("click", () => importInput.click());

importInput.addEventListener("change", () => {
  const file = importInput.files?.[0];
  importInput.value = "";
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const imported = normalizeImportedProfile(JSON.parse(String(reader.result)));
      const answer = window.prompt("Importing replaces your current save. Type IMPORT to continue.");
      if (answer !== "IMPORT") return;
      profile = imported;
      selectedMission = profile.selectedMission;
      saveProfile();
      startButton.textContent = "Start";
      activeMenuTab = "run";
      setOverlay("Choose your benchmark.", "Save imported. Pick a benchmark and continue.", true);
      renderMenus();
      resetGame();
      state.running = false;
      paintIdle();
    } catch (error) {
      window.alert(`Import failed: ${error.message}`);
    }
  });
  reader.readAsText(file);
});

for (const button of menuTabButtons) {
  button.addEventListener("click", () => setMenuTab(button.dataset.tab));
}

pauseButton.addEventListener("click", () => {
  if (!state?.running) return;
  if (state.paused) resumeGame();
  else pauseGame();
});

resumeButton.addEventListener("click", resumeGame);
restartButton.addEventListener("click", startGame);
quitButton.addEventListener("click", quitRun);

document.querySelectorAll(".lane-button").forEach((button) => {
  button.addEventListener("click", () => moveLane(Number(button.dataset.lane)));
});

canvas.addEventListener("pointerdown", (event) => {
  swipeStart = { x: event.clientX, y: event.clientY };
});

canvas.addEventListener("pointerup", (event) => {
  if (!swipeStart) return;
  const dx = event.clientX - swipeStart.x;
  if (Math.abs(dx) > 36) moveLane(dx > 0 ? 1 : -1);
  else setLaneFromX(event.offsetX);
  swipeStart = null;
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") moveLane(-1);
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") moveLane(1);
  if (event.key === " " && state?.running) pauseButton.click();
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPromptEvent = event;
  renderMenus();
});

window.addEventListener("appinstalled", () => {
  installPromptEvent = null;
  installText.textContent = "Installed. Offline runs are ready after the next cached load.";
  renderMenus();
});

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

profile = loadProfile();
selectedMission = profile.selectedMission;
resetGame();
state.running = false;
setOverlay("Choose your benchmark.", "Earn data from runs, buy upgrades, and push each AI mode past its target score.", true);
renderMenus();
paintIdle();
requestAnimationFrame(loop);
