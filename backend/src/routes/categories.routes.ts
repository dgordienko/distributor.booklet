import { Router } from "express";
import { upload } from "../middleware/upload";
import * as categoriesController from "../controllers/categories.controller";

export const categoriesRouter = Router();

categoriesRouter.get("/", categoriesController.list);
categoriesRouter.post("/", categoriesController.create);
categoriesRouter.get("/:id", categoriesController.getOne);
categoriesRouter.put("/:id", categoriesController.update);
categoriesRouter.delete("/:id", categoriesController.remove);
categoriesRouter.post("/:id/move", categoriesController.move);
categoriesRouter.post(
  "/:id/image",
  upload.single("image"),
  categoriesController.uploadImage,
);
