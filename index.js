require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const keysRouter = require("./routes/keys");
const authRouter = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/healthz", (_req, res) => res.json({ status: "ok" }));
app.use("/api/keys", keysRouter);
app.use("/api/auth", authRouter);

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => console.log(`Project Void rodando na porta ${PORT}`));
