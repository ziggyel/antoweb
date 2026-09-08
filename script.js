const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  screen: "loading",
  visited: new Set(),
  rolled: false,
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

function showScreen(name) {
  Object.entries(screens).forEach(([key, element]) => {
    element.classList.toggle("is-hidden", key !== name);
  });
  state.screen = name;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function revealGameChrome() {
  $("#hud").classList.remove("is-hidden");
  $("#cassette").classList.remove("is-hidden");
}

function triggerWillpower() {
  const toast = $("#willpower-toast");
  toast.classList.remove("is-visible");
  void toast.offsetWidth;
  toast.classList.add("is-visible");
}

function appendDialogue(line) {
  const entry = document.createElement("article");
  entry.className = `dialogue-entry ${line.cls || "narrator"}`;
  const voice = document.createElement("span");
  voice.className = "voice";
  voice.textContent = line.voice;
  const p = document.createElement("p");
  p.textContent = line.text;
  entry.append(voice, p);
  $("#dialogue-log").appendChild(entry);
  entry.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderChoices() {
  const container = $("#dialogue-options");
  container.innerHTML = "";

  choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `dialogue-choice ${state.visited.has(choice.id) ? "visited" : ""}`;
    button.dataset.choice = choice.id;

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
  if (state.visited.has(choice.id)) {
    triggerWillpower();
    return;
  }

  state.visited.add(choice.id);
  renderChoices();

  for (const line of choice.lines) {
    appendDialogue(line);
    await wait(330);
  }

  if (state.visited.size === choices.length) {
    $("#dialogue-options").innerHTML = "";
    await wait(420);
    appendDialogue(consolidation);
    await wait(420);
    $("#skill-check").classList.remove("is-hidden");
    $("#skill-check").scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function startDialogue() {
  $("#dialogue-log").innerHTML = "";
  $("#skill-check").classList.add("is-hidden");
  state.visited.clear();
  state.rolled = false;
  introLines.forEach((line, i) => setTimeout(() => appendDialogue(line), 130 + (i * 430)));
  setTimeout(renderChoices, 1550);
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

function createAmbientAudio() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  const ctx = new AudioCtx();
  const master = ctx.createGain();
  master.gain.value = 0.0001;
  master.connect(ctx.destination);

  const hum = ctx.createOscillator();
  const humGain = ctx.createGain();
  hum.type = "sine";
  hum.frequency.value = 46;
  humGain.gain.value = 0.035;
  hum.connect(humGain).connect(master);
  hum.start();

  const distant = ctx.createOscillator();
  const distantGain = ctx.createGain();
  distant.type = "triangle";
  distant.frequency.value = 91;
  distantGain.gain.value = 0.012;
  distant.connect(distantGain).connect(master);
  distant.start();

  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 950;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.018;
  noise.connect(filter).connect(noiseGain).connect(master);
  noise.start();

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.075;
  lfoGain.gain.value = 0.008;
  lfo.connect(lfoGain).connect(distantGain.gain);
  lfo.start();

  return { ctx, master };
}

async function toggleAudio() {
  if (!state.audio) state.audio = createAmbientAudio();
  if (!state.audio) return;

  if (state.audio.ctx.state === "suspended") await state.audio.ctx.resume();

  state.audioOn = !state.audioOn;
  const now = state.audio.ctx.currentTime;
  state.audio.master.gain.cancelScheduledValues(now);
  state.audio.master.gain.setValueAtTime(Math.max(state.audio.master.gain.value, 0.0001), now);
  state.audio.master.gain.exponentialRampToValueAtTime(state.audioOn ? 0.72 : 0.0001, now + .8);

  $("#audio-toggle").setAttribute("aria-pressed", String(state.audioOn));
  $("#audio-toggle").setAttribute("aria-label", state.audioOn ? "Pausar ambiente" : "Reproducir ambiente");
  $("#audio-label").textContent = state.audioOn ? "Cinta 01 — habitación / tráfico" : "Cinta 01 — silencio";
}

function resetExperience() {
  closeRecord();
  state.visited.clear();
  state.rolled = false;
  $("#achievement").classList.remove("is-visible");
  $("#dialogue-log").innerHTML = "";
  $("#dialogue-options").innerHTML = "";
  $("#roll-result").textContent = "";
  $("#roll-btn").disabled = false;
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

// Final question
$$('.final-choice').forEach(button => {
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

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if ($("#record-panel").classList.contains("is-open")) closeRecord();
    else if (state.screen !== "loading" && state.screen !== "success") triggerWillpower();
  }
});
