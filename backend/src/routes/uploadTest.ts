import { Router } from "express";
import multer from "multer";
import { ingestFile } from "../services/ingestion";

const router = Router();
const upload = multer(); // memory storage

router.post("/upload-test", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { businessName, periodSegment } = req.body;

    const result = await ingestFile(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname,
      businessName,
      periodSegment
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
