// ===============================
// 1) DOM references
// ===============================
const actions = document.getElementById("resourceActions");
const resourceNameCnt = document.getElementById("resourceNameCnt");
const resourceDescriptionCnt = document.getElementById("resourceDescriptionCnt");

// Example roles
const role = "admin"; // "reserver" | "admin"

// Buttons
let createButton = null;
let updateButton = null;
let deleteButton = null;

// Validation flags
let resourceNameValid = false;
let resourceDescriptionValid = false;

// ===============================
// 2) Button creation helpers
// ===============================
const BUTTON_BASE_CLASSES =
  "w-full rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-200 ease-out";

const BUTTON_ENABLED_CLASSES =
  "bg-brand-primary text-white hover:bg-brand-dark/80 shadow-soft";

function addButton({ label, type = "button", value, classes = "" }) {
  const btn = document.createElement("button");
  btn.type = type;
  btn.textContent = label;
  btn.name = "action";
  if (value) btn.value = value;

  btn.className = `${BUTTON_BASE_CLASSES} ${classes}`.trim();
  actions.appendChild(btn);
  return btn;
}

function setButtonEnabled(btn, enabled) {
  if (!btn) return;

  btn.disabled = !enabled;
  btn.classList.toggle("cursor-not-allowed", !enabled);
  btn.classList.toggle("opacity-50", !enabled);

  if (!enabled) {
    btn.classList.remove("hover:bg-brand-dark/80");
  } else {
    btn.classList.add("hover:bg-brand-dark/80");
  }
}

function renderActionButtons(currentRole) {
  if (currentRole === "reserver") {
    createButton = addButton({
      label: "Create",
      type: "submit",
      value: "create",
      classes: BUTTON_ENABLED_CLASSES,
    });
  }

  if (currentRole === "admin") {
    createButton = addButton({
      label: "Create",
      type: "submit",
      value: "create",
      classes: BUTTON_ENABLED_CLASSES,
    });

    updateButton = addButton({
      label: "Update",
      type: "submit",
      value: "update",
      classes: BUTTON_ENABLED_CLASSES,
    });

    deleteButton = addButton({
      label: "Delete",
      type: "submit",
      value: "delete",
      classes: BUTTON_ENABLED_CLASSES,
    });
  }

  setButtonEnabled(createButton, false);
  setButtonEnabled(updateButton, false);
  setButtonEnabled(deleteButton, false);
}

// ===============================
// 3) Input creation + validation
// ===============================
function createResourceNameInput(container) {
  const input = document.createElement("input");
  input.id = "resourceName";
  input.name = "resourceName";
  input.type = "text";
  input.placeholder = "e.g., Meeting Room A";

  input.className = `
    mt-2 w-full rounded-2xl border border-black/10 bg-white
    px-4 py-3 text-sm outline-none
    focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30
  `;

  container.appendChild(input);
  return input;
}

// Validation rules
function isResourceNameValid(value) {
  const trimmed = value.trim();
  const allowedPattern = /^[a-zA-Z0-9äöåÄÖÅ ]+$/;
  return trimmed.length >= 5 && trimmed.length <= 30 && allowedPattern.test(trimmed);
}

function isResourceDescriptionValid(value) {
  const trimmed = value.trim();
  const allowedPattern = /^[a-zA-Z0-9äöåÄÖÅ ><!?\-+\/\\]+$/;
  return trimmed.length >= 10 && trimmed.length <= 50 && allowedPattern.test(trimmed);
}

function setInputVisualState(input, state) {
  input.classList.remove(
    "border-green-500",
    "bg-green-100",
    "focus:ring-green-500/30",
    "border-red-500",
    "bg-red-100",
    "focus:ring-red-500/30"
  );

  input.classList.add("focus:ring-2");

  if (state === "valid") {
    input.classList.add("border-green-500", "bg-green-100", "focus:ring-green-500/30");
  } else if (state === "invalid") {
    input.classList.add("border-red-500", "bg-red-100", "focus:ring-red-500/30");
  }
}

function attachResourceNameValidation(input) {
  const update = () => {
    const raw = input.value;

    resourceNameValid = isResourceNameValid(raw);
    setInputVisualState(input, resourceNameValid ? "valid" : "invalid");

    const allValid = resourceNameValid && resourceDescriptionValid;
    setButtonEnabled(createButton, allValid);
    setButtonEnabled(updateButton, allValid);
    setButtonEnabled(deleteButton, allValid);
  };

  input.addEventListener("input", update);
  update();
}

function createResourceDescriptionArea(container) {
  const textarea = document.createElement("textarea");
  textarea.id = "resourceDescription";
  textarea.name = "resourceDescription";
  textarea.rows = 5;
  textarea.placeholder = "Describe location, capacity, equipment…";

  textarea.className = `
    mt-2 w-full rounded-2xl border border-black/10 bg-white
    px-4 py-3 text-sm outline-none
    focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30
  `;

  container.appendChild(textarea);
  return textarea;
}

function attachResourceDescriptionValidation(textarea) {
  const update = () => {
    const raw = textarea.value;

    resourceDescriptionValid = isResourceDescriptionValid(raw);
    setInputVisualState(textarea, resourceDescriptionValid ? "valid" : "invalid");

    const allValid = resourceNameValid && resourceDescriptionValid;
    setButtonEnabled(createButton, allValid);
    setButtonEnabled(updateButton, allValid);
    setButtonEnabled(deleteButton, allValid);
  };

  textarea.addEventListener("input", update);
  update();
}

// ===============================
// 4) Bootstrapping
// ===============================
renderActionButtons(role);

const nameInput = createResourceNameInput(resourceNameCnt);
attachResourceNameValidation(nameInput);

const descArea = createResourceDescriptionArea(resourceDescriptionCnt);
attachResourceDescriptionValidation(descArea);