import { Router } from "express";
import * as teamsController from "../controllers/teams.controller";

export const teamsRouter = Router();

teamsRouter.get("/", teamsController.list);
teamsRouter.post("/sync", teamsController.sync);
