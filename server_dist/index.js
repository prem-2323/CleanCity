// server/index.ts
import express from "express";
import * as mongoose3 from "mongoose";

// server/routes.ts
import { createServer } from "node:http";

// server/models/User.ts
import * as mongoose from "mongoose";
var userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ["citizen", "cleaner", "admin"],
    default: "citizen"
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
var User = mongoose.model("User", userSchema);

// server/models/Image.ts
import * as mongoose2 from "mongoose";
var imageSchema = new mongoose2.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  data: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    default: "image/jpeg"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
var ImageModel = mongoose2.model("Image", imageSchema);

// server/services/aiModelService.ts
import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
function getWorkspaceRoot() {
  return process.cwd();
}
function getPythonExecutable() {
  if (process.env.MODEL_PYTHON_PATH) {
    return process.env.MODEL_PYTHON_PATH;
  }
  const workspaceRoot = getWorkspaceRoot();
  const venvPython = path.join(workspaceRoot, ".venv-models", "Scripts", "python.exe");
  if (fs.existsSync(venvPython)) {
    return venvPython;
  }
  return "python";
}
function runPythonScript(scriptRelativePath, payload) {
  return new Promise((resolve2, reject) => {
    const workspaceRoot = getWorkspaceRoot();
    const scriptPath = path.join(workspaceRoot, scriptRelativePath);
    const pythonExe = getPythonExecutable();
    const child = spawn(pythonExe, [scriptPath], {
      cwd: workspaceRoot,
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      reject(error);
    });
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Python script failed with code ${code}`));
        return;
      }
      try {
        const parsed = JSON.parse(stdout);
        resolve2(parsed);
      } catch (error) {
        reject(new Error(`Invalid model response: ${String(error)}`));
      }
    });
    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}
function analyzeWasteWithModels(payload) {
  return runPythonScript("ai-models/scripts/analyze_image.py", payload);
}
function verifyCleanupWithModels(payload) {
  return runPythonScript("ai-models/scripts/verify_cleanup.py", payload);
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.post("/api/register", async (req, res) => {
    try {
      const { name, role, username, password } = req.body;
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = new User({ name, role, username, password });
      await user.save();
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username, password });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/users", async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/ai/analyze", async (req, res) => {
    try {
      const { imageSource, title, description, latitude, longitude, nearbyReportCount } = req.body ?? {};
      if (!imageSource || !title) {
        return res.status(400).json({ message: "imageSource and title are required" });
      }
      const result = await analyzeWasteWithModels({
        imageSource: String(imageSource),
        title: String(title),
        description: description ? String(description) : "",
        latitude: latitude != null ? Number(latitude) : void 0,
        longitude: longitude != null ? Number(longitude) : void 0,
        nearbyReportCount: nearbyReportCount != null ? Number(nearbyReportCount) : 1
      });
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message || "AI analyze failed" });
    }
  });
  app2.post("/api/ai/verify-cleanup", async (req, res) => {
    try {
      const { beforeImageSource, afterImageSource, severityScore } = req.body ?? {};
      if (!afterImageSource) {
        return res.status(400).json({ message: "afterImageSource is required" });
      }
      const result = await verifyCleanupWithModels({
        beforeImageSource: beforeImageSource ? String(beforeImageSource) : void 0,
        afterImageSource: String(afterImageSource),
        severityScore: Number(severityScore ?? 60)
      });
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message || "AI verify failed" });
    }
  });
  app2.get("/api/geocode/reverse", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ message: "lat and lon query params are required" });
      }
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`;
      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "CleanCity-App/1.0 (civic-waste-reporting)"
        }
      });
      if (!response.ok) {
        return res.status(response.status).json({ message: "Nominatim request failed" });
      }
      const data = await response.json();
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ message: error.message || "Geocode reverse failed" });
    }
  });
  app2.post("/api/images/upload", async (req, res) => {
    try {
      const { key, data } = req.body ?? {};
      if (!key || !data) {
        return res.status(400).json({ message: "key and data are required" });
      }
      const ctMatch = String(data).match(/^data:(image\/[a-z+]+);base64,/i);
      const contentType = ctMatch ? ctMatch[1] : "image/jpeg";
      await ImageModel.findOneAndUpdate(
        { key },
        { key, data: String(data), contentType, createdAt: /* @__PURE__ */ new Date() },
        { upsert: true, new: true }
      );
      const url = `/api/images/${encodeURIComponent(key)}`;
      return res.json({ url, key });
    } catch (error) {
      return res.status(500).json({ message: error.message || "Image upload failed" });
    }
  });
  app2.get("/api/images/:key", async (req, res) => {
    try {
      const doc = await ImageModel.findOne({ key: req.params.key });
      if (!doc) {
        return res.status(404).json({ message: "Image not found" });
      }
      const dataUrl = doc.data;
      const commaIdx = dataUrl.indexOf(",");
      if (commaIdx === -1) {
        return res.status(500).json({ message: "Malformed image data" });
      }
      const base64 = dataUrl.substring(commaIdx + 1);
      const buffer = Buffer.from(base64, "base64");
      res.set("Content-Type", doc.contentType || "image/jpeg");
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      return res.send(buffer);
    } catch (error) {
      return res.status(500).json({ message: error.message || "Image fetch failed" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
import * as fs2 from "fs";
import * as path2 from "path";
var app = express();
var log = console.log;
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origins = /* @__PURE__ */ new Set();
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }
    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }
    const origin = req.header("origin");
    const isLocalhost = origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:");
    if (origin && (origins.has(origin) || isLocalhost)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}
function setupBodyParsing(app2) {
  app2.use(
    express.json({
      limit: "50mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express.urlencoded({ extended: false, limit: "50mb" }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path3 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path3.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path2.resolve(process.cwd(), "app.json");
    const appJsonContent = fs2.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path2.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs2.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs2.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);
  const html = landingPageTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl).replace(/EXPS_URL_PLACEHOLDER/g, expsUrl).replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  const templatePath = path2.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs2.readFileSync(templatePath, "utf-8");
  const appName = getAppName();
  log("Serving static Expo files with dynamic manifest routing");
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName
      });
    }
    next();
  });
  app2.use("/assets", express.static(path2.resolve(process.cwd(), "assets")));
  app2.use(express.static(path2.resolve(process.cwd(), "static-build")));
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
}
(async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }
  try {
    console.log("Connecting to MongoDB...");
    await mongoose3.connect(process.env.DATABASE_URL);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);
  configureExpoAndLanding(app);
  const server = await registerRoutes(app);
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0"
    },
    () => {
      log(`express server serving on port ${port}`);
    }
  );
})();
