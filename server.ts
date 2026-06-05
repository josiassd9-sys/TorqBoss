import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { geminiService } from "./src/services/geminiService.impl.js";

const __dirname = process.cwd();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

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

  // AI API Endpoints
  app.post("/api/gemini/settings", (req, res) => {
    const { apiKey, settings } = req.body;
    if (apiKey) geminiService.setApiKey(apiKey);
    if (settings) geminiService.setGlobalSettings(settings);
    res.json({ status: "ok" });
  });

  app.post("/api/gemini/call", async (req, res) => {
    const { method, args } = req.body;
    
    if (!method || !geminiService[method as keyof typeof geminiService]) {
      return res.status(400).json({ error: `Method ${method} not found in geminiService` });
    }

    try {
      const fn = geminiService[method as keyof typeof geminiService] as Function;
      const result = await fn(...(args || []));
      res.json(result);
    } catch (error: any) {
      console.error(`Error calling ${method}:`, error);
      res.status(500).json({ error: error.message || "Internal AI Error" });
    }
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
