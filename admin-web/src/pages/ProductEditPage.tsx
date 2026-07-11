import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, type Category, type Product, type ProductInput } from "../api/client";
import { Button, IconButton } from "../components/Button";
import { StarIcon, TrashIcon, UploadIcon } from "../components/icons";
import { RichTextEditor } from "../components/RichTextEditor";
import { useLocale } from "../context/LocaleContext";

const emptyForm: ProductInput = {
  categoryIds: [],
  name: "",
  manufacturer: "",
  trademark: "",
  productType: "",
  description: "",
  shelfLife: "",
  storageTemperature: "",
  composition: "",
  basePrice: 0,
  currency: "UAH",
  isActive: true,
};

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductInput>(emptyForm);
  const { t } = useLocale();

  useEffect(() => {
    api.listCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!isNew && id) {
      api.getProduct(Number(id)).then((data) => {
        setProduct(data);
        setForm({
          categoryIds: data.categories.map((c) => c.categoryId),
          name: data.name,
          manufacturer: data.manufacturer,
          trademark: data.trademark,
          productType: data.productType,
          description: data.description,
          shelfLife: data.shelfLife,
          storageTemperature: data.storageTemperature,
          composition: data.composition,
          basePrice: data.basePrice,
          currency: data.currency,
          isActive: data.isActive,
        });
      });
    }
  }, [id, isNew]);

  function updateForm<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCategory(categoryId: number, checked: boolean) {
    setForm((prev) => ({
      ...prev,
      categoryIds: checked
        ? [...prev.categoryIds, categoryId]
        : prev.categoryIds.filter((id) => id !== categoryId),
    }));
  }

  async function handleSave() {
    if (isNew) {
      const created = await api.createProduct(form);
      navigate(`/products/${created.id}`);
    } else if (id) {
      await api.updateProduct(Number(id), form);
    }
  }

  async function handleDelete() {
    if (!isNew && id) {
      await api.deleteProduct(Number(id));
      navigate("/");
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && !isNew && id) {
      const photo = await api.uploadPhoto(Number(id), file);
      setProduct((prev) =>
        prev ? { ...prev, photos: [...prev.photos, photo] } : prev,
      );
    }
  }

  async function handleSetPrimary(photoId: number) {
    if (!isNew && id) {
      const updated = await api.setPrimaryPhoto(Number(id), photoId);
      setProduct(updated);
    }
  }

  async function handleDeletePhoto(photoId: number) {
    if (!isNew && id) {
      await api.deletePhoto(Number(id), photoId);
      setProduct((prev) =>
        prev
          ? { ...prev, photos: prev.photos.filter((p) => p.id !== photoId) }
          : prev,
      );
    }
  }

  return (
    <div className="page">
      <h1>{isNew ? t("products.newTitle") : t("products.editTitle")}</h1>
      <div className="card">
        <div className="field">
          <span className="field-label">{t("products.categoriesLabel")}</span>
          <span className="field-hint">{t("products.categoriesHint")}</span>
          <div className="checkbox-list">
            {categories.length === 0 && (
              <span className="empty-state">{t("common.noCategoriesYet")}</span>
            )}
            {categories.map((category) => (
              <label key={category.id} className="checkbox-list-item">
                <input
                  type="checkbox"
                  checked={form.categoryIds.includes(category.id)}
                  onChange={(e) => toggleCategory(category.id, e.target.checked)}
                />
                {category.name}
              </label>
            ))}
          </div>
        </div>
        <label>
          {t("common.name")}
          <input
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
          />
        </label>
        <label>
          {t("products.manufacturer")}
          <input
            value={form.manufacturer}
            onChange={(e) => updateForm("manufacturer", e.target.value)}
          />
        </label>
        <label>
          {t("products.trademark")}
          <input
            value={form.trademark}
            onChange={(e) => updateForm("trademark", e.target.value)}
          />
        </label>
        <label>
          {t("products.productType")}
          <input
            value={form.productType}
            onChange={(e) => updateForm("productType", e.target.value)}
          />
        </label>
        <label>
          {t("common.description")}
          <RichTextEditor
            value={form.description}
            onChange={(html) => updateForm("description", html)}
          />
        </label>
        <label>
          {t("products.shelfLife")}
          <input
            value={form.shelfLife}
            onChange={(e) => updateForm("shelfLife", e.target.value)}
          />
        </label>
        <label>
          {t("products.storageTemperature")}
          <input
            value={form.storageTemperature}
            onChange={(e) => updateForm("storageTemperature", e.target.value)}
          />
        </label>
        <label>
          {t("products.composition")}
          <textarea
            value={form.composition}
            onChange={(e) => updateForm("composition", e.target.value)}
          />
        </label>
        <label>
          {t("products.price")}
          <input
            type="number"
            step="0.01"
            value={form.basePrice}
            onChange={(e) => updateForm("basePrice", Number(e.target.value))}
          />
        </label>
        <label>
          {t("products.currency")}
          <input
            value={form.currency}
            onChange={(e) => updateForm("currency", e.target.value)}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => updateForm("isActive", e.target.checked)}
          />
          {t("products.isActive")}
        </label>
        <div className="button-row">
          <Button variant="primary" onClick={handleSave}>
            {t("common.save")}
          </Button>
          {!isNew && (
            <Button variant="danger" onClick={handleDelete}>
              {t("common.delete")}
            </Button>
          )}
        </div>
      </div>

      {!isNew && (
        <div className="section">
          <div className="section-header">
            <h2>{t("products.photosTitle")}</h2>
          </div>
          <div className="card">
            <label htmlFor="product-photo" className="button button-ghost">
              <UploadIcon /> {t("products.uploadPhoto")}
            </label>
            <input
              id="product-photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: "none" }}
            />
            <div className="photo-grid">
              {product?.photos.map((photo) => (
                <div className="photo-tile" key={photo.id}>
                  <img src={photo.url} alt="" />
                  <div className="photo-tile-actions">
                    {photo.isPrimary ? (
                      <span className="badge badge-accent">
                        <StarIcon filled width={12} height={12} /> {t("products.primaryPhoto")}
                      </span>
                    ) : (
                      <IconButton
                        onClick={() => handleSetPrimary(photo.id)}
                        aria-label={t("products.makePrimary")}
                      >
                        <StarIcon />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={() => handleDeletePhoto(photo.id)}
                      aria-label={t("products.deletePhoto")}
                    >
                      <TrashIcon />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
