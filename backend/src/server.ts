import express from "express";
import cors from "cors";
import multer from "multer";
import { runPipeline } from "./services/pipeline";

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer();

// Health check
app.get("/", (_, res) => {
  res.json({ status: "Backend running" });
});

// File upload endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await runPipeline({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      originalName: req.file.originalname,
      businessName: "Test Business Ltd",
      periodStartISO: "2025-01-01",
      periodEndISO: "2025-12-31"
    });

    res.json(result);
  } catch (error) {
    console.error("Pipeline error:", error);
    res.status(500).json({ error: "Processing failed" });
  }
});

export default app;
