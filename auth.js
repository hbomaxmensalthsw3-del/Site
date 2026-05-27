const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { requireOwner, getSecret } = require("../middleware/auth");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing fields" });

  const { rows } = await db.query("SELECT * FROM admin_users WHERE username=$1", [username]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, getSecret(), { expiresIn: "7d" });

  res.json({ id: user.id, username: user.username, role: user.role, token });
});

router.post("/logout", (_req, res) => res.json({ success: true }));

router.get("/me", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
  try {
    const payload = jwt.verify(auth.slice(7), getSecret());
    res.json({ id: payload.id, username: payload.username, role: payload.role });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

router.get("/users", requireOwner, async (req, res) => {
  const { rows } = await db.query("SELECT id, username, role, created_at FROM admin_users ORDER BY id");
  res.json({ users: rows });
});

router.post("/users", requireOwner, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing fields" });
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await db.query(
    "INSERT INTO admin_users (username, password_hash, role) VALUES ($1, $2, 'admin') RETURNING id, username, role, created_at",
    [username, hash]
  );
  res.json({ user: rows[0] });
});

router.delete("/users/:id", requireOwner, async (req, res) => {
  const { rows } = await db.query("SELECT role FROM admin_users WHERE id=$1", [req.params.id]);
  if (rows[0]?.role === "owner") return res.status(403).json({ error: "Cannot delete owner" });
  await db.query("DELETE FROM admin_users WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
