const express = require("express");
const session = require("express-session");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

app.use(session({
  secret: "ljh-secret",
  resave: false,
  saveUninitialized: true
}));

const read = (file) => JSON.parse(fs.readFileSync(`./data/${file}`));
const write = (file, data) =>
  fs.writeFileSync(`./data/${file}`, JSON.stringify(data, null, 2));

if (!fs.existsSync("./data")) fs.mkdirSync("./data");
if (!fs.existsSync("./data/keys.json")) write("keys.json", []);
if (!fs.existsSync("./data/users.json")) write("users.json", [
  { username: "owner", password: "owner40028922", role: "owner" }
]);
if (!fs.existsSync("./data/logs.json")) write("logs.json", []);

function log(action) {
  const logs = read("logs.json");
  logs.push({ action, time: new Date().toISOString() });
  write("logs.json", logs);
}

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = read("users.json");

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) return res.json({ ok: false });

  req.session.user = user;
  res.json({ ok: true, user });
});

app.get("/keys", (req, res) => {
  const keys = read("keys.json");

  const updated = keys.map(k => {
    if (k.expiresAt && Date.now() > k.expiresAt) {
      k.status = "expired";
    }
    return k;
  });

  write("keys.json", updated);
  res.json(updated);
});

app.post("/generate", (req, res) => {
  const { amount, time } = req.body;
  const keys = read("keys.json");

  for (let i = 0; i < amount; i++) {
    const key = "LJH-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    keys.push({
      key,
      status: "available",
      createdAt: Date.now(),
      expiresAt: Date.now() + (time * 60000),
      usedBy: null
    });
  }

  write("keys.json", keys);
  log(`Generated ${amount} keys`);

  res.json({ ok: true });
});

app.post("/users/create", (req, res) => {
  const users = read("users.json");
  const { username, password } = req.body;

  users.push({ username, password, role: "mod" });

  write("users.json", users);
  log(`User created: ${username}`);

  res.json({ ok: true });
});

app.post("/keys/delete", (req, res) => {
  let keys = read("keys.json");
  const { key } = req.body;

  keys = keys.filter(k => k.key !== key);

  write("keys.json", keys);
  log(`Deleted key ${key}`);

  res.json({ ok: true });
});

app.listen(3000, () => console.log("Server running on port 3000"));
