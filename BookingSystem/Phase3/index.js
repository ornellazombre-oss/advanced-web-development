require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Timestamp helper
function timestamp() {
  const now = new Date();
  return now.toISOString().replace("T", " ").replace("Z", "");
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve ./public folder
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/resources", (req, res) => {
  res.sendFile(path.join(publicDir, "resources.html"));
});

app.post("/api/resources", (req, res) => {
  const {
    action = "",
    resourceName = "",
    resourceDescription = "",
    resourceAvailable = false,
    resourcePrice = 0,
    resourcePriceUnit = "",
  } = req.body || {};

  const resourceAction = String(action).trim();
  const name = String(resourceName).trim();
  const description = String(resourceDescription).trim();
  const available = Boolean(resourceAvailable);
  const price = Number.isFinite(Number(resourcePrice))
    ? Number(resourcePrice)
    : 0;
  const unit = String(resourcePriceUnit || "").trim();

  console.log(`Client POST request [${timestamp()}]`);
  console.log("--------------------------");
  console.log("Action:", resourceAction);
  console.log("Name:", name);
  console.log("Description:", description);
  console.log("Available:", available);
  console.log("Price:", price);
  console.log("Unit:", unit);
  console.log("--------------------------");

  return res.json({ ok: true, echo: req.body });
});

// API 404 fallback
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});