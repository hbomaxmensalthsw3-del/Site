const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function generateKey() {
  const part = () => crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${part()}-${part()}-${part()}-${part()}`;
}

router.post("/verify", async (req, res) => {
  const { key, hwid } = req.body;
  if (!key || !hwid) return res.json({ success: false, error: "Missing key or hwid" });

  const { rows } = await db.query("SELECT * FROM keys WHERE key_value = $1", [key]);
  const row = rows[0];
  if (!row) return res.json({ success: false, error: "Invalid key" });

  const now = new Date();
  if (row.expires_at && new Date(row.expires_at) < now) {
    await db.query("UPDATE keys SET status='expired' WHERE id=$1", [row.id]);
    return res.json({ success: false, error: "Key has expired" });
  }
  if (row.status === "expired") return res.json({ success: false, error: "Key has expired" });

  if (row.status === "active") {
    await db.query("UPDATE keys SET status='redeemed', hwid=$1, redeemed_at=$2 WHERE id=$3", [hwid, now, row.id]);
    return res.json({ success: true });
  }

  if (row.status === "redeemed") {
    if (row.hwid === hwid) return res.json({ success: true });
    return res.json({ success: false, error: "HWID mismatch" });
  }

  res.json({ success: false, error: "Key not active" });
});

router.get("/", requireAuth, async (req, res) => {
  const status = req.query.status || "all";
  const where = status !== "all" ? "WHERE status = $1" : "";
  const params = status !== "all" ? [status] : [];
  const { rows } = await db.query(`SELECT * FROM keys ${where} ORDER BY created_at DESC`, params);
  const total = rows.length;
  res.json({ keys: rows, total });
});

router.post("/create", requireAuth, async (req, res) => {
  const { note, expiresInDays } = req.body;
  const keyValue = generateKey();
  const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 86400000) : null;

  const { rows } = await db.query(
    "INSERT INTO keys (key_value, note, expires_at) VALUES ($1, $2, $3) RETURNING *",
    [keyValue, note || null, expiresAt]
  );
  res.json({ key: rows[0] });
});

router.post("/bulk", requireAuth, async (req, res) => {
  const { count = 1, note, expiresInDays } = req.body;
  const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 86400000) : null;
  const keys = [];

  for (let i = 0; i < Math.min(count, 100); i++) {
    const keyValue = generateKey();
    const { rows } = await db.query(
      "INSERT INTO keys (key_value, note, expires_at) VALUES ($1, $2, $3) RETURNING *",
      [keyValue, note || null, expiresAt]
    );
    keys.push(rows[0]);
  }

  res.json({ keys, count: keys.length });
});

router.delete("/:id", requireAuth, async (req, res) => {
  await db.query("DELETE FROM keys WHERE id = $1", [req.params.id]);
  res.json({ success: true });
});

router.get("/stats", requireAuth, async (req, res) => {
  const { rows } = await db.query(`
    SELECT
      COUNT(*) FILTER (WHERE status != 'expired') AS total_keys,
      COUNT(*) FILTER (WHERE status = 'active') AS active_keys,
      COUNT(*) FILTER (WHERE status = 'redeemed') AS redeemed_keys,
      COUNT(*) FILTER (WHERE status = 'expired') AS expired_keys
    FROM keys
  `);
  const r = rows[0];
  res.json({
    totalKeys: parseInt(r.total_keys),
    activeKeys: parseInt(r.active_keys),
    redeemedKeys: parseInt(r.redeemed_keys),
    expiredKeys: parseInt(r.expired_keys),
  });
});

router.post("/:id/reset-hwid", requireAuth, async (req, res) => {
  await db.query("UPDATE keys SET hwid=NULL, status='active', redeemed_at=NULL WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
