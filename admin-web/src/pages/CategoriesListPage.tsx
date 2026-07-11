import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Category } from "../api/client";
import { IconButton } from "../components/Button";
import { ArrowDownIcon, ArrowUpIcon, PhotoIcon, PlusIcon } from "../components/icons";
import { stripHtml } from "../lib/stripHtml";
import { useSearch } from "../context/SearchContext";
import { useLocale } from "../context/LocaleContext";

export function CategoriesListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { search } = useSearch();
  const { t } = useLocale();

  useEffect(() => {
    api.listCategories().then((data) => {
      setCategories(data);
      setLoading(false);
    });
  }, []);

  async function handleMove(id: number, direction: "up" | "down") {
    const updated = await api.moveCategory(id, direction);
    setCategories(updated);
  }

  if (loading) return <p>{t("common.loading")}</p>;

  const query = search.trim().toLowerCase();
  const filteredCategories = query
    ? categories.filter((c) => c.name.toLowerCase().includes(query))
    : categories;

  return (
    <div className="page page-wide">
      <h1>{t("categories.title")}</h1>
      <p className="page-intro">{t("categories.intro")}</p>
      <Link to="/categories/new" className="button button-primary">
        <PlusIcon /> {t("categories.add")}
      </Link>

      <div className="entity-grid section">
        {filteredCategories.map((category, index) => (
          <div className="entity-card" key={category.id}>
            {category.imageUrl ? (
              <img src={category.imageUrl} alt="" className="entity-card-media" />
            ) : (
              <div className="entity-card-media-placeholder">
                <PhotoIcon />
              </div>
            )}
            <Link to={`/categories/${category.id}`} className="entity-card-body">
              <div className="entity-card-title">{category.name}</div>
              <p className="entity-card-snippet">
                {stripHtml(category.description) || t("common.noDescription")}
              </p>
              {category.teams.length > 0 && (
                <div className="card-row-actions" style={{ flexWrap: "wrap" }}>
                  {category.teams.map((team) => (
                    <span className="badge badge-accent" key={team.id}>
                      {team.frcName}
                    </span>
                  ))}
                </div>
              )}
            </Link>
            <div className="entity-card-footer">
              <span />
              <div className="card-row-actions">
                <IconButton
                  disabled={index === 0}
                  onClick={() => handleMove(category.id, "up")}
                  aria-label={t("common.moveUp")}
                >
                  <ArrowUpIcon />
                </IconButton>
                <IconButton
                  disabled={index === filteredCategories.length - 1}
                  onClick={() => handleMove(category.id, "down")}
                  aria-label={t("common.moveDown")}
                >
                  <ArrowDownIcon />
                </IconButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
