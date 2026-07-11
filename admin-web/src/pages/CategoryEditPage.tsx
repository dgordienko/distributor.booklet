import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, type Category, type Team } from "../api/client";
import { Button } from "../components/Button";
import { UploadIcon } from "../components/icons";
import { RichTextEditor } from "../components/RichTextEditor";
import { useLocale } from "../context/LocaleContext";

export function CategoryEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";
  const { t } = useLocale();

  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamIds, setTeamIds] = useState<number[]>([]);

  useEffect(() => {
    api.listTeams().then(setTeams);
  }, []);

  useEffect(() => {
    if (!isNew && id) {
      api.getCategory(Number(id)).then((data) => {
        setCategory(data);
        setName(data.name);
        setDescription(data.description);
        setTeamIds(data.teams.map((t) => t.id));
      });
    }
  }, [id, isNew]);

  function toggleTeam(teamId: number, checked: boolean) {
    setTeamIds((prev) =>
      checked ? [...prev, teamId] : prev.filter((t) => t !== teamId),
    );
  }

  async function handleSave() {
    if (isNew) {
      const created = await api.createCategory({ name, description, teamIds });
      navigate(`/categories/${created.id}`);
    } else if (id) {
      await api.updateCategory(Number(id), { name, description, teamIds });
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
      <h1>{isNew ? t("categories.newTitle") : t("categories.editTitle")}</h1>
      <div className="card">
        <label>
          {t("common.name")}
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          {t("categories.descriptionLabel")}
          <RichTextEditor value={description} onChange={setDescription} />
        </label>
        <div className="field">
          <span className="field-label">{t("categories.teamsLabel")}</span>
          <span className="field-hint">{t("categories.teamsHint")}</span>
          <div className="checkbox-list">
            {teams.length === 0 && (
              <span className="empty-state">{t("categories.teamsEmpty")}</span>
            )}
            {teams.map((team) => (
              <label key={team.id} className="checkbox-list-item">
                <input
                  type="checkbox"
                  checked={teamIds.includes(team.id)}
                  onChange={(e) => toggleTeam(team.id, e.target.checked)}
                />
                {team.frcName}
              </label>
            ))}
          </div>
        </div>
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

      {!isNew && category && (
        <div className="section">
          <div className="section-header">
            <h2>{t("categories.imageTitle")}</h2>
          </div>
          <div className="card">
            <label htmlFor="category-image" className="button button-ghost">
              <UploadIcon /> {t("categories.uploadImage")}
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
