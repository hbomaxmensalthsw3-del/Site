const express = require("express");
const session = require("express-session");

const app = express();

const PORT = process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// =========================
// SESSÃO
// =========================
app.use(session({
  secret: "ljh_secret_key_123",
  resave: false,
  saveUninitialized: false
}));

// =========================
// HOME
// =========================
app.get("/", (req, res) => {
  res.redirect("/login");
});

// =========================
// LOGIN PAGE
// =========================
app.get("/login", (req, res) => {
  res.send(`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>

      <body style="
        margin:0;
        background:#111;
        color:white;
        font-family:Arial;
        display:flex;
        justify-content:center;
        align-items:center;
        height:100vh;
        font-size:20px;
      ">

        <form method="POST" action="/login" style="
          display:flex;
          flex-direction:column;
          gap:15px;
          width:320px;
          padding:25px;
          background:#1a1a1a;
          border-radius:12px;
        ">

          <h2 style="text-align:center;font-size:32px;">LOGIN 🔐</h2>

          <input name="username" placeholder="Usuário" style="padding:12px;font-size:18px;">
          <input name="password" type="password" placeholder="Senha" style="padding:12px;font-size:18px;">

          <button style="
            padding:12px;
            font-size:18px;
            background:#2b6fff;
            color:white;
            border:none;
            border-radius:6px;
          ">
            Entrar
          </button>

        </form>

      </body>
    </html>
  `);
});

// =========================
// LOGIN (SESSION)
// =========================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "owner" && password === "owner40028922") {
    req.session.user = username;
    return res.json({ ok: true });
  }

  return res.json({ ok: false });
});

// =========================
// DASHBOARD PROTEGIDO
// =========================
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.send(`
    <html>
      <body style="
        background:#0d0d0d;
        color:white;
        font-family:Arial;
        padding:30px;
        font-size:20px;
      ">

        <h1 style="font-size:40px;">PAINEL OWNER 🔥</h1>

        <p>Logado como: ${req.session.user}</p>

        <div style="
          margin-top:20px;
          padding:20px;
          background:#1a1a1a;
          border-radius:10px;
        ">
          Bem-vindo ao sistema
        </div>

        <div style="margin-top:30px;">
          <button onclick="location.href='/logout'" style="
            padding:12px;
            font-size:18px;
            background:red;
            color:white;
            border:none;
            border-radius:6px;
          ">
            Sair
          </button>
        </div>

      </body>
    </html>
  `);
});

// =========================
// LOGOUT
// =========================
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// =========================
// START
// =========================
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server rodando na porta " + PORT);
});
