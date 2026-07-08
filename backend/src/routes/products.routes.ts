import { Router } from "express";
import { upload } from "../middleware/upload";
import { removeImageBackground } from "../middleware/removeBackground";
import * as productsController from "../controllers/products.controller";

export const productsRouter = Router();

productsRouter.get("/", productsController.list);
productsRouter.post("/", productsController.create);
productsRouter.get("/:id", productsController.getOne);
productsRouter.put("/:id", productsController.update);
productsRouter.delete("/:id", productsController.remove);
productsRouter.post("/:id/move", productsController.move);

productsRouter.post(
  "/:id/photos",
  upload.single("photo"),
  removeImageBackground,
  productsController.uploadPhoto,
);
productsRouter.delete("/:id/photos/:photoId", productsController.removePhoto);
productsRouter.post(
  "/:id/photos/:photoId/primary",
  productsController.setPrimaryPhoto,
);
