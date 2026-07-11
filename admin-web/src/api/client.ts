export interface Photo {
  id: number;
  filename: string;
  url: string;
  isPrimary: boolean;
}

export interface ProductCategoryRef {
  categoryId: number;
  order: number;
}

export interface Product {
  id: number;
  categories: ProductCategoryRef[];
  name: string;
  manufacturer: string;
  trademark: string;
  productType: string;
  description: string;
  shelfLife: string;
  storageTemperature: string;
  composition: string;
  basePrice: number;
  currency: string;
  isActive: boolean;
  photos: Photo[];
}

export interface ProductInput {
  categoryIds: number[];
  name: string;
  manufacturer: string;
  trademark: string;
  productType: string;
  description: string;
  shelfLife: string;
  storageTemperature: string;
  composition: string;
  basePrice: number;
  currency: string;
  isActive: boolean;
}

export interface Team {
  id: number;
  frcId: number;
  frcName: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  order: number;
  teams: Team[];
}

export interface Brand {
  id: number;
  name: string;
  tagline: string;
  logoUrl: string;
}

const API_BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function json(method: string, body: unknown) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export const api = {
  listProducts: () => request<Product[]>("/products"),
  getProduct: (id: number) => request<Product>(`/products/${id}`),
  createProduct: (data: ProductInput) =>
    request<Product>("/products", json("POST", data)),
  updateProduct: (id: number, data: ProductInput) =>
    request<Product>(`/products/${id}`, json("PUT", data)),
  deleteProduct: (id: number) =>
    request<void>(`/products/${id}`, { method: "DELETE" }),
  moveProduct: (id: number, categoryId: number, direction: "up" | "down") =>
    request<Product[]>(`/products/${id}/move`, json("POST", { categoryId, direction })),
  uploadPhoto: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("photo", file);
    return request<Photo>(`/products/${id}/photos`, {
      method: "POST",
      body: formData,
    });
  },
  deletePhoto: (productId: number, photoId: number) =>
    request<void>(`/products/${productId}/photos/${photoId}`, {
      method: "DELETE",
    }),
  setPrimaryPhoto: (productId: number, photoId: number) =>
    request<Product>(`/products/${productId}/photos/${photoId}/primary`, {
      method: "POST",
    }),

  listCategories: () => request<Category[]>("/categories"),
  getCategory: (id: number) => request<Category>(`/categories/${id}`),
  createCategory: (data: { name: string; description: string; teamIds: number[] }) =>
    request<Category>("/categories", json("POST", data)),
  updateCategory: (
    id: number,
    data: { name: string; description: string; teamIds: number[] },
  ) => request<Category>(`/categories/${id}`, json("PUT", data)),
  deleteCategory: (id: number) =>
    request<void>(`/categories/${id}`, { method: "DELETE" }),
  moveCategory: (id: number, direction: "up" | "down") =>
    request<Category[]>(`/categories/${id}/move`, json("POST", { direction })),
  uploadCategoryImage: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return request<Category>(`/categories/${id}/image`, {
      method: "POST",
      body: formData,
    });
  },

  listTeams: () => request<Team[]>("/teams"),
  syncTeams: () => request<Team[]>("/teams/sync", { method: "POST" }),

  getBrand: () => request<Brand>("/brand"),
  updateBrand: (data: { name: string; tagline: string }) =>
    request<Brand>("/brand", json("PUT", data)),
  uploadBrandLogo: (file: File) => {
    const formData = new FormData();
    formData.append("logo", file);
    return request<Brand>("/brand/logo", { method: "POST", body: formData });
  },
};
