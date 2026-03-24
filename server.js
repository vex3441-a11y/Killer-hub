const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs-extra");
const path = require("path");

const app = express();

// middleware
app.use(bodyParser.json());

// servir arquivos da raiz (index.html, repo.html, editor.html)
app.use(express.static(__dirname));

// rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// caminho dos repositórios
const REPO_PATH = path.join(__dirname, "repos");

// criar repo
app.post("/api/create-repo", async (req, res) => {
  const { name } = req.body;

  const repoDir = path.join(REPO_PATH, name);
  await fs.ensureDir(repoDir);

  res.json({ status: "ok" });
});

// listar repos
app.get("/api/repos", async (req, res) => {
  const repos = await fs.readdir(REPO_PATH).catch(() => []);
  res.json(repos);
});

// salvar arquivo
app.post("/api/save-file", async (req, res) => {
  const { repo, filename, content } = req.body;

  const filePath = path.join(REPO_PATH, repo, filename);
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content);

  res.json({ status: "salvo" });
});

// listar arquivos do repo
app.get("/api/files/:repo", async (req, res) => {
  const repo = req.params.repo;

  const dir = path.join(REPO_PATH, repo);
  const files = await fs.readdir(dir).catch(() => []);

  res.json(files);
});

// pegar conteúdo do arquivo
app.get("/api/file", async (req, res) => {
  const { repo, filename } = req.query;

  const filePath = path.join(REPO_PATH, repo, filename);
  const content = await fs.readFile(filePath, "utf-8").catch(() => "");

  res.send(content);
});

// RAW (pra loadstring)
app.get("/raw/:repo/:file", async (req, res) => {
  const filePath = path.join(REPO_PATH, req.params.repo, req.params.file);
  const content = await fs.readFile(filePath, "utf-8").catch(() => "erro");

  res.type("text/plain");
  res.send(content);
});

// iniciar servidor (IMPORTANTE pro Railway)
app.listen(process.env.PORT || 3000, () => {
  console.log("🔥 Killer Hub rodando");
});