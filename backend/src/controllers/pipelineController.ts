import { Request, Response } from "express";
import { runPipeline } from "../services/pipeline";

export async function runPipelineController(
  req: Request,
  res: Response
) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const {
      businessName,
      periodStartISO,
      periodEndISO
    } = req.body;

    if (!businessName || !periodStartISO || !periodEndISO) {
      return res.status(400).json({
        error: "Missing required fields"
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
    res.status(500).json({
      error: err.message ?? "Pipeline failed"
    });
  }
}
