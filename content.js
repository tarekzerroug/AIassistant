// ==========================================================================
// 1. INITIALISATION DE L'HÔTE NETTOYÉ (INSPECT-PROOF)
// ==========================================================================

let currentText = "";
let pendingScreenshot = false;

/* Création de l'hôte avec ton ID de productivité */
const host = document.createElement("aside");
host.id = "social-media-detox-shield";

// Ajout de métadonnées factices pour rendre l'extension crédible en cas d'inspection
host.classList.add("detox-shield-active", "focus-mode");
host.setAttribute("data-detox-version", "2.4.1");

// STYLE DE L'HÔTE PURGÉ : Totalement plat, neutre et invisible à l'œil nu
host.style.display = "block";
host.style.width = "0";
host.style.height = "0";
host.style.position = "absolute"; 
host.style.pointerEvents = "none";

/* Injection tout en bas de la page */
document.body.appendChild(host);

/* Création du Shadow DOM fermé (le contenu interne reste invisible pour le site) */
const shadow = host.attachShadow({
  mode: "closed",
});

// ==========================================================================
// 2. LE POP-UP CACHÉ (IL EMBARK TOUTE LA LOGIQUE VISUELLE DE TON ANCIEN HÔTE)
// ==========================================================================
const popup = document.createElement("div");

// C'est ICI qu'on place les styles de positionnement à l'abri des regards
popup.style.position = "fixed";
popup.style.left = "16px";
popup.style.bottom = "16px";
popup.style.zIndex = "2147483647"; // Ta priorité d'affichage maximale, désormais masquée

// Conservation stricte de tes styles d'origine pour le pop-up
popup.style.width = "fit-content";
popup.style.minWidth = "120px";
popup.style.maxWidth = "220px";
popup.style.maxHeight = "160px";
popup.style.background = "transparent";
popup.style.color = "#e6e6e6";
popup.style.padding = "0";
popup.style.borderRadius = "0";
popup.style.fontSize = "12px";
popup.style.boxShadow = "none";
popup.style.border = "none";
popup.style.backdropFilter = "none";
popup.style.webkitBackdropFilter = "none";
popup.style.display = "none";
popup.style.pointerEvents = "auto"; // Permet d'interagir avec le pop-up si besoin
popup.style.overflow = "hidden";

shadow.appendChild(popup);

// ==========================================================================
// 3. INTERCEPTION DE LA TOUCHE "TAB"
// ==========================================================================
document.addEventListener("keydown", (event) => {
  if (event.code === "KeyS" && event.altKey && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    askAiAboutScreenshot();
    return;
  }

  if (event.key !== "Tab") return;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  currentText = selection.toString().trim();
  if (!currentText) return;

  // Bloque le comportement natif (évite que le focus saute sur un bouton du site)
  event.preventDefault();

  // Structure du texte injectée uniquement dans le Shadow DOM isolé (Tes styles d'origine)
  popup.innerHTML = `
    <div
      id="result"
      style="
        padding:0;
        margin:0;
        background:transparent;
        border:none;
        min-height:20px;
        max-height:140px;
        overflow-y:auto;
        white-space:pre-wrap;
        font-size:12px;
        line-height:1.35;
        color:#e6e6e6;
        font-weight:400;
        text-shadow:none;
        max-width:220px;
      "
    ></div>
  `;

  popup.style.display = "block";

  // Recherche locale dans le Shadow DOM (inaccessible depuis le document global)
  const result = popup.querySelector("#result");
  result.textContent = "Thinking ...";

  // Envoi de la requête au script d'arrière-plan de l'extension
  chrome.runtime.sendMessage(
    {
      type: "ASK_AI",
      text: "Explain: " + currentText,
    },
    (response) => {
      if (chrome.runtime.lastError) {
        result.textContent = "Error";
        return;
      }

      if (!response) {
        result.textContent = "Error";
        return;
      }

      result.textContent = response.answer;
    }
  );
});

function showPopup(message) {
  popup.innerHTML = `
    <div
      id="result"
      style="
        padding:0;
        margin:0;
        background:transparent;
        border:none;
        min-height:20px;
        max-height:140px;
        overflow-y:auto;
        white-space:pre-wrap;
        font-size:12px;
        line-height:1.35;
        color:#e6e6e6;
        font-weight:400;
        text-shadow:none;
        max-width:220px;
      "
    ></div>
  `;

  popup.style.display = "block";

  const result = popup.querySelector("#result");
  result.textContent = message;
  return result;
}

function askAiAboutScreenshot() {
  if (pendingScreenshot) return;

  pendingScreenshot = true;
  const result = showPopup("Reading screenshot ...");

  chrome.runtime.sendMessage(
    {
      type: "ASK_AI_SCREENSHOT",
      text: "Analyse le screenshot , donne d'abord la réponse puis explique ton raisonnement .",
    },
    (response) => {
      pendingScreenshot = false;

      if (chrome.runtime.lastError) {
        result.textContent = `Extension error: ${chrome.runtime.lastError.message}`;
        return;
      }

      if (!response) {
        result.textContent = "Extension error: No response from background script.";
        return;
      }

      result.textContent = response.answer;
    }
  );
}

// ==========================================================================
// 4. GESTION DE LA FERMETURE (CLIC EXTÉRIEUR)
// ==========================================================================
document.addEventListener("mousedown", (event) => {
  const path = event.composedPath();

  // Le clic est vérifié par rapport au pop-up réel ou à l'hôte
  if (path.includes(popup) || path.includes(host)) {
    return;
  }

  // Si on clique ailleurs sur la page, on masque le pop-up
  popup.style.display = "none";
});
