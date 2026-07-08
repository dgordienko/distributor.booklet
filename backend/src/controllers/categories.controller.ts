import type { Request, Response } from "express";
import * as categoriesService from "../services/categories.service";

export async function list(_req: Request, res: Response) {
  res.json(await categoriesService.listCategories());
}

export async function getOne(req: Request, res: Response) {
  const category = await categoriesService.getCategory(Number(req.params.id));
  if (!category) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.json(category);
}

export async function create(req: Request, res: Response) {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }
  const category = await categoriesService.createCategory({
    name,
    description: description ?? "",
  });
  res.status(201).json(category);
}

export async function update(req: Request, res: Response) {
  const { name, description } = req.body;
  const category = await categoriesService.updateCategory(
    Number(req.params.id),
    { name, description },
  );
  res.json(category);
}

export async function uploadImage(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({ error: "image file is required" });
    return;
  }
  const category = await categoriesService.updateCategoryImage(
    Number(req.params.id),
    `/uploads/${req.file.filename}`,
  );
  res.json(category);
}

export async function remove(req: Request, res: Response) {
  await categoriesService.deleteCategory(Number(req.params.id));
  res.status(204).send();
}

export async function move(req: Request, res: Response) {
  const { direction } = req.body;
  if (direction !== "up" && direction !== "down") {
    res.status(400).json({ error: "direction must be 'up' or 'down'" });
    return;
  }
  const categories = await categoriesService.moveCategory(
    Number(req.params.id),
    direction,
  );
  res.json(categories);
}
