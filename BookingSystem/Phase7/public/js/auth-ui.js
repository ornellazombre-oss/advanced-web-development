
export function getTokenPayload() {
  return { role: "user" }; 
}

// Role detection no longer comes from token.
// You may extend this later by hitting /api/auth/me if needed.
export async function getCurrentUser() {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    const json = await res.json();
    if (json.ok) return json.data;
  } catch (err) {
    console.error("Auth error:", err);
  }
  return null;
}

// Show/hide links based on being logged in (cookie present)
export function updateAuthLinks() {
  const authLinks = document.querySelectorAll(".auth-link");

  authLinks.forEach((link) => {
    if (link.dataset.auth === "guest") {
      link.classList.add("hidden"); // guest links hidden when logged in
    }
    if (link.dataset.auth === "user") {
      link.classList.remove("hidden"); // user links shown
    }
  });
}

// Resource links become clickable when authenticated
export function updateResourceLinks() {
  const resLinks = document.querySelectorAll(".res-link");

  resLinks.forEach((link) => {
    link.classList.remove("cursor-not-allowed", "pointer-events-none");
  });
}

export function updateHomePageUI() {
  // Optional: you may add UI decorations here
  // Backend authentication already works.
}

export function initAuthUI() {
  updateAuthLinks();
  updateResourceLinks();
}

// Logout: ask backend to clear the cookie
export function logout() {
  fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include"
  }).finally(() => {
    window.location.href = "/login";
  });
}


export function showAccessDenied() {
  const main = document.getElementById("mainContent");
  if (!main) return;

  main.innerHTML = `
    <div class="max-w-xl mx-auto text-center mt-20">
      <h1 class="text-3xl font-bold text-red-600 mb-4">Access denied</h1>
      <p class="text-gray-600 mb-6">
        Authentication is required to access this page. Please sign in first.
      </p>
      <a href="/login"
        class="inline-block rounded-xl bg-brand-primary px-6 py-3 text-white font-semibold hover:bg-brand-dark/80">
        Go to login
      </a>
    </div>
  `;
}

// No more local token verification
export function requireAuthOrBlockPage() {
  return true; // backend already blocks unauthenticated access
}