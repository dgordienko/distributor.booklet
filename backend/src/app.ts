import express from "express";
import cors from "cors";
import { productsRouter } from "./routes/products.routes";
import { brandRouter } from "./routes/brand.routes";
import { categoriesRouter } from "./routes/categories.routes";
import { UPLOADS_DIR } from "./middleware/upload";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/uploads", express.static(UPLOADS_DIR));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/products", productsRouter);
  app.use("/api/brand", brandRouter);
  app.use("/api/categories", categoriesRouter);

  return app;
}
