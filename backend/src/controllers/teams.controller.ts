import type { Request, Response } from "express";
import * as teamsService from "../services/teams.service";

export async function list(_req: Request, res: Response) {
  res.json(await teamsService.listTeams());
}

export async function sync(_req: Request, res: Response) {
  try {
    const teams = await teamsService.syncTeams();
    res.json(teams);
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : "Не удалось синхронизировать команды",
    });
  }
}
