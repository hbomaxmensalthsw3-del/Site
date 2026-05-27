require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function setup() {
  console.log("Criando tabelas...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS keys (
      id SERIAL PRIMARY KEY,
      key_value TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'active',
      note TEXT,
      redeemed_by TEXT,
      redeemed_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ,
      hwid TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const ownerPassword = process.env.OWNER_PASSWORD || "owner40028922";
  const hash = await bcrypt.hash(ownerPassword, 10);

  await pool.query(`
    INSERT INTO admin_users (username, password_hash, role)
    VALUES ('owner', $1, 'owner')
    ON CONFLICT (username) DO UPDATE SET password_hash = $1;
  `, [hash]);

  console.log("Pronto! Owner criado com a senha do .env");
  await pool.end();
}

setup().catch(console.error);
