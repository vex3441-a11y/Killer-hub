const express = require("express");
const fs = require("fs-extra");
const path = require("path");

const app = express();

// middleware (sem body-parser)
app.use(express.json());

// servir arquivos da raiz (frontend)
app.use(express.static(__dirname));

// rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// caminho dos repositórios
const REPO_PATH = path.join(__dirname, "repos");

// garantir que a pasta existe (IMPORTANTE)
fs.ensureDirSync(REPO_PATH);

// =======================
// API
// =======================

// criar repo
app.post("/api/create-repo", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Nome inválido" });
    }

    const repoDir = path.join(REPO_PATH, name);
    await fs.ensureDir(repoDir);

    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar repo" });
  }
});

// listar repos
app.get("/api/repos", async (req, res) => {
  try {
    const repos = await fs.readdir(REPO_PATH);
    res.json(repos);
  } catch {
    res.json([]);
  }
});

// salvar arquivo
app.post("/api/save-file", async (req, res) => {
  try {
    const { repo, filename, content } = req.body;

    if (!repo || !filename) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const filePath = path.join(REPO_PATH, repo, filename);

    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content || "");

    res.json({ status: "salvo" });
  } catch {
    res.status(500).json({ error: "Erro ao salvar arquivo" });
  }
});

// listar arquivos do repo
app.get("/api/files/:repo", async (req, res) => {
  try {
    const dir = path.join(REPO_PATH, req.params.repo);
    const files = await fs.readdir(dir);
    res.json(files);
  } catch {
    res.json([]);
  }
});

// pegar conteúdo do arquivo
app.get("/api/file", async (req, res) => {
  try {
    const { repo, filename } = req.query;

    const filePath = path.join(REPO_PATH, repo, filename);
    const content = await fs.readFile(filePath, "utf-8");

    res.send(content);
  } catch {
    res.send("");
  }
});

// RAW (pra loadstring)
app.get("/raw/:repo/:file", async (req, res) => {
  try {
    const filePath = path.join(REPO_PATH, req.params.repo, req.params.file);
    const content = await fs.readFile(filePath, "utf-8");

    res.type("text/plain");
    res.send(content);
  } catch {
    res.status(404).send("erro");
  }
});

// =======================
// START SERVER (ESSENCIAL)
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 Killer Hub rodando na porta " + PORT);
});