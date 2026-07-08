import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, type Category } from "../api/client";
import { Button } from "../components/Button";
import { UploadIcon } from "../components/icons";
import { RichTextEditor } from "../components/RichTextEditor";

export function CategoryEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!isNew && id) {
      api.getCategory(Number(id)).then((data) => {
        setCategory(data);
        setName(data.name);
        setDescription(data.description);
      });
    }
  }, [id, isNew]);

  async function handleSave() {
    if (isNew) {
      const created = await api.createCategory({ name, description });
      navigate(`/categories/${created.id}`);
    } else if (id) {
      await api.updateCategory(Number(id), { name, description });
    }
  }

  async function handleDelete() {
    if (!isNew && id) {
      await api.deleteCategory(Number(id));
      navigate("/categories");
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && !isNew && id) {
      const updated = await api.uploadCategoryImage(Number(id), file);
      setCategory(updated);
    }
  }

  return (
    <div className="page">
      <h1>{isNew ? "Новая категория" : "Редактировать категорию"}</h1>
      <div className="card">
        <label>
          Название
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Описание раздела
          <RichTextEditor value={description} onChange={setDescription} />
        </label>
        <div className="button-row">
          <Button variant="primary" onClick={handleSave}>
            Сохранить
          </Button>
          {!isNew && (
            <Button variant="danger" onClick={handleDelete}>
              Удалить
            </Button>
          )}
        </div>
      </div>

      {!isNew && category && (
        <div className="section">
          <div className="section-header">
            <h2>Изображение раздела</h2>
          </div>
          <div className="card">
            <label htmlFor="category-image" className="button button-ghost">
              <UploadIcon /> Загрузить изображение
            </label>
            <input
              id="category-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            {category.imageUrl && (
              <img src={category.imageUrl} alt="" className="image-preview" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
