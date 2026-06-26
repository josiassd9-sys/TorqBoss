import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { geminiService } from "./src/services/geminiService.impl.js";

let geminiRequestSequence = 0;

const summarizeForLog = (value: unknown, depth = 0): unknown => {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    return value.length > 180 ? `${value.slice(0, 180)}...` : value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    if (depth >= 2) return `[Array(${value.length})]`;
    return value.slice(0, 5).map((item) => summarizeForLog(item, depth + 1));
  }
  if (typeof value === 'object') {
    if (depth >= 2) return '[Object]';

    const entries = Object.entries(value as Record<string, unknown>).slice(0, 8);
    const summarized = entries.reduce<Record<string, unknown>>((acc, [key, entryValue]) => {
      const normalizedKey = key.toLowerCase();
      if (normalizedKey.includes('key') || normalizedKey.includes('token') || normalizedKey.includes('secret') || normalizedKey.includes('authorization')) {
        acc[key] = '[REDACTED]';
        return acc;
      }
      acc[key] = summarizeForLog(entryValue, depth + 1);
      return acc;
    }, {});

    const totalKeys = Object.keys(value as Record<string, unknown>).length;
    if (totalKeys > entries.length) {
      summarized.__truncatedKeys = totalKeys - entries.length;
    }

    return summarized;
  }
  return String(value);
};

const summarizeResult = (value: unknown): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `string(len=${value.length})`;
  if (typeof value === 'number' || typeof value === 'boolean') return `${typeof value}(${String(value)})`;
  if (Array.isArray(value)) return `array(len=${value.length})`;
  if (typeof value === 'object') return `object(keys=${Object.keys(value as Record<string, unknown>).length})`;
  return typeof value;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // CORS — permite Capacitor, localhost e origens externas para requests machine-to-machine
  const ALLOWED_ORIGINS = new Set([
    'capacitor://localhost',
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:5173',
    'ionic://localhost',
    'https://localhost',
    'https://torqboss.com',       // Adicione o seu domínio
    'https://www.torqboss.com',   // Adicione com www também
  ]);

  app.use((req, res, next) => {
    const origin = req.headers.origin || '';
    const isAllowed = ALLOWED_ORIGINS.has(origin) || !origin; // sem origin = requisição direta (curl, APK)
    res.setHeader('Access-Control-Allow-Origin', isAllowed ? (origin || '*') : '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Middleware for basic logging
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API ${req.method}] ${req.path} - ${new Date().toISOString()}`);
    }
    next();
  });

  // API Route for Dev Documentation
  app.get("/api/dev/docs/:filename", async (req, res) => {
    const { filename } = req.params;
    const allowedFiles = ["README.md", "LOGICA_NEGOCIO.md", "security_spec.md", "MONETIZACAO_PLATAFORMA.md", "MARKETING_PLAYSTORE.md", "COMO_GERAR_APK.md"];
    
    if (!allowedFiles.includes(filename)) {
      return res.status(403).json({ error: "Access denied" });
    }

    try {
      const filePath = path.join(process.cwd(), filename);
      const content = await fs.readFile(filePath, "utf-8");
      res.json({ content });
    } catch (error) {
      res.status(404).json({ error: "File not found" });
    }
  });

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  app.use('/api/gemini', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  // AI API Endpoints
  app.post("/api/gemini/settings", (req, res) => {
    const { apiKey, settings } = req.body;
    if (apiKey) geminiService.setApiKey(apiKey);
    if (settings) geminiService.setGlobalSettings(settings);
    res.json({ status: "ok" });
  });

  app.post("/api/gemini/call", async (req, res) => {
    const { method, args } = req.body;
    const requestId = `gem-${++geminiRequestSequence}`;
    const startedAt = Date.now();

    console.log(`[SERVER][${requestId}] POST /api/gemini/call recebido`);
    console.log(`[SERVER][${requestId}] method=${String(method || '(undefined)')} args=${Array.isArray(args) ? args.length : 0}`);
    console.log(`[SERVER][${requestId}] payload=${JSON.stringify(summarizeForLog(req.body))}`);
    
    if (!method || !geminiService[method as keyof typeof geminiService]) {
      console.warn(`[SERVER][${requestId}] metodo invalido: ${String(method || '(undefined)')}`);
      return res.status(400).json({ error: `Method ${method} not found in geminiService` });
    }

    try {
      const fn = geminiService[method as keyof typeof geminiService] as Function;
      console.log(`[SERVER][${requestId}] chamando geminiService.${method}`);
      const result = await fn(...(args || []));
      const elapsed = Date.now() - startedAt;
      console.log(`[SERVER][${requestId}] resposta geminiService.${method} em ${elapsed}ms | ${summarizeResult(result)}`);
      console.log(`[SERVER][${requestId}] enviando resposta ao cliente`);
      res.json(result);
    } catch (error: any) {
      const elapsed = Date.now() - startedAt;
      console.error(`[SERVER][${requestId}] erro em geminiService.${method} apos ${elapsed}ms`, error);
      res.status(500).json({ error: error.message || "Internal AI Error" });
    }
  });

  app.use('/api/gemini', (req, res) => {
    res.status(404).json({ error: 'Gemini endpoint not found' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
