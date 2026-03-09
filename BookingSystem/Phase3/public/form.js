// ===============================
// Form handling for resources page (corrigé)
// ===============================

// -------------- Helpers --------------
function $(id) {
  return document.getElementById(id);
}

// Normalisation/trim
function cleaned(value) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

// Timestamp
function timestamp() {
  const now = new Date();
  return now.toISOString().replace("T", " ").replace("Z", "");
}

// ---- RÈGLES PARTAGÉES (alignées avec resources.js) ----
// Name : 5–30, lettres/chiffres/espaces (FI inclus)
const NAME_ALLOWED = /^[a-zA-Z0-9äöåÄÖÅ ]+$/;
// Description : 10–50, lettres/chiffres + ponctuation simple (ta version actuelle)
const DESC_ALLOWED = /^[a-zA-Z0-9äöåÄÖÅ ><!?\-+\/\\]+$/;

function nameIsValid(v) {
  const t = cleaned(v);
  return t.length >= 5 && t.length <= 30 && NAME_ALLOWED.test(t);
}

function descIsValid(v) {
  const t = cleaned(v);
  return t.length >= 10 && t.length <= 50 && DESC_ALLOWED.test(t);
}

// Petits helpers visuels (verts/rouges) pour le submit
function applyVisualValidationState(id, ok) {
  const el = $(id);
  if (!el) return;
  el.classList.remove(
    "border-green-500",
    "bg-green-100",
    "focus:ring-green-500/30",
    "border-red-500",
    "bg-red-100",
    "focus:ring-red-500/30"
  );
  el.classList.add("focus:ring-2");
  el.setAttribute("aria-invalid", ok ? "false" : "true");

  if (ok) {
    el.classList.add("border-green-500", "bg-green-100", "focus:ring-green-500/30");
  } else {
    el.classList.add("border-red-500", "bg-red-100", "focus:ring-red-500/30");
  }
}

// -------------- Form wiring --------------
document.addEventListener("DOMContentLoaded", () => {
  const form = $("resourceForm");
  if (!form) {
    console.warn('resourceForm not found. Ensure the form has id="resourceForm".');
    return;
  }
  form.addEventListener("submit", onSubmit);
});

// Pour éviter double-submit
let submitting = false;

async function onSubmit(event) {
  event.preventDefault();

  if (submitting) return;

  const submitter = event.submitter;
  const actionValue = submitter && submitter.value ? submitter.value : "create";

  // Nettoyage + trim
  const nameRaw = $("resourceName")?.value ?? "";            // <-- ID corrigé
  const descRaw = $("resourceDescription")?.value ?? "";
  const available = $("resourceAvailable")?.checked ?? false;
  const unit = document.querySelector('input[name="resourcePriceUnit"]:checked')?.value ?? "";

  // Prix : normaliser (0 si vide/NaN)
  const priceRaw = $("resourcePrice")?.value ?? "";
  let resourcePrice = 0;
  if (priceRaw !== "") {
    const n = Number(priceRaw);
    resourcePrice = Number.isFinite(n) ? n : 0;
  }

  // VALIDATION FINALE AVANT ENVOI (mêmes règles)
  const name = cleaned(nameRaw);
  const description = cleaned(descRaw);

  const nameOk = nameIsValid(name);
  const descOk = descIsValid(description);

  // Feedback visuel cohérent même au submit
  applyVisualValidationState("resourceName", nameOk);
  applyVisualValidationState("resourceDescription", descOk);

  // Bloquer si invalide
  if (!nameOk || !descOk) {
    // Laisse resources.js gérer l'état des boutons en live,
    // ici on empêche juste l'envoi.
    alert("Please correct invalid fields before submitting.");
    console.warn("Form blocked. Invalid input.");
    return;
  }

  // Désactiver temporairement le bouton qui a déclenché le submit
  submitting = true;
  if (submitter) {
    submitter.disabled = true;
    submitter.classList.add("cursor-not-allowed", "opacity-50");
    submitter.setAttribute("aria-busy", "true");
  }

  const payload = {
    action: actionValue,
    resourceName: name,
    resourceDescription: description,
    resourceAvailable: available,
    resourcePrice,
    resourcePriceUnit: unit,
  };

  try {
    console.log("--------------------------");
    console.log(`The request sent to the server [${timestamp()}]`);
    console.log("--------------------------");

    // Même origine (statique servi par Express) → chemin relatif OK
    const response = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status} ${response.statusText}\n${text}`);
    }

    // Réponse du serveur
    const data = await response.json();

    let msg = `Server response [${timestamp()}]\n`;
    msg += "--------------------------\n";
    msg += `Status ➡️ ${response.status}\n`;
    msg += `Action ➡️ ${data.echo?.action}\n`;
    msg += `Name ➡️ ${data.echo?.resourceName}\n`;
    msg += `Description ➡️ ${data.echo?.resourceDescription}\n`;
    msg += `Availability ➡️ ${data.echo?.resourceAvailable}\n`;
    msg += `Price ➡️ ${data.echo?.resourcePrice}\n`;
    msg += `Price unit ➡️ ${data.echo?.resourcePriceUnit}\n`;

    console.log(msg);
    alert(msg);
  } catch (err) {
    console.error("POST error:", err);
    alert("Network or server error. Please try again.");
  } finally {
    submitting = false;
    if (submitter) {
      submitter.removeAttribute("aria-busy");
      // Laisse resources.js recalculer l'état en live.
      submitter.disabled = false;
      submitter.classList.remove("cursor-not-allowed", "opacity-50");
    }
  }
}
