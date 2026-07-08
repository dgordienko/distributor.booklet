import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const uploadsDir = path.resolve(process.env.UPLOADS_DIR ?? "./uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

export const upload = multer({ storage });
export const UPLOADS_DIR = uploadsDir;
