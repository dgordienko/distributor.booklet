import { Router } from "express";
import { upload } from "../middleware/upload";
import { removeImageBackground } from "../middleware/removeBackground";
import * as brandController from "../controllers/brand.controller";

export const brandRouter = Router();

brandRouter.get("/", brandController.getOne);
brandRouter.put("/", brandController.update);
brandRouter.post(
  "/logo",
  upload.single("logo"),
  removeImageBackground,
  brandController.uploadLogo,
);
