const express = require("express");
const app = express();

const PORT = process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// HEALTH CHECK (importante no Railway)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// HOME
app.get("/", (req, res) => {
  res.redirect("/login");
});

// LOGIN
app.get("/login", (req, res) => {
  res.send(`
    <html>
      <body style="background:#111;color:white;font-family:Arial;display:flex;justify-content:center;align-items:center;height:100vh;">
        <form method="POST" action="/login" style="display:flex;flex-direction:column;gap:10px;width:200px;">
          <h2>Login</h2>
          <input name="user" placeholder="Usuário" style="padding:8px;">
          <input name="pass" type="password" placeholder="Senha" style="padding:8px;">
          <button style="padding:8px;background:green;color:white;">Entrar</button>
        </form>
      </body>
    </html>
  `);
});

// LOGIN POST
app.post("/login", (req, res) => {
  const { user, pass } = req.body;

  if (user === "owner" && pass === "owner40028922") {
    return res.redirect("/dashboard");
  }

  return res.send("Login inválido ❌");
});

// DASHBOARD
app.get("/dashboard", (req, res) => {
  res.send(`
    <html>
      <body style="background:#0d0d0d;color:white;font-family:Arial;padding:20px;">
        <h1>Dashboard 🔥</h1>
        <p>Bem-vindo ao painel owner</p>
        <button onclick="location.href='/login'">Sair</button>
      </body>
    </html>
  `);
});

// START
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server rodando na porta " + PORT);
});
