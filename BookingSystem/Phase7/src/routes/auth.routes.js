import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db/pool.js";
import { validationResult } from "express-validator";
import { registerValidators, loginValidators } from "../validators/auth.validators.js";
import { logEvent } from "../services/log.service.js";

const router = express.Router();

/* =====================================================
   REGISTER
===================================================== */
router.post("/register", registerValidators, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errors.array().map((e) => ({
        field: e.path,
        msg: e.msg,
      })),
    });
  }

  const { firstName, lastName, email, password, role } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const insertSql = `
      INSERT INTO users (first_name, last_name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, first_name, last_name, email, role, created_at
    `;

    const params = [
      firstName,
      lastName,
      email.toLowerCase().trim(),
      passwordHash,
      role,
    ];

    const { rows } = await pool.query(insertSql, params);
    const user = rows[0];

    await logEvent({
      actorUserId: user.id,
      action: "register",
      message: `User registered (ID ${user.id})`,
      entityType: "user",
      entityId: user.id,
    });

    return res.status(201).json({
      ok: true,
      data: user,
    });

  } catch (err) {
    if (err?.code === "23505") {
      return res.status(409).json({
        ok: false,
        error: "Email already in use",
      });
    }

    console.error("REGISTER failed:", err);
    return res.status(500).json({
      ok: false,
      error: "Database error",
    });
  }
});

/* =====================================================
   LOGIN
===================================================== */
router.post("/login", loginValidators, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errors.array().map((e) => ({
        field: e.path,
        msg: e.msg,
      })),
    });
  }

  const { email, password } = req.body;

  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email = $1 LIMIT 1",
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        ok: false,
        error: "Invalid email or password",
      });
    }

    const user = rows[0];
    const passwordOk = await bcrypt.compare(password, user.password_hash);

    if (!passwordOk) {
      return res.status(401).json({
        ok: false,
        error: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      ok: true,
      data: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("LOGIN failed:", err);
    return res.status(500).json({
      ok: false,
      error: "Database error",
    });
  }
});

/* =====================================================
   GET CURRENT USER
===================================================== */
router.get("/me", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ ok: false, error: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return res.status(200).json({
      ok: true,
      data: decoded,
    });

  } catch (err) {
    return res.status(401).json({ ok: false, error: "Invalid token" });
  }
});

export default router;
router.post("/logout", (req, res) => {
  res.clearCookie("token");   
  return res.json({ ok: true });
});