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
   DATOS — RECUERDOS (Gabinete de pensamientos internalizados)
   ========================================================= */
const memories = {
  "first-laugh": {
    title: "La primera risa fuera de control",
    text:
      "Un colapso repentino y definitivo de la fachada institucional. El instante exacto donde la compostura fue incinerada y la distancia entre ambas se redujo a cenizas irrevocables.",
  },

  longchamps: {
    title: "Las rutas nocturnas hacia Longchamps",
    text:
      "Faroles amarillos cortando la neblina del sur, canchas de fútbol vacías y telos dormidos a la orilla del camino. Un recorrido hipnótico a través de la penumbra donde la geografía era lo de menos; lo único real era el peso del aire compartido dentro del habitáculo.",
  },

  hug: {
    title: "El pacto del abrazo",
    text:
      "Materia contra materia. Un anclaje físico de alta densidad que neutraliza por completo la inercia del invierno y acalla el murmullo hostil del resto del mundo.",
  },

  "not-date": {
    title: "La no-cita inicial",
    text:
      "Un encuentro disfrazado bajo el rigor del protocolo de la 'amistad pura'. En su momento pretendiste creer que era solo una reunión casual. Sin embargo, la reevaluación retrospectiva del expediente revela la verdad: aquella 'no-cita' fue la primera maniobra de aproximación gravitacional, lenta pero inevitable.",
  },
};

/* =========================================================
   DATOS — THOUGHT ORBS (Esferas de Habilidades)
   ========================================================= */
const orbThoughts = {
  "first-kiss": {
    skill: "ELECTROQUÍMICA",
    title: "El Primer Beso",
    color: "#c04a44",
    text:
      "El auto detenido frente a tu casa. El motor en silencio, las sombras de la noche contra el parabrisas. Una descarga sináptica ineludible que anuló la prudencia. No fue un acto calculado; fue una colisión electromagnética inevitadora.",
  },

  foosball: {
    skill: "COORDINACIÓN OJO-MANO",
    title: "Metegol en Acatraz",
    color: "#c04a44",
    text:
      "El impacto metálico de la bola rotando a velocidad terminal. Tu instinto te decía que no debías ceder terreno, pero la gravedad de la noche derivó la victoria hacia ella. Una derrota táctica que todavía te negás a archivar sin objeciones.",
  },

  "lemon-cake": {
    skill: "LÓGICA",
    title: "El Budín de Limón",
    color: "#52aed6",
    text:
      "Suministro calórico de emergencia desplegado en las inmediaciones de UADE. Un pastel casero de citrato y azúcar formulado con precisión milimétrica para disolver el estrés académico e incrementar los niveles de serotonina en un 100%.",
  },

  "love-escape": {
    skill: "LÓGICA",
    title: "El “Te quiero” a la fuga",
    color: "#52aed6",
    text:
      "Pronunciaste dos palabras cruciales dentro del habitáculo y, antes de que el aire pudiera devolver el eco, abriste la puerta y huiste hacia la protección de la edificación. La velocidad de tu sinceridad superó la capacidad de contención de tu propio orgullo.",
  },

  "safe-place": {
    skill: "IMPERIO INTERIOR",
    title: "Lugar seguro",
    color: "#a965c6",
    text:
      "Su frente descansando sobre tu tórax en la penumbra. El metrónomo constante de tus latidos sirvió como único pilar para disipar el caos del exterior y construir una fortaleza impenetrable de apenas un metro cuadrado.",
  },

  lomitas: {
    skill: "IMPERIO INTERIOR",
    title: "Fotos en Las Lomitas",
    color: "#a965c6",
    text:
      "Cuatro destellos de luz halógena aprisionados en la cabina fotosensible de Las Lomitas. La primera prueba documental impresa donde la química de dos miradas quedó registrada para la posteridad.",
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
          "El resplandor catódico del televisor baña el recinto en un tono azul helado. Afuera, la metrópolis continúa su congelamiento silencioso. Adentro, el tiempo parece suspendido. Dos cuerpos comparten un mismo tapizado, separados tan solo por una brecha insignificante de aire. Un expediente inconcluso reposa sobre la superficie de la mesa.",
      },
      {
        voice: "ELECTROQUÍMICA",
        cls: "electro",
        text:
          "Soplos de calidez. Su hombro se apoya levemente contra el tuyo. La microdinámica térmica en ese punto de contacto registra casi cuatro grados por encima de la media ambiental. Una anomalía física que tu piel se niega a ignorar.",
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
          "No ha pronunciado una sola sílaba en varios minutos, pero la cadencia con la que acomoda el borde de la manta sobre tus piernas equivale a un tratado completo sobre el refugio y la pertenencia. La quietud no guarda incomodidad alguna; solo una certidumbre suspendida que aguarda ser articulada.",
      },
      {
        voice: "DRAMA",
        cls: "drama",
        text:
          "¡Aguardad, mi lord! La escenografía es magistral. Las penumbras calculadas, la tensión del día disipándose en el olvido... Todo el aparato dramático converge inexorablemente hacia un único y glorioso clímax.",
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
          "Has auditado sistemáticamente el material acumulado en el archivo: las provisiones de budín en la universidad, las risas desarticuladas en la noche, el vagabundeo vehicular hacia Longchamps, la confesión de afecto arrojada antes de huir y las horas de vigilia sosteniendo su cabeza sobre tu pecho.",
      },
      {
        voice: "LÓGICA",
        cls: "logic",
        text:
          "Categorizar este volumen de eventos bajo el rotulo de 'azar' o 'afecto meramente circunstancial' constituye una negligencia analítica inaceptable. Mantener la etiqueta de 'Pendiente' desobedecería abiertamente las leyes elementales de la causa y el efecto.",
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
          "El mundo exterior es una tormenta de fricción y entropía. Sin embargo, este microcosmos erigido entre cuatro paredes ha logrado anular por completo la mordedura del frío. Es un bastión inexpugnable.",
      },
      {
        voice: "VOLICIÓN",
        cls: "volition",
        text:
          "Basta de recopilación de datos. El veredicto es indiscutible y la persona a tu lado aguarda el desenlace. Es el momento exacto para dar el paso definitivo.",
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
      <b>Continuar examinando las pruebas del expediente.</b>
    `;
  } else {
    nextButton.innerHTML = `
      <span>1.</span>
      <b>Proceder a la prueba de resolución final.</b>
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
    "La última duda se disuelve en el aire...";

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
        <span>La realidad cede. El expediente no permite otra interpretación.</span>
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
