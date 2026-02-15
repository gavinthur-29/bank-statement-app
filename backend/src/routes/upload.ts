import express from "express";
import multer from "multer";
import { runPipeline } from "../services/pipeline";

const router = express.Router();
const upload = multer();

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { businessName, periodStartISO, periodEndISO } = req.body;

    if (!businessName || !periodStartISO || !periodEndISO) {
      return res.status(400).json({
        error: "businessName, periodStartISO and periodEndISO are required"
      });
    }

    const result = await runPipeline({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      originalName: req.file.originalname,
      businessName,
      periodStartISO,
      periodEndISO
    });

    res.json(result);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      error: err.message ?? "Upload failed"
    });
  }
});

export default router;
