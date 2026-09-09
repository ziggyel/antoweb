const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const TYPE_SPEED = 35;

const state = {
  screen: "loading",
  visited: new Set(),
  rolled: false,
  dialogueBusy: false,
  audioOn: false,
  audio: null,
};

const screens = {
  character: $("#character-screen"),
  thought: $("#thought-screen"),
  dialogue: $("#dialogue-screen"),
  final: $("#final-screen"),
  success: $("#success-screen"),
};

const screenUi = {
  character: { objective: "Reconstruir la identidad", location: "Archivo — selección de perfil" },
  thought: { objective: "Internalizar el patrón", location: "Gabinete de pensamientos" },
  dialogue: { objective: "Seguir la señal hasta su origen", location: "Interior — la sala" },
  final: { objective: "Responder la única pregunta restante", location: "Interior — a centímetros" },
  success: { objective: "Caminar hacia lo que sigue", location: "Caso cerrado" },
};

const orbThoughts = {
  logic: {
    voice: "LÓGICA",
    text: "Dato: El ritmo cardíaco de la persona a tu lado aumentó cuando se sentaron juntas.",
  },
  inland: {
    voice: "IMPERIO INTERIOR",
    text: "La luz del televisor parpadea en un código morse que solo ustedes dos entienden.",
  },
};

const introLines = [
  {
    voice: "NARRADOR",
    cls: "narrator",
    text: "La investigación no te lleva a las ruinas de Revachol. Te devuelve exactamente a las coordenadas físicas de esta sala."
  },
  {
    voice: "ESCALOFRÍOS [Éxito]",
    cls: "shivers",
    text: "El aire en la habitación es denso. Un sillón verde acolchado sostiene el peso de dos cuerpos. De fondo, la luz azulada e hipnótica del televisor parpadea como un faro extinto. A tus pies, un perro y un gato descansan en un equilibrio casi milagroso. Al otro lado del cristal, los motores de los autos se deslizan en la noche, llevando a extraños hacia ninguna parte."
  },
  {
    voice: "IMPERIO INTERIOR",
    cls: "inland",
    text: "Hay una simetría extraña en todo esto. El universo se desmorona afuera a una velocidad constante, pero dentro de este radio de unos pocos metros cuadrados, la materia se niega a enfriarse."
  }
];

const choices = [
  {
    id: "person",
    label: "Observar a la persona sentada a mi lado en el sillón.",
    lines: [
      {
        voice: "NARRADOR",
        cls: "narrator",
        text: "Está a centímetros de ti. No hay discursos ensayados ni retórica grandilocuente; solo la gravedad silenciosa de alguien que ha decidido que, entre todas las combinaciones de palabras y de vidas posibles, esta es la única que importa."
      },
      {
        voice: "ELECTROQUÍMICA",
        cls: "electro",
        text: "Un impacto eléctrico sordo en el esternón. Tu pulso reconoce la frecuencia sin necesidad de explicaciones."
      }
    ]
  },
  {
    id: "traffic",
    label: "Escuchar el murmullo del tráfico al otro lado de la ventana.",
    lines: [
      {
        voice: "NARRADOR",
        cls: "narrator",
        text: "Los autos pasan, cortando la penumbra con sus faros. Llevan prisa, huyendo del invierno y del tiempo. Pero aquí dentro, el sonido se amortigua. Hay un peso sereno en el aire."
      },
      {
        voice: "PERCEPCIÓN [Oído]",
        cls: "perception",
        text: "El eco lejano del tráfico solo acentúa la solidez de lo que ocurre dentro de estas cuatro paredes."
      }
    ]
  },
  {
    id: "notes",
    label: "Examinar las notas acumuladas en el archivo.",
    lines: [
      {
        voice: "NARRADOR",
        cls: "narrator",
        text: "Rutas compartidas, gestos mínimos, fechas anotadas sin orden aparente. No es un inventario de hechos; es una prueba de resistencia contra el olvido."
      },
      {
        voice: "RETÓRICA",
        cls: "rhetoric",
        text: "Incontestable. La estructura argumental de esta recopilación concluye que la soledad ha sido derrotada."
      }
    ]
  }
];

const consolidation = {
  voice: "NARRADOR",
  cls: "narrator",
  text: "Las ramificaciones del diálogo se contraen hasta un único punto de masa crítica. El murmullo del tráfico afuera parece perder volumen, suspendido en una inercia donde el aire se vuelve denso y el tiempo deja de avanzar a su ritmo habitual. Todo el ruido de fondo se reduce a la tensión tranquila de este instante."
};

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, element]) => {
    element.classList.toggle("is-hidden", key !== name);
  });
  state.screen = name;
  $("#bark")?.classList.remove("is-visible");
  $("#bark")?.setAttribute("aria-hidden", "true");
  if (name !== "dialogue") closeOrbModal();
  if (screenUi[name]) {
    const objective = $("#objective-text");
    const location = $("#case-location");
    if (objective) objective.textContent = screenUi[name].objective;
    if (location) location.textContent = screenUi[name].location;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function revealGameChrome() {
  $("#hud").classList.remove("is-hidden");
  $("#cassette").classList.remove("is-hidden");
  $("#case-meta")?.classList.remove("is-hidden");
  $("#objective-strip")?.classList.remove("is-hidden");
  $("#screen-mark")?.classList.remove("is-hidden");
}

function triggerWillpower() {
  const toast = $("#willpower-toast");
  toast.classList.remove("is-visible");
  void toast.offsetWidth;
  toast.classList.add("is-visible");
}

async function typeText(element, text, speed = TYPE_SPEED) {
  element.textContent = "";
  for (let i = 0; i < text.length; i += 1) {
    element.textContent += text[i];
    if (i % 8 === 0 || i === text.length - 1) {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    await wait(speed);
  }
}

async function appendDialogue(line) {
  const entry = document.createElement("article");
  entry.className = `dialogue-entry ${line.cls || "narrator"}`;

  const voice = document.createElement("span");
  voice.className = "voice";
  voice.textContent = line.voice;

  const p = document.createElement("p");
  p.setAttribute("aria-label", line.text);

  entry.append(voice, p);
  $("#dialogue-log").appendChild(entry);
  entry.scrollIntoView({ behavior: "smooth", block: "nearest" });

  await typeText(p, line.text);
  return entry;
}

function renderChoices() {
  const container = $("#dialogue-options");
  container.innerHTML = "";

  choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `dialogue-choice ${state.visited.has(choice.id) ? "visited" : ""}`;
    button.dataset.choice = choice.id;
    button.disabled = state.dialogueBusy;

    const number = document.createElement("span");
    number.textContent = `${index + 1}.`;
    const label = document.createElement("b");
    label.style.fontWeight = "400";
    label.textContent = choice.label;
    button.append(number, label);

    button.addEventListener("click", () => chooseDialogue(choice));
    container.appendChild(button);
  });
}

async function chooseDialogue(choice) {
  if (state.dialogueBusy) return;
  if (state.visited.has(choice.id)) {
    triggerWillpower();
    return;
  }

  state.dialogueBusy = true;
  state.visited.add(choice.id);
  renderChoices();

  for (const line of choice.lines) {
    await appendDialogue(line);
    await wait(260);
  }

  state.dialogueBusy = false;

  if (state.visited.size === choices.length) {
    $("#dialogue-options").innerHTML = "";
    await wait(440);
    await appendDialogue(consolidation);
    await wait(520);
    $("#skill-check").classList.remove("is-hidden");
    $("#skill-check").scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    renderChoices();
  }
}

async function startDialogue() {
  $("#dialogue-log").innerHTML = "";
  $("#dialogue-options").innerHTML = "";
  $("#skill-check").classList.add("is-hidden");
  state.visited.clear();
  state.rolled = false;
  state.dialogueBusy = true;

  await wait(220);
  for (const line of introLines) {
    await appendDialogue(line);
    await wait(300);
  }

  state.dialogueBusy = false;
  renderChoices();
}

async function rollDice() {
  if (state.rolled) return;
  state.rolled = true;
  const button = $("#roll-btn");
  const dice = $$(".dice-pair i", button);
  const pair = $(".dice-pair", button);
  button.disabled = true;
  pair.classList.add("rolling");
  $("#roll-result").textContent = "La posibilidad gira sobre sí misma...";

  let ticks = 0;
  const interval = setInterval(() => {
    dice.forEach(die => die.textContent = String(Math.floor(Math.random() * 6) + 1));
    ticks += 1;
    if (ticks > 14) {
      clearInterval(interval);
      pair.classList.remove("rolling");
      dice[0].textContent = "6";
      dice[1].textContent = "6";
      $("#roll-result").textContent = "[ÉXITO — 100%] El mundo, por una vez, no discute la conclusión.";
      setTimeout(() => showScreen("final"), 1700);
    }
  }, 90);
}

function openRecord() {
  $("#record-panel").classList.add("is-open");
  $("#record-backdrop").classList.add("is-open");
  $("#record-panel").setAttribute("aria-hidden", "false");
  $("#record-btn").setAttribute("aria-expanded", "true");
}

function closeRecord() {
  $("#record-panel").classList.remove("is-open");
  $("#record-backdrop").classList.remove("is-open");
  $("#record-panel").setAttribute("aria-hidden", "true");
  $("#record-btn").setAttribute("aria-expanded", "false");
}

function openOrbModal(key) {
  const thought = orbThoughts[key];
  const modal = $("#orb-modal");
  if (!thought || !modal) return;

  modal.dataset.tone = key;
  $("#orb-modal-voice").textContent = thought.voice;
  $("#orb-modal-text").textContent = thought.text;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  setTimeout(() => $("#orb-modal-close")?.focus({ preventScroll: true }), 20);
}

function closeOrbModal() {
  const modal = $("#orb-modal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function setupBarks() {
  const bark = $("#bark");
  if (!bark) return;

  let activeTarget = null;
  let barkTimer = null;

  const placeBark = target => {
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const x = Math.min(window.innerWidth - 18, Math.max(18, rect.left + rect.width / 2));
    const y = Math.max(44, rect.top);
    bark.style.left = `${x}px`;
    bark.style.top = `${y}px`;
  };

  const showBark = target => {
    const text = target.dataset.bark;
    if (!text) return;
    activeTarget = target;
    bark.textContent = text;
    bark.setAttribute("aria-hidden", "false");
    placeBark(target);
    bark.classList.add("is-visible");
    window.clearTimeout(barkTimer);
    barkTimer = window.setTimeout(() => hideBark(target), 1800);
  };

  const hideBark = target => {
    if (target && activeTarget !== target) return;
    window.clearTimeout(barkTimer);
    bark.classList.remove("is-visible");
    bark.setAttribute("aria-hidden", "true");
    activeTarget = null;
  };

  $$('[data-bark]').forEach(target => {
    target.addEventListener("pointerenter", () => showBark(target));
    target.addEventListener("pointerleave", () => hideBark(target));
    target.addEventListener("focusin", () => showBark(target));
    target.addEventListener("focusout", () => hideBark(target));
  });

  window.addEventListener("scroll", () => {
    if (activeTarget) placeBark(activeTarget);
  }, { passive: true });
  window.addEventListener("resize", () => {
    if (activeTarget) placeBark(activeTarget);
  });
}

function midiToHz(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function playCassetteClick(ctx) {
  // Chasquido puramente sintético: dos transitorios cortos, sin ruido blanco.
  const now = ctx.currentTime;
  const out = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 820;
  filter.Q.value = 0.9;
  out.gain.value = 0.38;
  filter.connect(out);
  out.connect(ctx.destination);

  const snap = ctx.createOscillator();
  const snapGain = ctx.createGain();
  snap.type = "square";
  snap.frequency.setValueAtTime(1200, now);
  snap.frequency.exponentialRampToValueAtTime(260, now + 0.026);
  snapGain.gain.setValueAtTime(0.0001, now);
  snapGain.gain.exponentialRampToValueAtTime(0.19, now + 0.002);
  snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);
  snap.connect(snapGain).connect(filter);
  snap.start(now);
  snap.stop(now + 0.05);

  const clunk = ctx.createOscillator();
  const clunkGain = ctx.createGain();
  clunk.type = "triangle";
  clunk.frequency.setValueAtTime(155, now + 0.018);
  clunk.frequency.exponentialRampToValueAtTime(86, now + 0.075);
  clunkGain.gain.setValueAtTime(0.0001, now + 0.018);
  clunkGain.gain.exponentialRampToValueAtTime(0.15, now + 0.024);
  clunkGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
  clunk.connect(clunkGain).connect(filter);
  clunk.start(now + 0.018);
  clunk.stop(now + 0.1);
}

function createAmbientAudio() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  const ctx = new AudioCtx();

  // Cadena principal: cálida, oscura y sin ninguna fuente de ruido blanco.
  const master = ctx.createGain();
  master.gain.value = 0.0001;

  const masterFilter = ctx.createBiquadFilter();
  masterFilter.type = "lowpass";
  masterFilter.frequency.value = 2300;
  masterFilter.Q.value = 0.45;

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -26;
  compressor.knee.value = 24;
  compressor.ratio.value = 2.2;
  compressor.attack.value = 0.08;
  compressor.release.value = 0.9;

  masterFilter.connect(compressor);
  compressor.connect(master);
  master.connect(ctx.destination);

  const dry = ctx.createGain();
  dry.gain.value = 0.82;
  dry.connect(masterFilter);

  // Eco corto para dar profundidad sin tapar las notas.
  const delay = ctx.createDelay(2.5);
  delay.delayTime.value = 0.46;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.29;
  const wet = ctx.createGain();
  wet.gain.value = 0.26;

  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wet);
  wet.connect(masterFilter);

  // Pad armónico sostenido.
  const padBus = ctx.createGain();
  padBus.gain.value = 0.26;
  padBus.connect(dry);
  padBus.connect(delay);

  const padFilter = ctx.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.value = 1050;
  padFilter.Q.value = 0.7;

  const padOut = ctx.createGain();
  padOut.gain.value = 0.6;
  padFilter.connect(padOut);
  padOut.connect(padBus);

  const padVoices = [0, 1, 2, 3].map((_, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = index % 2 === 0 ? "triangle" : "sine";
    osc.frequency.value = 110;
    osc.detune.value = [-7, 5, -3, 8][index];
    gain.gain.value = [0.22, 0.18, 0.16, 0.13][index];

    osc.connect(gain);
    gain.connect(padFilter);
    osc.start();
    return { osc, gain };
  });

  // Bajo muy suave para que se sienta como una pieza musical.
  const bass = ctx.createOscillator();
  const bassGain = ctx.createGain();
  bass.type = "sine";
  bass.frequency.value = midiToHz(38);
  bassGain.gain.value = 0.075;
  bass.connect(bassGain);
  bassGain.connect(dry);
  bass.start();

  // Movimiento mínimo en la afinación. No genera ruido: sólo hace respirar el pad.
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = "sine";
  lfo.frequency.value = 0.11;
  lfoGain.gain.value = 1.7;
  lfo.connect(lfoGain);
  padVoices.forEach(({ osc }) => lfoGain.connect(osc.detune));
  lfo.start();

  // Progresión original: Dm9 -> Bbmaj7 -> Fmaj7 -> Cadd9.
  const chords = [
    [50, 53, 57, 64],
    [46, 50, 53, 57],
    [53, 57, 60, 64],
    [48, 52, 55, 62],
  ];

  // Arpegio original para que la cinta se reconozca claramente como música.
  const patterns = [
    [62, 65, 69, 72, 69, 65],
    [58, 62, 65, 69, 65, 62],
    [65, 69, 72, 76, 72, 69],
    [60, 64, 67, 74, 67, 64],
  ];

  let chordIndex = 0;
  let step = 0;

  function setChord(notes, glide = 1.8) {
    const now = ctx.currentTime;
    notes.forEach((note, index) => {
      padVoices[index].osc.frequency.cancelScheduledValues(now);
      padVoices[index].osc.frequency.setTargetAtTime(midiToHz(note), now, glide);
    });
    bass.frequency.cancelScheduledValues(now);
    bass.frequency.setTargetAtTime(midiToHz(notes[0] - 12), now, glide + 0.25);
  }

  function playNote(note) {
    if (!state.audioOn) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = midiToHz(note);

    filter.type = "lowpass";
    filter.frequency.value = 1750;
    filter.Q.value = 0.6;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.075, now + 0.045);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dry);
    gain.connect(delay);

    osc.start(now);
    osc.stop(now + 2.05);
  }

  setChord(chords[0], 0.15);

  const arpTimer = window.setInterval(() => {
    const pattern = patterns[chordIndex];
    playNote(pattern[step % pattern.length]);
    step += 1;
  }, 1180);

  const chordTimer = window.setInterval(() => {
    chordIndex = (chordIndex + 1) % chords.length;
    step = 0;
    setChord(chords[chordIndex], 2.2);
  }, 7080);

  return { ctx, master, chordTimer, arpTimer };
}

async function toggleAudio() {
  if (!state.audio) state.audio = createAmbientAudio();
  if (!state.audio) return;

  if (state.audio.ctx.state === "suspended") {
    await state.audio.ctx.resume();
  }

  const turningOn = !state.audioOn;
  if (turningOn) playCassetteClick(state.audio.ctx);
  state.audioOn = turningOn;

  const now = state.audio.ctx.currentTime;
  const masterGain = state.audio.master.gain;
  masterGain.cancelScheduledValues(now);
  masterGain.setValueAtTime(Math.max(masterGain.value, 0.0001), now);
  masterGain.exponentialRampToValueAtTime(
    state.audioOn ? 0.46 : 0.0001,
    now + (state.audioOn ? 1.4 : 0.7)
  );

  $("#audio-toggle").setAttribute("aria-pressed", String(state.audioOn));
  $("#audio-toggle").setAttribute(
    "aria-label",
    state.audioOn ? "Pausar música ambiental" : "Reproducir música ambiental"
  );
  $("#audio-label").textContent = state.audioOn
    ? "Cinta 01 — nocturno cálido / señal estable"
    : "Cinta 01 — silencio";
}

function resetExperience() {
  closeRecord();
  closeOrbModal();
  state.visited.clear();
  state.rolled = false;
  state.dialogueBusy = false;
  $("#achievement").classList.remove("is-visible");
  $("#dialogue-log").innerHTML = "";
  $("#dialogue-options").innerHTML = "";
  $("#roll-result").textContent = "";
  $("#roll-btn").disabled = false;

  const internalize = $("#internalize-btn");
  internalize.disabled = false;
  internalize.textContent = "Internalizar pensamiento";
  $("#thought-solution").classList.add("is-obscured");
  $("#thought-continue").classList.add("is-hidden");
  $("#thought-status").textContent = "0% internalizado";
  $(".thought-progress i").style.width = "0%";

  const dice = $$(".dice-pair i");
  dice.forEach(d => d.textContent = "1");
  showScreen("character");
}

// Loading sequence
setTimeout(() => $("#enter-btn").classList.remove("is-hidden"), 3150);
$("#enter-btn").addEventListener("click", () => {
  $("#loading-screen").classList.add("is-gone");
  revealGameChrome();
  showScreen("character");
  setTimeout(() => $("#loading-screen").classList.add("is-hidden"), 950);
});

// Character selection
$$('[data-locked-character]').forEach(card => {
  card.addEventListener("click", () => triggerWillpower());
});

$("#antowoo-card").addEventListener("click", () => showScreen("thought"));

// Thought Cabinet
$("#internalize-btn").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  const bar = $(".thought-progress i");
  const status = $("#thought-status");
  let progress = 0;
  const timer = setInterval(() => {
    progress += 2;
    bar.style.width = `${progress}%`;
    status.textContent = `${progress}% internalizado`;
    if (progress >= 100) {
      clearInterval(timer);
      $("#thought-solution").classList.remove("is-obscured");
      $("#thought-continue").classList.remove("is-hidden");
      button.textContent = "Pensamiento internalizado";
    }
  }, 36);
});

$("#thought-continue").addEventListener("click", () => {
  showScreen("dialogue");
  startDialogue();
});

// Dialogue / check
$("#roll-btn").addEventListener("click", rollDice);
$$('[data-orb]').forEach(orb => {
  orb.addEventListener("click", () => openOrbModal(orb.dataset.orb));
});
$("#orb-modal-close").addEventListener("click", closeOrbModal);
$("#orb-modal-backdrop").addEventListener("click", closeOrbModal);

// Final question
$$(".final-choice").forEach(button => {
  button.addEventListener("click", () => {
    showScreen("success");
    setTimeout(() => $("#achievement").classList.add("is-visible"), 50);
  });
});
$("#doubt-btn").addEventListener("click", triggerWillpower);

// Global UI
$("#record-btn").addEventListener("click", openRecord);
$("#record-close").addEventListener("click", closeRecord);
$("#record-backdrop").addEventListener("click", closeRecord);
$("#exit-btn").addEventListener("click", triggerWillpower);
$("#audio-toggle").addEventListener("click", toggleAudio);
$("#restart-btn").addEventListener("click", resetExperience);
setupBarks();

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if ($("#orb-modal")?.classList.contains("is-open")) closeOrbModal();
    else if ($("#record-panel").classList.contains("is-open")) closeRecord();
    else if (state.screen !== "loading" && state.screen !== "success") triggerWillpower();
  }
});
