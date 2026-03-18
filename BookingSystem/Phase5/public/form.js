// ===============================
// Form handling for resources page
// ===============================

// -------------- Helpers --------------
function $(id) {
  return document.getElementById(id);
}

function getFormMessageEl() {
  return document.getElementById("formMessage");
}

/**
 * Show a success/error/info message in the UI.
 * type: "success" | "error" 
 * (Teacher wants all errors in red → "info" removed for errors)
 */
function showFormMessage(type, message) {
  const el = getFormMessageEl();
  if (!el) return;

  // Reset classes
  el.className = "mt-6 rounded-2xl border px-4 py-3 text-sm whitespace-pre-line";
  el.classList.remove("hidden");

  // Type-specific styling
  if (type === "success") {
    el.classList.add("border-emerald-200", "bg-emerald-50", "text-emerald-900");
  } else {
    // 🔴 ERROR (default) – ALL errors must be red, as teacher wants
    el.classList.add("border-rose-200", "bg-rose-50", "text-rose-900");
  }

  el.textContent = message;
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function clearFormMessage() {
  const el = getFormMessageEl();
  if (!el) return;
  el.textContent = "";
  el.classList.add("hidden");
}

// Timestamp (for logging)
function timestamp() {
  const now = new Date();
  return now.toISOString().replace("T", " ").replace("Z", "");
}

/**
 * Try to read JSON from the response.
 */
async function readResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return { ok: false, error: "Invalid JSON response" };
    }
  }

  const text = await response.text().catch(() => "");
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: "Non-JSON response", raw: text };
  }
}

/**
 * Build a readable message for field validation errors
 */
function buildValidationMessage(errors) {
  if (!Array.isArray(errors) || errors.length === 0) {
    return "Some fields are invalid. Please check your input.";
  }

  const lines = errors.map((e) => {
    const field = e.field || "field";
    const msg = e.msg || "Invalid value";
    return `• ${field}: ${msg}`;
  });

  return `The following fields contain errors:\n\n${lines.join("\n")}`;
}

/**
 * Build a readable message for generic API errors.
 */
function buildGenericErrorMessage(status, body) {
  const details = body?.details ? `\n\nDetails: ${body.details}` : "";
  const error = body?.error ? body.error : "Request failed";
  return `Server returned an error (${status}).\n\nReason: ${error}${details}`;
}

// -------------- Form wiring --------------
document.addEventListener("DOMContentLoaded", () => {
  const form = $("resourceForm");
  if (!form) return;
  form.addEventListener("submit", onSubmit);
});

async function onSubmit(event) {
  event.preventDefault();

  const submitter = event.submitter;
  const actionValue = submitter && submitter.value ? submitter.value : "create";

  const selectedUnit =
    document.querySelector('input[name="resourcePriceUnit"]:checked')?.value ?? "";

  const priceRaw = $("resourcePrice")?.value ?? "";
  const resourcePrice = priceRaw === "" ? 0 : Number(priceRaw);

  const payload = {
    action: actionValue,
    resourceName: $("resourceName")?.value ?? "",
    resourceDescription: $("resourceDescription")?.value ?? "",
    resourceAvailable: $("resourceAvailable")?.checked ?? false,
    resourcePrice,
    resourcePriceUnit: selectedUnit,
  };

  try {
    clearFormMessage();

    const response = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await readResponseBody(response);

    // -----------------------------------------
    // Error handling
    // -----------------------------------------
    if (!response.ok) {

      // 400 validation
      if (response.status === 400) {
        const msg = buildValidationMessage(body?.errors);
        showFormMessage(
          "error",
          `❌ Invalid input.\n\n${msg}\n\nPlease fix the highlighted fields and try again.`
        );
        return;
      }

      // 409 duplicate
      if (response.status === 409) {
        const existingName = payload.resourceName || "this name";
        const extra = body?.details ? `\n\nDetails: ${body.details}` : "";
        showFormMessage(
          "error",    // 🔴 changed from "info" → teacher wants all errors RED
          `❌ This resource already exists: “${existingName}”.\n\n` +
            `Try a different name or check the list.${extra}`
        );
        return;
      }

      // Other server errors
      showFormMessage("error", buildGenericErrorMessage(response.status, body));
      return;
    }

    // -----------------------------------------
    // Success handling (201)
    // -----------------------------------------
    const createdName = body?.data?.name ?? payload.resourceName ?? "";

    // Teacher does NOT want ID or timestamp in success message
    showFormMessage(
      "success",
      `✅ Resource “${createdName}” was created successfully.`
    );

    $("resourceForm")?.reset();

    if (typeof window.onResourceActionSuccess === "function") {
      window.onResourceActionSuccess({
        action: actionValue,
        data: "success"
      });
    }

  } catch (err) {
    console.error(`[${timestamp()}] POST /api/resources failed:`, err);
    showFormMessage("error", "Network error: Could not reach the server.");
  }
}