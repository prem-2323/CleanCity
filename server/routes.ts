import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { User } from "./models/User";
import { ImageModel } from "./models/Image";
import { analyzeWasteWithModels, verifyCleanupWithModels } from "./services/aiModelService";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/register", async (req, res) => {
    try {
      const { name, role, username, password } = req.body;
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = new User({ name, role, username, password });
      await user.save();
      res.status(201).json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username, password });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/ai/analyze', async (req, res) => {
    try {
      const { imageSource, title, description, latitude, longitude, nearbyReportCount } = req.body ?? {};

      if (!imageSource || !title) {
        return res.status(400).json({ message: 'imageSource and title are required' });
      }

      const result = await analyzeWasteWithModels({
        imageSource: String(imageSource),
        title: String(title),
        description: description ? String(description) : '',
        latitude: latitude != null ? Number(latitude) : undefined,
        longitude: longitude != null ? Number(longitude) : undefined,
        nearbyReportCount: nearbyReportCount != null ? Number(nearbyReportCount) : 1,
      });

      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'AI analyze failed' });
    }
  });

  app.post('/api/ai/verify-cleanup', async (req, res) => {
    try {
      const { beforeImageSource, afterImageSource, severityScore } = req.body ?? {};

      if (!afterImageSource) {
        return res.status(400).json({ message: 'afterImageSource is required' });
      }

      const result = await verifyCleanupWithModels({
        beforeImageSource: beforeImageSource ? String(beforeImageSource) : undefined,
        afterImageSource: String(afterImageSource),
        severityScore: Number(severityScore ?? 60),
      });

      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'AI verify failed' });
    }
  });

  // Reverse-geocoding proxy so the web client avoids Nominatim CORS blocks
  app.get('/api/geocode/reverse', async (req, res) => {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ message: 'lat and lon query params are required' });
      }
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CleanCity-App/1.0 (civic-waste-reporting)',
        },
      });
      if (!response.ok) {
        return res.status(response.status).json({ message: 'Nominatim request failed' });
      }
      const data = await response.json();
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Geocode reverse failed' });
    }
  });

  // ── Image storage via MongoDB Atlas ──────────────────────────────

  // Upload image — accepts { key, data } where data is a base64 data-URL
  app.post('/api/images/upload', async (req, res) => {
    try {
      const { key, data } = req.body ?? {};
      if (!key || !data) {
        return res.status(400).json({ message: 'key and data are required' });
      }

      // Detect content type from data URL header
      const ctMatch = String(data).match(/^data:(image\/[a-z+]+);base64,/i);
      const contentType = ctMatch ? ctMatch[1] : 'image/jpeg';

      await ImageModel.findOneAndUpdate(
        { key },
        { key, data: String(data), contentType, createdAt: new Date() },
        { upsert: true, new: true },
      );

      // Return a URL the client can store in Firestore
      const url = `/api/images/${encodeURIComponent(key)}`;
      return res.json({ url, key });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Image upload failed' });
    }
  });

  // Serve image (returns raw binary with correct Content-Type)
  app.get('/api/images/:key', async (req, res) => {
    try {
      const doc = await ImageModel.findOne({ key: req.params.key });
      if (!doc) {
        return res.status(404).json({ message: 'Image not found' });
      }

      const dataUrl = doc.data as string;
      const commaIdx = dataUrl.indexOf(',');
      if (commaIdx === -1) {
        return res.status(500).json({ message: 'Malformed image data' });
      }

      const base64 = dataUrl.substring(commaIdx + 1);
      const buffer = Buffer.from(base64, 'base64');

      res.set('Content-Type', doc.contentType || 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(buffer);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Image fetch failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
