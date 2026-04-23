const API_BASE = "/api/persons";

let selectedPersonId = null;

const inputFirst   = document.getElementById("input-first-name");
const inputLast    = document.getElementById("input-last-name");
const inputEmail   = document.getElementById("input-email");
const inputPhone   = document.getElementById("input-phone");
const inputBirth   = document.getElementById("input-birth-date");
const btnSave      = document.getElementById("btn-save");
const btnDelete    = document.getElementById("btn-delete");
const btnClear     = document.getElementById("btn-clear");
const formTitle    = document.getElementById("form-title");
const statusMsg    = document.getElementById("status-message");
const customerList = document.getElementById("customer-list");

function showStatus(message, type) {
  statusMsg.textContent = message;
  statusMsg.className = type === "error" ? "status-error" : "status-success";
  statusMsg.style.display = "block";
  setTimeout(() => { statusMsg.style.display = "none"; }, 3500);
}

function clearForm() {
  selectedPersonId = null;
  inputFirst.value = "";
  inputLast.value  = "";
  inputEmail.value = "";
  inputPhone.value = "";
  inputBirth.value = "";
  formTitle.textContent   = "Add New Customer";
  btnSave.textContent     = "Add Customer";
  btnDelete.style.display = "none";
  document.querySelectorAll(".customer-item").forEach(el => el.classList.remove("selected"));
}

function renderCustomerList(persons) {
  customerList.innerHTML = "";
  if (!persons || persons.length === 0) {
    customerList.innerHTML = '<p class="no-customers">No customers yet.</p>';
    return;
  }
  persons.forEach(p => {
    const item = document.createElement("div");
    item.className = "customer-item";
    item.dataset.id = p.id;
    const initials = ((p.first_name?.[0] || "") + (p.last_name?.[0] || "")).toUpperCase();
    item.innerHTML = `
      <div class="customer-avatar">${initials}</div>
      <div class="customer-info">
        <span class="customer-name">${p.first_name} ${p.last_name}</span>
        <span class="customer-email">${p.email}</span>
      </div>`;
    item.addEventListener("click", () => selectPerson(p));
    customerList.appendChild(item);
  });
}

async function loadCustomers() {
  try {
    const res = await fetch(API_BASE);
    const persons = await res.json();
    renderCustomerList(persons);
  } catch (err) {
    customerList.innerHTML = '<p class="no-customers">Could not load customers.</p>';
  }
}

function selectPerson(p) {
  selectedPersonId    = p.id;
  inputFirst.value    = p.first_name  || "";
  inputLast.value     = p.last_name   || "";
  inputEmail.value    = p.email       || "";
  inputPhone.value    = p.phone       || "";
  inputBirth.value    = p.birth_date  ? p.birth_date.split("T")[0] : "";
  formTitle.textContent   = "Edit Customer";
  btnSave.textContent     = "Update Customer";
  btnDelete.style.display = "inline-block";
  document.querySelectorAll(".customer-item").forEach(el => {
    el.classList.toggle("selected", el.dataset.id == p.id);
  });
}

async function saveCustomer() {
  const data = {
    first_name: inputFirst.value.trim(),
    last_name:  inputLast.value.trim(),
    email:      inputEmail.value.trim(),
    phone:      inputPhone.value.trim(),
    birth_date: inputBirth.value,
  };
  if (!data.first_name || !data.last_name || !data.email) {
    showStatus("First name, last name and email are required.", "error");
    return;
  }
  try {
    const url    = selectedPersonId ? `${API_BASE}/${selectedPersonId}` : API_BASE;
    const method = selectedPersonId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Request failed");
    }
    showStatus(selectedPersonId ? "Customer updated!" : "Customer added!");
    clearForm();
    await loadCustomers();
  } catch (err) {
    showStatus("Error: " + err.message, "error");
  }
}

async function deleteCustomer() {
  if (!selectedPersonId) return;
  if (!confirm("Delete this customer? This cannot be undone.")) return;
  try {
    const res = await fetch(`${API_BASE}/${selectedPersonId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    showStatus("Customer deleted.");
    clearForm();
    await loadCustomers();
  } catch (err) {
    showStatus("Error: " + err.message, "error");
  }
}

btnSave.addEventListener("click", saveCustomer);
btnDelete.addEventListener("click", deleteCustomer);
btnClear.addEventListener("click", clearForm);

document.addEventListener("DOMContentLoaded", loadCustomers);