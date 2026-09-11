
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const TYPE_SPEED = 31;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const state = {
  screen: "start",
  dialogueStep: 0,
  dialogueBusy: false,
  skipTyping: false,
  rolled: false,
  audioOn: false,
  whiteAttempts: 0,
  whitePassed: false,
  investigationActive: false,
  sceneClues: new Set(),
  evidence: new Set(),
  thoughtInternalized: false,
  thoughtInternalizing: false,
  taskStates: {
    review: "active",
    living: "locked",
    white: "locked",
    thought: "locked",
    evidence: "locked",
    resolve: "locked",
  },
};


const memories = {
  "first-laugh": {
    title: "La primera risa fuera de control",
    text: "Un colapso repentino del protocolo exterior. La prueba de que la distancia entre ambas ya se había roto.",
  },
  longchamps: {
    title: "Las rutas nocturnas hacia Longchamps",
    text: "Luces de neón en la penumbra, canchas de fútbol iluminadas al pasar y telos a la orilla del camino. Un recorrido a través de la noche donde el destino importaba menos que el trayecto compartido.",
  },
  hug: {
    title: "El pacto del abrazo",
    text: "Contacto físico continuo que reduce a cero la inercia del invierno. La frontera exacta donde termina el ruido del mundo.",
  },
  "not-date": {
    title: "La no-cita inicial",
    text: "Un encuentro enmarcado bajo el protocolo formal de la amistad pura. En su momento, creíste que era solo una reunión casual. Sin embargo, la reevaluación del expediente demuestra lo contrario: aquella no-cita fue el primer paso de ella para acercarse a vos de forma inevitable.",
  },
};


const orbThoughts = {
  "first-kiss": {
    skill: "ELECTROQUÍMICA",
    title: "El Primer Beso",
    color: "#c04a44",
    text: "Su auto estacionado frente a tu casa de noche. Un impulso eléctrico borró la distancia entre ambas. No fue un evento planeado; fue una colisión inevitable.",
  },
  foosball: {
    skill: "COORDINACIÓN OJO-MANO",
    title: "Metegol en Acatraz",
    color: "#c04a44",
    text: "El sonido metálico de la pelota en Acatraz. Las estadísticas decían que no te ibas a dejar ganar. El expediente, con una sonrisa apenas visible, conserva otra versión.",
  },
  "lemon-cake": {
    skill: "LÓGICA",
    title: "El Budín de Limón",
    color: "#52aed6",
    text: "Azúcar, limón, una entrega en UADE. Un gesto demasiado específico para ser casual y demasiado sencillo para necesitar explicación.",
  },
  "love-escape": {
    skill: "VOLICIÓN",
    title: "El “Te quiero” a la fuga",
    color: "#52aed6",
    text: "Dos palabras dentro del auto. Después, una puerta que se abre y una retirada ejecutada a velocidad sospechosa. La sinceridad llegó antes que el coraje para quedarse a verla caer.",
  },
  "safe-place": {
    skill: "IMPERIO INTERIOR",
    title: "Lugar seguro",
    color: "#a965c6",
    text: "La cabeza de ella sobre tu pecho en la penumbra. Tus brazos alrededor. El ruido del mundo reducido a una frecuencia lejana y sin autoridad.",
  },
  lomitas: {
    skill: "PERCEPCIÓN",
    title: "Fotos en Las Lomitas",
    color: "#a965c6",
    text: "Cuatro flashes dentro de una cabina pequeña. Papel recién impreso. La primera evidencia física de que algunas noches merecen sobrevivir a su propia memoria.",
  },
};


const sceneClues = {
  sofa: {
    skill: "PERCEPCIÓN [Medio: Éxito]",
    title: "El sillón verde",
    color: "#73a6b6",
    text: "Las marcas del uso están en los lugares exactos donde suelen sentarse. Dos marcas en los almohadones, una manta y una distancia que cada noche necesita menos espacio. El mueble no tiene opinión sobre el asunto. La evidencia que acumula, en cambio, empieza a ser indecente.",
    passive: "Dos huecos en el mismo sillón. La distancia entre ellos se hizo más chica con el tiempo.",
  },
  blanket: {
    skill: "EMPATÍA [Fácil: Éxito]",
    title: "Ella",
    color: "#b78aa6",
    text: "Hace poco era una desconocida. Ahora parece haberse quedado demasiado cerca como para volver a serlo. Casi nunca te mira; hoy sí. Sus manos inquietas y la insistencia de sus ojos dicen lo mismo: alguna decisión lleva rato rondándole la cabeza. Y por primera vez parece más asustada de no tomarla que de hacerlo.",
    passive: "“Esto es casual”, diría usualmente. Una coartada bastante pobre para alguien que está hasta las manos. Hoy no bromea. Sabe la verdad.",
  },
  television: {
    skill: "ENCICLOPEDIA [Trivial: Éxito]",
    title: "La televisión",
    color: "#70a8c1",
    text: "Está encendida. Eso es todo lo que la memoria puede confirmar. Qué estaban viendo es irrelevante; ambas recuerdan mejor quién estaba al lado.",
    passive: "Archivo audiovisual: inútil. Archivo afectivo: excesivamente detallado.",
  },
  table: {
    skill: "LÓGICA [Medio: Éxito]",
    title: "La mesa",
    color: "#65a9c8",
    text: "Objetos ordinarios. Una taza, una pantalla, cosas movidas sin ceremonia. La escena no fue preparada. Ese detalle la vuelve más difícil de descartar.",
    passive: "La evidencia más peligrosa tiene la costumbre de parecer doméstica.",
  },
  doorway: {
    skill: "ESCALOFRÍOS [Difícil: Éxito]",
    title: "La salida",
    color: "#8e70a9",
    text: "Toda puerta contiene una despedida potencial. Algunas noches la ciudad queda del otro lado y, por unos minutos más, ninguna quiere cruzarla.",
    passive: "En algún lugar de Buenos Aires, otra puerta se cerró detrás de un ‘te quiero’ y una fuga torpe.",
  },
  window: {
    skill: "ESCALOFRÍOS [Medio: Éxito]",
    title: "La ventana",
    color: "#8e70a9",
    text: "Afuera, la ciudad sigue haciendo lo suyo: colectivos, semáforos, ventanas encendidas. Ninguno sabe que este living está a punto de convertirse en el centro exacto del universo.",
    passive: "Buenos Aires continúa ahí afuera. Enormemente ajena a lo que está por ocurrir acá.",
  },
};


const dialogueStages = [
  {
    label: "Paso 1 de 4",
    title: "El escenario",
    lines: [
      {
        voice: "NARRADOR",
        cls: "narrator",
        text: "La televisión derrama una luz azul sobre el living. No ilumina realmente nada; apenas vuelve visibles los bordes de las cosas. El sillón verde. La manta. La mesa. Ella, sentada tan cerca que su hombro entra y sale del territorio del tuyo con cada respiración.",
      },
      {
        voice: "ELECTROQUÍMICA",
        cls: "electro",
        text: "Su hombro toca el tuyo. Ahí está. Ese pequeño punto de contacto donde el cuerpo sabe cosas antes que la cabeza.",
      },
      {
        voice: "PERCEPCIÓN [Medio: Éxito]",
        cls: "logic passive-entry",
        text: "La manta ya está acomodada sobre las dos. Nadie recuerda haber decidido eso.",
      },
    ],
  },
  {
    label: "Paso 2 de 4",
    title: "La observación",
    lines: [
      {
        voice: "EMPATÍA",
        cls: "empathy",
        text: "Ella acomoda la manta sobre tus piernas sin preguntarte. Las cosas importantes suelen llegar disfrazadas de eso: una mano que busca la tuya en la oscuridad, comida hecha para un día difícil, una ruta un poco más larga porque ninguna quiere llegar todavía.",
      },
      {
        voice: "DRAMA",
        cls: "drama",
        text: "Qué escena miserablemente perfecta. Ni lluvia. Ni violines. Ni una multitud esperando una declaración. Solo dos chicas en un sillón haciendo todo lo posible por fingir que esto todavía necesita explicación.",
      },
      {
        voice: "ESPÍRITU DE CORPS [Fácil: Éxito]",
        cls: "empathy passive-entry",
        text: "Dos personas ocupando demasiado poco espacio para fingir indiferencia.",
      },
    ],
  },
  {
    label: "Paso 3 de 4",
    title: "Las pruebas",
    lines: [
      {
        voice: "LÓGICA [Éxito Crítico]",
        cls: "logic",
        text: "El archivo es ridículo: un budín de limón llevado hasta UADE, cuatro fotos impresas, Longchamps detrás del parabrisas, una confesión seguida de una retirada táctica vergonzosamente veloz y abrazos demasiado largos para ser considerados accidentales.",
      },
      {
        voice: "LÓGICA",
        cls: "logic",
        text: "Ninguna prueba es concluyente por separado. Juntas forman algo bastante difícil de negar. La categoría ‘todavía no son novias’ presenta inconsistencias graves.",
      },
      {
        voice: "RETÓRICA [Medio: Éxito]",
        cls: "drama passive-entry",
        text: "Quizás la respuesta nunca estuvo escondida. Quizás ambas llevan semanas rodeándola con palabras más pequeñas.",
      },
    ],
  },
  {
    label: "Paso 4 de 4",
    title: "El punto de no retorno",
    lines: [
      {
        voice: "RESISTENCIA",
        cls: "endurance",
        text: "El invierno puede hacer lo que quiera allá afuera. Puede cubrir los vidrios, vaciar las calles, enfriar el metal de los autos. Acá no. Acá hay dos cuerpos compartiendo calor y una manta demasiado pequeña para contenerlos del todo.",
      },
      {
        voice: "VOLICIÓN",
        cls: "volition",
        text: "Basta. No porque falten pruebas. Precisamente porque sobran. Algunas cosas se vuelven más aterradoras cuanto más ciertas son.",
      },
      {
        voice: "IMPERIO INTERIOR [Formidable: Éxito]",
        cls: "empathy passive-entry",
        text: "La pregunta no es si esto existe. La pregunta es cuánto tiempo más van a seguir viviendo dentro de algo sin atreverse a darle un nombre.",
      },
    ],
  },
];


function setTask(id, status) {
  state.taskStates[id] = status;
  const task = $(`[data-task="${id}"]`);
  if (!task) return;
  task.classList.remove("is-active", "is-complete");
  if (status === "active") task.classList.add("is-active");
  if (status === "complete") task.classList.add("is-complete");
  const mark = $(".task-item__mark", task);
  if (mark) mark.textContent = status === "complete" ? "✓" : "○";
  const completed = Object.values(state.taskStates).filter(value => value === "complete").length;
  $("#tasks-count").textContent = `${completed}/6`;
}

function openTasks() {
  $("#tasks-panel").classList.add("is-open");
  $("#tasks-backdrop").classList.add("is-open");
  $("#tasks-panel").setAttribute("aria-hidden", "false");
  $("#tasks-toggle").setAttribute("aria-expanded", "true");
}

function closeTasks() {
  $("#tasks-panel").classList.remove("is-open");
  $("#tasks-backdrop").classList.remove("is-open");
  $("#tasks-panel").setAttribute("aria-hidden", "true");
  $("#tasks-toggle").setAttribute("aria-expanded", "false");
}

$("#tasks-toggle").addEventListener("click", openTasks);
$("#tasks-close").addEventListener("click", closeTasks);
$("#tasks-backdrop").addEventListener("click", closeTasks);


function showScreen(name) {
  state.screen = name;
  $$('[data-screen]').forEach(screen => screen.classList.toggle("is-active", screen.dataset.screen === name));
  document.body.dataset.step = name;
  document.body.dataset.phase = name === "check" || name === "success" ? "warm" : "cold";

  const status = {
    start: "Pendiente",
    character: "Sujeto confirmado",
    dialogue: "Revisión activa",
    check: "Tirada roja",
    success: "Cerrado",
  };
  $("#hud-case-status").textContent = status[name] || "Pendiente";
  if (name === "check") prepareFinalCheck();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$("#review-button").addEventListener("click", () => showScreen("character"));

$("#character-continue").addEventListener("click", async () => {
  setTask("review", "complete");
  showScreen("dialogue");
  state.dialogueStep = 0;
  $("#dialogue-log").innerHTML = "";
  await renderDialogueStage();
});


function keepActiveDialogueInView(element, behavior = "auto", force = false) {
  if (!element) return;

  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const lowerComfortLine = viewportHeight * 0.72;

  
  if (!force && rect.bottom <= lowerComfortLine) return;

  const desiredBottom = viewportHeight * 0.64;
  const target = window.scrollY + rect.bottom - desiredBottom;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - viewportHeight);

  window.scrollTo({
    top: Math.max(0, Math.min(target, maxScroll)),
    behavior,
  });
}

async function typeText(element, text, speed = TYPE_SPEED) {
  element.textContent = "";
  state.skipTyping = false;
  for (let index = 0; index < text.length; index += 1) {
    if (state.skipTyping) {
      element.textContent = text;
      break;
    }
    element.textContent += text[index];
    if (index % 8 === 0 || index === text.length - 1) {
      keepActiveDialogueInView(element, "auto");
    }
    await wait(speed);
  }

  keepActiveDialogueInView(element, "smooth");
  state.skipTyping = false;
}

async function appendDialogue(line, { instant = false } = {}) {
  const entry = document.createElement("article");
  entry.className = `dialogue-entry ${line.cls || "narrator"}`;
  const voice = document.createElement("span");
  voice.className = "voice";
  voice.textContent = line.voice;
  const paragraph = document.createElement("p");
  paragraph.setAttribute("aria-label", line.text);
  entry.append(voice, paragraph);
  $("#dialogue-log").appendChild(entry);
  entry.addEventListener("click", () => {
    if (state.dialogueBusy) state.skipTyping = true;
  });
  keepActiveDialogueInView(entry, "smooth", true);
  if (instant) paragraph.textContent = line.text;
  else await typeText(paragraph, line.text);
}


async function renderDialogueStage() {
  if (state.dialogueBusy) return;
  state.dialogueBusy = true;
  $("#dialogue-action").classList.add("is-hidden");

  const stage = dialogueStages[state.dialogueStep];
  $("#dialogue-stage-label").textContent = stage.label;
  $("#dialogue-stage-title").textContent = stage.title;

  for (const line of stage.lines) {
    await appendDialogue(line);
    await wait(170);
  }

  state.dialogueBusy = false;

  
  if (state.dialogueStep === 0 && !state.whitePassed) {
    $("#white-check").classList.remove("is-hidden");
    return;
  }

  
  if (state.dialogueStep === 0 && state.whitePassed && !state.thoughtInternalized) {
    $("#new-thought-notice").classList.remove("is-hidden");
    return;
  }

  
  if (state.dialogueStep === 0 && state.evidence.size < 3) {
    unlockEvidencePhase();
    return;
  }

  revealDialogueNext();
}

function revealDialogueNext() {
  const nextButton = $("#dialogue-next");
  if (state.dialogueStep < dialogueStages.length - 1) {
    nextButton.innerHTML = '<span>1.</span><b>Seguir reconstruyendo el expediente.</b>';
  } else {
    nextButton.innerHTML = '<span>1.</span><b>[VOLICIÓN] Ir a la tirada roja.</b>';
    setTask("resolve", "active");
  }
  $("#dialogue-action").classList.remove("is-hidden");
}

$("#dialogue-next").addEventListener("click", async () => {
  if (state.dialogueBusy) return;
  $("#dialogue-action").classList.add("is-hidden");
  if (state.dialogueStep < dialogueStages.length - 1) {
    state.dialogueStep += 1;
    await renderDialogueStage();
  } else {
    showScreen("check");
  }
});


function setWhiteCheckState(mode) {
  const button = $("#white-check-button");
  const heading = $("#white-check h3");
  const percent = $("#white-check-percent");
  const prompt = $("#white-check-prompt");

  if (mode === "initial") {
    percent.textContent = "8%";
    heading.textContent = "[EMPATÍA — IMPOSIBLE]";
    prompt.textContent = "Determinar cuándo empezó todo esto.";
    button.disabled = false;
    button.classList.remove("is-locked", "is-ready");
    button.querySelector("b").textContent = "Intentarlo.";
  }

  if (mode === "locked") {
    percent.textContent = "BLOQUEADO";
    heading.textContent = "[EMPATÍA — CHECK BLANCO]";
    prompt.textContent = "Volvé después de mirar mejor el lugar.";
    button.disabled = true;
    button.classList.add("is-locked");
    button.querySelector("b").textContent = "Necesitás más contexto.";
  }

  if (mode === "retry") {
    percent.textContent = "83%";
    heading.textContent = "[EMPATÍA — DESAFIANTE]";
    prompt.textContent = "Intentar otra vez: encontrar el momento exacto en que cambió todo.";
    button.disabled = false;
    button.classList.remove("is-locked");
    button.classList.add("is-ready");
    button.querySelector("b").textContent = "Reintentar.";
  }
}

async function resolveWhiteCheck() {
  if (state.dialogueBusy) return;
  const result = $("#white-check-result");
  state.whiteAttempts += 1;

  if (state.whiteAttempts === 1) {
    result.innerHTML = '<strong class="white-fail">[FALLO]</strong><span>La respuesta se desarma cuando intentás fijarla en una fecha.</span>';
    setWhiteCheckState("locked");
    state.investigationActive = true;
    $("#scene-investigation").classList.add("is-investigating");
    $("#scene-investigation-hint").classList.remove("is-hidden");
    setTask("living", "active");
    setTask("white", "active");
    await appendDialogue({
      voice: "EMPATÍA [Fallo]",
      cls: "empathy passive-entry",
      text: "Estás buscando una fecha. Ese es el problema. Algunas cosas importantes tienen la mala costumbre de empezar antes de que alguien se dé cuenta.",
    });
    return;
  }

  if (state.sceneClues.size < 3) return;

  state.whitePassed = true;
  state.investigationActive = false;
  $("#scene-investigation").classList.remove("is-investigating");
  $("#scene-investigation-hint").classList.add("is-hidden");
  result.innerHTML = '<strong class="white-success">[ÉXITO]</strong><span>No encontraste una fecha. Encontraste una acumulación.</span>';
  $("#white-check-button").disabled = true;
  setTask("white", "complete");
  setTask("thought", "active");
  await appendDialogue({
    voice: "EMPATÍA [Éxito]",
    cls: "empathy",
    text: "No hubo un momento exacto. Hubo una colección de cosas pequeñas que empezaron a repetirse hasta que estar juntas dejó de sentirse como una excepción.",
  });
  await wait(220);
  $("#new-thought-notice").classList.remove("is-hidden");
  $("#new-thought-notice").scrollIntoView({ behavior: "smooth", block: "center" });
}

$("#white-check-button").addEventListener("click", resolveWhiteCheck);


function openInformationCard(data) {
  const modal = $("#orb-modal");
  $(".orb-modal__card", modal).style.setProperty("--orb-color", data.color || "#d3a042");
  $("#orb-modal-skill").textContent = data.skill;
  $("#orb-modal-title").textContent = data.title;
  $("#orb-modal-text").textContent = data.text;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  setTimeout(() => $("#orb-modal-close").focus({ preventScroll: true }), 20);
}

async function inspectSceneClue(key, button) {
  if (!state.investigationActive) return;
  const clue = sceneClues[key];
  if (!clue) return;

  openInformationCard(clue);
  if (state.sceneClues.has(key)) return;

  state.sceneClues.add(key);
  button.classList.add("is-found");
  $("#scene-clue-count").textContent = Math.min(state.sceneClues.size, 3);

  await appendDialogue({ voice: clue.skill, cls: "logic passive-entry", text: clue.passive }, { instant: true });

  if (state.sceneClues.size >= 3) {
    setTask("living", "complete");
    $("#scene-investigation-hint b").textContent = "Ya viste suficiente. Volvé al check.";
    $("#scene-investigation-hint small").textContent = "CHECK BLANCO DESBLOQUEADO";
    setWhiteCheckState("retry");
    $("#white-check").classList.add("is-unlocked");
    $("#white-check").scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

$$('[data-scene-clue]').forEach(button => {
  button.addEventListener("click", () => inspectSceneClue(button.dataset.sceneClue, button));
});


function openThoughtCabinet() {
  $("#thought-cabinet-modal").classList.add("is-open");
  $("#thought-cabinet-modal").setAttribute("aria-hidden", "false");
}

function closeThoughtCabinet() {
  if (state.thoughtInternalizing) return;
  $("#thought-cabinet-modal").classList.remove("is-open");
  $("#thought-cabinet-modal").setAttribute("aria-hidden", "true");
}

$("#new-thought-notice").addEventListener("click", openThoughtCabinet);
$("#thought-cabinet-close").addEventListener("click", closeThoughtCabinet);
$("#thought-cabinet-backdrop").addEventListener("click", closeThoughtCabinet);

$("#internalize-thought").addEventListener("click", async () => {
  if (state.thoughtInternalized || state.thoughtInternalizing) return;
  state.thoughtInternalizing = true;
  const button = $("#internalize-thought");
  button.disabled = true;
  button.textContent = "INTERNALIZANDO...";
  $("#thought-progress").classList.remove("is-hidden");
  $("#thought-progress").classList.add("is-running");
  await wait(2300);
  state.thoughtInternalizing = false;
  state.thoughtInternalized = true;
  button.textContent = "[INTERNALIZADO]";
  $("#thought-solution").classList.remove("is-hidden");
  $("#new-thought-notice").classList.add("is-complete");
  $("#new-thought-notice small").textContent = "PENSAMIENTO INTERNALIZADO";
  setTask("thought", "complete");
  setTask("evidence", "active");
  addHomeThoughtToMemories();
  unlockEvidencePhase();
});

function addHomeThoughtToMemories() {
  if ($('[data-memory="home"]')) return;
  memories.home = {
    title: "La forma de un hogar",
    text: "Tal vez un hogar también pueda ser una persona que levanta una esquina de la manta para hacerte lugar.",
  };
  const list = $(".memory-list");
  const button = document.createElement("button");
  button.className = "memory-card";
  button.type = "button";
  button.dataset.memory = "home";
  button.innerHTML = '<span class="memory-card__index">05</span><div><small>Internalizado</small><h3>La forma de un hogar</h3></div><span class="memory-card__arrow" aria-hidden="true">→</span>';
  list.appendChild(button);
  bindMemoryButton(button);
  const count = $("#memories-toggle span");
  if (count) count.textContent = "5";
}


function unlockEvidencePhase() {
  if (!state.thoughtInternalized) return;
  $(".thought-orbs").classList.remove("are-locked");
  $("#evidence-progress").classList.remove("is-hidden");
  $("#evidence-count").textContent = state.evidence.size;
  if (state.evidence.size >= 3) {
    setTask("evidence", "complete");
    $("#evidence-progress small").textContent = "Suficiente. El expediente ya puede avanzar.";
    revealDialogueNext();
  }
}

function openOrb(key) {
  if (!state.thoughtInternalized) return;
  const data = orbThoughts[key];
  if (!data) return;
  openInformationCard(data);

  const button = $(`[data-orb="${key}"]`);
  if (!state.evidence.has(key)) {
    state.evidence.add(key);
    button?.classList.add("is-collected");
    $("#evidence-count").textContent = Math.min(state.evidence.size, 3);
    if (state.evidence.size >= 3) unlockEvidencePhase();
  }
}

function closeOrb() {
  $("#orb-modal").classList.remove("is-open");
  $("#orb-modal").setAttribute("aria-hidden", "true");
}

$$('[data-orb]').forEach(button => button.addEventListener("click", () => openOrb(button.dataset.orb)));
$("#orb-modal-close").addEventListener("click", closeOrb);
$("#orb-modal-backdrop").addEventListener("click", closeOrb);


function openMemories() {
  $("#memories-panel").classList.add("is-open");
  $("#memories-backdrop").classList.add("is-open");
  $("#memories-panel").setAttribute("aria-hidden", "false");
  $("#memories-toggle").setAttribute("aria-expanded", "true");
}

function closeMemories() {
  $("#memories-panel").classList.remove("is-open");
  $("#memories-backdrop").classList.remove("is-open");
  $("#memories-panel").setAttribute("aria-hidden", "true");
  $("#memories-toggle").setAttribute("aria-expanded", "false");
}

function bindMemoryButton(button) {
  button.addEventListener("click", () => {
    const memory = memories[button.dataset.memory];
    if (!memory) return;
    $$(".memory-card").forEach(card => card.classList.toggle("is-active", card === button));
    $("#memory-detail").classList.remove("is-empty");
    $(".memory-detail__status").textContent = "Pensamiento internalizado";
    $("#memory-detail-title").textContent = memory.title;
    $("#memory-detail-text").textContent = memory.text;
  });
}

$("#memories-toggle").addEventListener("click", openMemories);
$("#memories-close").addEventListener("click", closeMemories);
$("#memories-backdrop").addEventListener("click", closeMemories);
$$('[data-memory]').forEach(bindMemoryButton);


const ambientAudio = $("#ambient-audio");
async function toggleCassette() {
  const button = $("#cassette-toggle");
  if (!state.audioOn) {
    try {
      ambientAudio.volume = 0.42;
      await ambientAudio.play();
      state.audioOn = true;
      button.setAttribute("aria-pressed", "true");
      button.setAttribute("aria-label", "Pausar ambiente musical");
      $("#cassette-label").textContent = "Cassette — reproduciendo";
    } catch (error) {
      $("#cassette-label").textContent = "Cassette — revisar ambient.mp3";
      console.warn("No se pudo reproducir assets/ambient.mp3", error);
    }
    return;
  }
  ambientAudio.pause();
  state.audioOn = false;
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-label", "Reproducir ambiente musical");
  $("#cassette-label").textContent = "Cassette — pausa";
}
$("#cassette-toggle").addEventListener("click", toggleCassette);


function prepareFinalCheck() {
  const earned = new Set(state.evidence);
  if (state.thoughtInternalized) earned.add("home");
  $$('[data-modifier-key]').forEach(row => row.classList.toggle("is-earned", earned.has(row.dataset.modifierKey)));

  
  const chance = Math.min(97, 65 + state.evidence.size * 7 + (state.thoughtInternalized ? 11 : 0));
  $("#red-check-percent").textContent = `${chance}%`;
}

$("#roll-button").addEventListener("click", () => {
  if (state.rolled) return;
  state.rolled = true;
  const button = $("#roll-button");
  const pair = $(".dice-pair", button);
  const dice = $$("i", pair);
  button.disabled = true;
  pair.classList.add("is-rolling");
  $("#roll-result").textContent = "Por una vez, el miedo llega tarde...";

  let ticks = 0;
  const timer = window.setInterval(() => {
    dice.forEach(die => { die.textContent = String(Math.floor(Math.random() * 6) + 1); });
    ticks += 1;
    if (ticks >= 18) {
      window.clearInterval(timer);
      pair.classList.remove("is-rolling");
      dice[0].textContent = "6";
      dice[1].textContent = "6";
      $("#roll-result").innerHTML = '<strong>[ÉXITO CRÍTICO — 20/20]</strong><span>No hay ninguna habilidad que pueda ayudarte con lo que viene después. Esta parte es tuya.</span>';
      setTimeout(() => {
        $("#proposal-wrap").classList.remove("is-hidden");
        $("#proposal-wrap").scrollIntoView({ behavior: "smooth", block: "center" });
      }, 650);
    }
  }, 85);
});


$("#accept-button").addEventListener("click", async () => {
  const acceptButton = $("#accept-button");
  const proposalWrap = $("#proposal-wrap");

  acceptButton.disabled = true;
  state.dialogueBusy = true;

  $(".final-response-sequence")?.remove();

  const response = document.createElement("div");
  response.className = "final-response-sequence";
  proposalWrap.appendChild(response);

  const finalLines = [
    {
      voice: "VOLICIÓN [Éxito]",
      cls: "volition",
      text:
        "Ahí está. Una palabra diminuta esperando del otro lado de todo este esfuerzo. No exige valentía heroica. No pide que seas una persona distinta. Solo que, por una vez, no retrocedas frente a algo bueno cuando finalmente llega hasta vos."
    },
    {
      voice: "EMPATÍA [Éxito]",
      cls: "empathy",
      text:
        "Ella está esperando. Hace un instante tenía las manos inquietas. Los ojos buscando cualquier lugar donde descansar salvo en vos. Ahora no puede hacer nada más. Ya mostró sus cartas y las dejó boca arriba sobre la mesa. Qué situación espantosa. Qué suerte."
    },
    {
      voice: "IMPERIO INTERIOR",
      cls: "empathy",
      text:
        "Pensá en la cantidad absurda de cosas que tuvieron que pasar para llegar a este sillón. Tener una cita bajo el nombre prudente de “salida de amigas”. Ganarle en el pool. Comer hamburguesas dentro del auto. Besarse con esa timidez ridícula que vuelve importante hasta dónde poner las manos. Dormir abrazadas. Soportar a su perro insoportable. Invitarla a tu cumpleaños mientras, en algún rincón de tu cabeza, esperabas desesperadamente que todo saliera bien. Ninguna de esas cosas parecía estar construyendo una respuesta. El mundo tiene métodos extraños para construir algo."
    },
    {
      voice: "NARRADOR",
      cls: "narrator",
      text:
        "La televisión continúa encendida. Afuera pasa un auto. En algún lugar de Buenos Aires alguien pierde un colectivo, alguien llega tarde, alguien está diciendo una cosa de la que se va a arrepentir mañana. Nada de eso entra acá. Abrís la boca. —Sí. Es ridículo lo poco que pesa la palabra al salir. Después de todo lo que cargaba."
    },
    {
      voice: "EMPATÍA [Formidable: Éxito]",
      cls: "empathy",
      text:
        "Mirala. Eso que acaba de desaparecer de su cara era miedo."
    }
  ];

  for (const line of finalLines) {
    const entry = document.createElement("article");
    entry.className = `dialogue-entry ${line.cls}`;

    const voice = document.createElement("span");
    voice.className = "voice";
    voice.textContent = line.voice;

    const paragraph = document.createElement("p");

    entry.append(voice, paragraph);
    response.appendChild(entry);

    entry.addEventListener("click", () => {
      state.skipTyping = true;
    });

    keepActiveDialogueInView(entry, "smooth", true);

    await typeText(paragraph, line.text);
    await wait(550);
  }

  state.dialogueBusy = false;

  const closeCaseButton = document.createElement("button");
  closeCaseButton.className = "dialogue-choice final-case-button";
  closeCaseButton.type = "button";

  closeCaseButton.innerHTML = `
    <span>1.</span>
    <b>[Cerrar el expediente.]</b>
  `;

  response.appendChild(closeCaseButton);

  keepActiveDialogueInView(closeCaseButton, "smooth", true);

  closeCaseButton.addEventListener("click", () => {
    showScreen("success");

    setTimeout(() => {
      $("#achievement").classList.add("is-visible");
    }, 420);
  });
});


function resetMechanics() {
  state.dialogueStep = 0;
  state.dialogueBusy = false;
  state.skipTyping = false;
  state.rolled = false;
  state.whiteAttempts = 0;
  state.whitePassed = false;
  state.investigationActive = false;
  state.sceneClues.clear();
  state.evidence.clear();
  state.thoughtInternalized = false;
  state.thoughtInternalizing = false;
  state.taskStates = { review: "active", living: "locked", white: "locked", thought: "locked", evidence: "locked", resolve: "locked" };

  $("#dialogue-log").innerHTML = "";
  $("#dialogue-action").classList.add("is-hidden");
  $("#white-check").classList.add("is-hidden");
  $("#white-check").classList.remove("is-unlocked");
  $("#white-check-result").innerHTML = "";
  setWhiteCheckState("initial");
  $("#scene-investigation").classList.remove("is-investigating");
  $("#scene-investigation-hint").classList.add("is-hidden");
  $("#scene-clue-count").textContent = "0";
  $$('[data-scene-clue]').forEach(button => button.classList.remove("is-found"));
  $("#new-thought-notice").classList.add("is-hidden");
  $("#new-thought-notice").classList.remove("is-complete");
  $("#new-thought-notice small").textContent = "HA SURGIDO UN NUEVO PENSAMIENTO";
  $("#thought-progress").classList.add("is-hidden");
  $("#thought-progress").classList.remove("is-running");
  $("#thought-solution").classList.add("is-hidden");
  $("#internalize-thought").disabled = false;
  $("#internalize-thought").textContent = "[INTERNALIZAR]";
  $(".thought-orbs").classList.add("are-locked");
  $$('[data-orb]').forEach(button => button.classList.remove("is-collected"));
  $("#evidence-progress").classList.add("is-hidden");
  $("#evidence-count").textContent = "0";

  $("#roll-button").disabled = false;
  $$(".dice-pair i").forEach(die => { die.textContent = "1"; });
  $("#roll-result").textContent = "";
  $("#proposal-wrap").classList.add("is-hidden");
  $("#achievement").classList.remove("is-visible");

   
$(".final-response-sequence")?.remove();
$("#accept-button").disabled = false;
   
  Object.keys(state.taskStates).forEach(id => setTask(id, state.taskStates[id]));
}


function openKimNotebook() {
  const modal = $("#kim-notebook-modal");
  const trigger = $("#kim-notebook-open");
  if (!modal || !trigger) return;

  
  if ($("#tasks-panel")?.classList.contains("is-open")) closeTasks();
  if ($("#memories-panel")?.classList.contains("is-open")) closeMemories();

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  trigger.setAttribute("aria-expanded", "true");
  document.body.classList.add("kim-notebook-open");

  window.setTimeout(() => {
    $("#kim-notebook-close")?.focus({ preventScroll: true });
  }, 80);
}

function closeKimNotebook() {
  const modal = $("#kim-notebook-modal");
  const trigger = $("#kim-notebook-open");
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  trigger?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("kim-notebook-open");

  window.setTimeout(() => trigger?.focus({ preventScroll: true }), 40);
}

$("#kim-notebook-open")?.addEventListener("click", openKimNotebook);
$("#kim-notebook-close")?.addEventListener("click", closeKimNotebook);
$("#kim-notebook-backdrop")?.addEventListener("click", closeKimNotebook);

$("#restart-button").addEventListener("click", event => {
  
  event.preventDefault();
  window.location.reload();
});


document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  if ($("#kim-notebook-modal")?.classList.contains("is-open")) {
    closeKimNotebook();
    return;
  }
  if ($("#thought-cabinet-modal").classList.contains("is-open")) {
    closeThoughtCabinet();
    return;
  }
  if ($("#orb-modal").classList.contains("is-open")) {
    closeOrb();
    return;
  }
  if ($("#tasks-panel").classList.contains("is-open")) {
    closeTasks();
    return;
  }
  if ($("#memories-panel").classList.contains("is-open")) closeMemories();
});


Object.keys(state.taskStates).forEach(id => setTask(id, state.taskStates[id]));
setWhiteCheckState("initial");
