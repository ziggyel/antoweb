/* =========================================================
   HELPERS
   ========================================================= */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const TYPE_SPEED = 35;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/* =========================================================
   ESTADO
   ========================================================= */
const state = {
  screen: "start",
  dialogueStep: 0,
  dialogueBusy: false,
  skipTyping: false,
  rolled: false,
  audioOn: false,
};

/* =========================================================
   DATOS — RECUERDOS
   ========================================================= */
const memories = {
  "first-laugh": {
    title: "La primera risa fuera de control",
    text:
      "Un colapso repentino del protocolo exterior. La prueba de que la distancia entre ambas ya se había roto.",
  },

  longchamps: {
    title: "Las rutas nocturnas hacia Longchamps",
    text:
      "Luces de neón en la penumbra, canchas de fútbol iluminadas al pasar y telos a la orilla del camino. Un recorrido a través de la noche donde el destino importaba menos que el trayecto compartido.",
  },

  hug: {
    title: "El pacto del abrazo",
    text:
      "Contacto físico continuo que reduce a cero la inercia del invierno. La frontera exacta donde termina el ruido del mundo.",
  },

  "not-date": {
    title: "La no-cita inicial",
    text:
      "Un encuentro enmarcado bajo el protocolo formal de la amistad pura. En su momento, creíste que era solo una reunión casual. Sin embargo, la reevaluación del expediente demuestra lo contrario: aquella “no-cita” fue el primer paso de ella para acercarse a vos de forma inevitable.",
  },
};

/* =========================================================
   DATOS — THOUGHT ORBS
   ========================================================= */
const orbThoughts = {
  "first-kiss": {
    skill: "ELECTROQUÍMICA",
    title: "El Primer Beso",
    color: "#c04a44",
    text:
      "Su auto estacionado frente a tu casa de noche. Un impulso eléctrico incontrolable borró la distancia entre ambas. El primer beso que te dio no fue un evento planeado; fue una colisión inevitable.",
  },

  foosball: {
    skill: "COORDINACIÓN OJO-MANO",
    title: "Metegol en Acatraz",
    color: "#c04a44",
    text:
      "El sonido metálico de la pelota en Acatraz. Las estadísticas decían que no te ibas a dejar ganar, pero la victoria cayó del lado de ella. Un expediente que todavía te negás a revisar.",
  },

  "lemon-cake": {
    skill: "LÓGICA",
    title: "El Budín de Limón",
    color: "#52aed6",
    text:
      "Suministro táctico de azúcar enviado a UADE. El budín de limón casero que ella te llevó, diseñado para reducir tu estrés universitario en un 100%.",
  },

  "love-escape": {
    skill: "LÓGICA",
    title: "El “Te quiero” a la fuga",
    color: "#52aed6",
    text:
      "Le dijiste dos palabras en el auto y, antes de que ella pudiera procesarlo, abriste la puerta y saliste corriendo hacia la entrada. El impulso de tu sinceridad superó cualquier contención.",
  },

  "safe-place": {
    skill: "IMPERIO INTERIOR",
    title: "Lugar seguro",
    color: "#a965c6",
    text:
      "La cabeza de ella descansando sobre tu pecho en la penumbra de la noche, mientras la rodeabas con tus brazos. El ritmo de tus latidos convirtiéndose en el único sonido necesario para apagar el ruido del mundo.",
  },

  lomitas: {
    skill: "IMPERIO INTERIOR",
    title: "Fotos en Las Lomitas",
    color: "#a965c6",
    text:
      "Cuatro flashes dentro de una cabina pequeña en Las Lomitas. Las primeras fotos juntas impresas que capturaron el inicio del expediente.",
  },
};

/* =========================================================
   DATOS — DIÁLOGO POR PASOS
   ========================================================= */
const dialogueStages = [
  {
    label: "Paso 1 de 4",
    title: "El escenario",
    lines: [
      {
        voice: "NARRADOR",
        cls: "narrator",
        text:
          "La luz azulada del televisor ilumina la habitación en silencio. Afuera, la ciudad sigue su curso helado en la penumbra. Adentro, el aire está calmo. Están sentadas en el mismo sillón, separadas apenas por un par de centímetros. Un expediente no resuelto descansa sobre la mesa.",
      },
      {
        voice: "ELECTROQUÍMICA",
        cls: "electro",
        text:
          "Su hombro está apoyado contra el tuyo. La temperatura en ese punto de contacto es tres grados superior al resto del ambiente. Una anomalía térmica innegable.",
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
        text:
          "La persona a tu lado no ha dicho una sola palabra en los últimos tres minutos, pero la forma en que acomoda la manta sobre tus piernas es un tratado entero sobre la confianza. No hay tensión en el aire, solo una pregunta flotando que nadie se ha atrevido a formular en voz alta.",
      },
      {
        voice: "DRAMA",
        cls: "drama",
        text:
          "Sire, la puesta en escena es impecable. El ambiente, la penumbra, el cansancio del día disipándose... Todos los elementos escénicos apuntan hacia una sola resolución dramática.",
      },
    ],
  },

  {
    label: "Paso 3 de 4",
    title: "El análisis de lógica",
    lines: [
      {
        voice: "LÓGICA [Éxito Crítico]",
        cls: "logic",
        text:
          "Has analizado metódicamente las evidencias acumuladas en el archivo: el budín de limón llevado a la UADE, las risas descontroladas, los viajes nocturnos a Longchamps, el “te quiero” dicho a la fuga y la noche en que dormiste con su cabeza sobre tu pecho.",
      },
      {
        voice: "LÓGICA",
        cls: "logic",
        text:
          "Clasificar todo este volumen de datos bajo la etiqueta de “casualidad” o “amistad informal” es un error sistémico irrazonable. Estadísticamente, mantener este caso como “Pendiente” contradice la ley de causa y efecto.",
      },
    ],
  },

  {
    label: "Paso 4 de 4",
    title: "El clímax",
    lines: [
      {
        voice: "RESISTENCIA",
        cls: "endurance",
        text:
          "El universo tiene una tendencia natural hacia el caos y el frío. Sin embargo, el refugio que construyeron en este radio de tres metros cuadrados reduce a cero la inercia del invierno.",
      },
      {
        voice: "VOLICIÓN",
        cls: "volition",
        text:
          "No hay más pruebas que reunir. La evidencia es aplastante y la persona a tu lado está esperando. Es el momento de romper la inercia.",
      },
    ],
  },
];

/* =========================================================
   NAVEGACIÓN ENTRE PANTALLAS
   ========================================================= */
function showScreen(name) {
  state.screen = name;

  $$("[data-screen]").forEach(screen => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
  });

  document.body.dataset.step = name;
  document.body.dataset.phase =
    name === "check" || name === "success" ? "warm" : "cold";

  const status = {
    start: "Pendiente",
    character: "Sujeto confirmado",
    dialogue: "Revisión activa",
    check: "Resolución inmediata",
    success: "Cerrado",
  };

  $("#hud-case-status").textContent = status[name] || "Pendiente";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

$("#review-button").addEventListener("click", () => showScreen("character"));

$("#character-continue").addEventListener("click", async () => {
  showScreen("dialogue");
  state.dialogueStep = 0;
  $("#dialogue-log").innerHTML = "";
  await renderDialogueStage();
});

/* =========================================================
   TYPEWRITER
   - 35 ms por carácter
   - Clic sobre el bloque activo para completar el texto
   ========================================================= */
async function typeText(element, text, speed = TYPE_SPEED) {
  element.textContent = "";
  state.skipTyping = false;

  for (let index = 0; index < text.length; index += 1) {
    if (state.skipTyping) {
      element.textContent = text;
      break;
    }

    element.textContent += text[index];

    if (index % 9 === 0 || index === text.length - 1) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }

    await wait(speed);
  }

  state.skipTyping = false;
}

async function appendDialogue(line) {
  const entry = document.createElement("article");
  entry.className = `dialogue-entry ${line.cls}`;

  const voice = document.createElement("span");
  voice.className = "voice";
  voice.textContent = line.voice;

  const paragraph = document.createElement("p");
  paragraph.setAttribute("aria-label", line.text);

  entry.append(voice, paragraph);
  $("#dialogue-log").appendChild(entry);

  entry.addEventListener("click", () => {
    if (state.dialogueBusy) {
      state.skipTyping = true;
    }
  });

  entry.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });

  await typeText(paragraph, line.text);
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
    await wait(260);
  }

  state.dialogueBusy = false;

  const nextButton = $("#dialogue-next");

  if (state.dialogueStep < dialogueStages.length - 1) {
    nextButton.innerHTML = `
      <span>1.</span>
      <b>Continuar revisando el expediente.</b>
    `;
  } else {
    nextButton.innerHTML = `
      <span>1.</span>
      <b>Pasar a la tirada de resolución.</b>
    `;
  }

  $("#dialogue-action").classList.remove("is-hidden");
}

$("#dialogue-next").addEventListener("click", async () => {
  if (state.dialogueBusy) return;

  if (state.dialogueStep < dialogueStages.length - 1) {
    state.dialogueStep += 1;
    await renderDialogueStage();
    return;
  }

  showScreen("check");
});

/* =========================================================
   PANEL DE RECUERDOS
   ========================================================= */
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

$("#memories-toggle").addEventListener("click", openMemories);
$("#memories-close").addEventListener("click", closeMemories);
$("#memories-backdrop").addEventListener("click", closeMemories);

$$("[data-memory]").forEach(button => {
  button.addEventListener("click", () => {
    const memory = memories[button.dataset.memory];

    if (!memory) return;

    $$(".memory-card").forEach(card => {
      card.classList.toggle("is-active", card === button);
    });

    $("#memory-detail").classList.remove("is-empty");
    $(".memory-detail__status").textContent = "Pensamiento internalizado";
    $("#memory-detail-title").textContent = memory.title;
    $("#memory-detail-text").textContent = memory.text;
  });
});

/* =========================================================
   THOUGHT ORBS
   ========================================================= */
function openOrb(key) {
  const data = orbThoughts[key];
  const modal = $("#orb-modal");

  if (!data) return;

  $(".orb-modal__card", modal).style.setProperty("--orb-color", data.color);

  $("#orb-modal-skill").textContent = data.skill;
  $("#orb-modal-title").textContent = data.title;
  $("#orb-modal-text").textContent = data.text;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");

  setTimeout(() => {
    $("#orb-modal-close").focus({ preventScroll: true });
  }, 20);
}

function closeOrb() {
  $("#orb-modal").classList.remove("is-open");
  $("#orb-modal").setAttribute("aria-hidden", "true");
}

$$("[data-orb]").forEach(button => {
  button.addEventListener("click", () => openOrb(button.dataset.orb));
});

$("#orb-modal-close").addEventListener("click", closeOrb);
$("#orb-modal-backdrop").addEventListener("click", closeOrb);

/* =========================================================
   CASSETTE
   ========================================================= */
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
      $("#cassette-label").textContent =
        "Cassette — falta assets/ambient.mp3";

      console.warn(
        "No se pudo reproducir el archivo de audio local.",
        error
      );
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

/* =========================================================
   SKILL CHECK
   Resultado visual forzado a ÉXITO CRÍTICO — 20/20.
   Los dados son decorativos; la resolución narrativa está fijada.
   ========================================================= */
$("#roll-button").addEventListener("click", () => {
  if (state.rolled) return;

  state.rolled = true;

  const button = $("#roll-button");
  const pair = $(".dice-pair", button);
  const dice = $$("i", pair);

  button.disabled = true;
  pair.classList.add("is-rolling");

  $("#roll-result").textContent =
    "La última variable abandona el territorio de la teoría...";

  let ticks = 0;

  const timer = window.setInterval(() => {
    dice.forEach(die => {
      die.textContent = String(Math.floor(Math.random() * 6) + 1);
    });

    ticks += 1;

    if (ticks >= 18) {
      window.clearInterval(timer);

      pair.classList.remove("is-rolling");

      dice[0].textContent = "6";
      dice[1].textContent = "6";

      $("#roll-result").innerHTML = `
        <strong>[ÉXITO CRÍTICO — 20/20]</strong>
        <span>El expediente ya no admite otra conclusión racional.</span>
      `;

      setTimeout(() => {
        $("#proposal-wrap").classList.remove("is-hidden");
        $("#proposal-wrap").scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 650);
    }
  }, 85);
});

/* =========================================================
   RESOLUCIÓN
   ========================================================= */
$("#accept-button").addEventListener("click", () => {
  showScreen("success");

  setTimeout(() => {
    $("#achievement").classList.add("is-visible");
  }, 420);
});

/* =========================================================
   REINICIO
   ========================================================= */
$("#restart-button").addEventListener("click", () => {
  state.dialogueStep = 0;
  state.dialogueBusy = false;
  state.skipTyping = false;
  state.rolled = false;

  $("#dialogue-log").innerHTML = "";
  $("#dialogue-action").classList.add("is-hidden");

  $("#roll-button").disabled = false;
  $$(".dice-pair i").forEach(die => {
    die.textContent = "1";
  });

  $("#roll-result").textContent = "";
  $("#proposal-wrap").classList.add("is-hidden");
  $("#achievement").classList.remove("is-visible");

  showScreen("start");
});

/* =========================================================
   TECLA ESCAPE
   ========================================================= */
document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;

  if ($("#orb-modal").classList.contains("is-open")) {
    closeOrb();
    return;
  }

  if ($("#memories-panel").classList.contains("is-open")) {
    closeMemories();
  }
});
