// Wrapper Node standalone para servir o build SSR do TanStack Start.
// O dist/server/server.js exporta um handler { fetch(request) } no padrão Web.
// Este script cria um servidor HTTP Node que converte req/res ↔ Request/Response.
import { createServer } from "node:http";
import { Readable } from "node:stream";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { resolve, dirname, extname, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

// Carrega .env do diretório do projeto ANTES de importar o handler SSR,
// pois start.ts roda verifyServerEnv() no top-level do módulo.
try {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const envPath = resolve(__dirname, ".env");
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    let val = m[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[m[1]] === undefined) process.env[m[1]] = val;
  }
  console.log("[server-node] .env carregado de", envPath);
} catch (e) {
  console.warn("[server-node] não foi possível carregar .env:", e.message);
}

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const ROOT_DIR = dirname(fileURLToPath(import.meta.url));
const STATIC_DIRS = [resolve(ROOT_DIR, "dist/client"), resolve(ROOT_DIR, ".output/public")];

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const mod = await import("./dist/server/server.js");
const handler = mod.default ?? mod;

if (typeof handler?.fetch !== "function") {
  console.error("[server-node] dist/server/server.js não exporta { fetch }. Build inválido.");
  process.exit(1);
}

function nodeReqToWebRequest(req) {
  const proto = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host || `localhost:${PORT}`;
  const url = `${proto}://${host}${req.url}`;
  const method = req.method || "GET";
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) v.forEach((vv) => headers.append(k, vv));
    else if (v != null) headers.set(k, String(v));
  }
  const init = { method, headers };
  if (method !== "GET" && method !== "HEAD") {
    init.body = Readable.toWeb(req);
    init.duplex = "half";
  }
  return new Request(url, init);
}

async function webResponseToNodeRes(response, res) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  if (!response.body) return res.end();
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(value);
  }
  res.end();
}

function tryServeStatic(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") return false;

  const { pathname } = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (!pathname.startsWith("/assets/") && pathname !== "/favicon.ico") return false;

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    res.statusCode = 400;
    res.end("Bad Request");
    return true;
  }

  const relativePath = normalize(decodedPath.replace(/^\/+/, ""));
  if (relativePath.startsWith("..") || relativePath.includes(`${sep}..${sep}`)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return true;
  }

  for (const dir of STATIC_DIRS) {
    const filePath = resolve(dir, relativePath);
    if (!filePath.startsWith(dir + sep) || !existsSync(filePath)) continue;
    const stat = statSync(filePath);
    if (!stat.isFile()) continue;

    res.statusCode = 200;
    res.setHeader("Content-Type", MIME_TYPES[extname(filePath)] || "application/octet-stream");
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Cache-Control", pathname.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "public, max-age=3600");
    if (req.method === "HEAD") return res.end(), true;
    createReadStream(filePath).pipe(res);
    return true;
  }

  return false;
}

const server = createServer(async (req, res) => {
  try {
    if (tryServeStatic(req, res)) return;

    const request = nodeReqToWebRequest(req);
    const response = await handler.fetch(request, process.env, {});
    await webResponseToNodeRes(response, res);
  } catch (err) {
    console.error("[server-node] handler error:", err);
    if (!res.headersSent) res.statusCode = 500;
    res.end("Internal Server Error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[server-node] listening on http://${HOST}:${PORT}`);
});
