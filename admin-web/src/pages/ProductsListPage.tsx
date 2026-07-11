import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Category, type Product } from "../api/client";
import { IconButton } from "../components/Button";
import { ArrowDownIcon, ArrowUpIcon, PhotoIcon, PlusIcon } from "../components/icons";
import { stripHtml } from "../lib/stripHtml";
import { useSearch } from "../context/SearchContext";
import { useLocale } from "../context/LocaleContext";

function primaryPhoto(product: Product) {
  return product.photos.find((photo) => photo.isPrimary) ?? product.photos[0];
}

type CategoryFilter = number | "none" | "all";

export function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const { search } = useSearch();
  const { t } = useLocale();

  useEffect(() => {
    Promise.all([api.listProducts(), api.listCategories()]).then(
      ([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
        setLoading(false);
      },
    );
  }, []);

  async function handleMove(id: number, categoryId: number, direction: "up" | "down") {
    const updated = await api.moveProduct(id, categoryId, direction);
    setProducts(updated);
  }

  if (loading) return <p>{t("common.loading")}</p>;

  const query = search.trim().toLowerCase();
  const filteredProducts = query
    ? products.filter((p) => p.name.toLowerCase().includes(query))
    : products;

  const uncategorizedCount = products.filter((p) => p.categories.length === 0).length;

  // Один проход по товарам вместо фильтрации по каждой категории в рендере
  // сайдбара (O(товары) вместо O(категории × товары) для больших каталогов).
  const categoryCounts = new Map<number, number>();
  for (const product of products) {
    for (const c of product.categories) {
      categoryCounts.set(c.categoryId, (categoryCounts.get(c.categoryId) ?? 0) + 1);
    }
  }

  // Товар может входить сразу в несколько категорий (например, в свою
  // обычную категорию и в "Акционное предложение"), поэтому один товар может
  // попасть сразу в несколько групп ниже — по разу на каждую свою категорию.
  const groups: Array<{
    id: number | null;
    name: string;
    description: string;
    products: Product[];
  }> = [
      ...categories.map((category) => ({
        id: category.id,
        name: category.name,
        description: stripHtml(category.description),
        products: filteredProducts
          .filter((p) => p.categories.some((c) => c.categoryId === category.id))
          .sort((a, b) => {
            const orderA = a.categories.find((c) => c.categoryId === category.id)?.order ?? 0;
            const orderB = b.categories.find((c) => c.categoryId === category.id)?.order ?? 0;
            return orderA - orderB;
          }),
      })),
      {
        id: null,
        name: t("common.noCategory"),
        description: "",
        products: filteredProducts.filter((p) => p.categories.length === 0),
      },
    ]
      .filter((group) => group.products.length > 0 || (group.id !== null && !query))
      .filter((group) => {
        if (categoryFilter === "all") return true;
        if (categoryFilter === "none") return group.id === null;
        return group.id === categoryFilter;
      });

  return (
    <div className="page page-wide">
      <h1>{t("products.title")}</h1>
      <p className="page-intro">
        {t("products.intro")} <Link to="/categories">{t("nav.categories")}</Link>.
      </p>
      <Link to="/products/new" className="button button-primary">
        <PlusIcon /> {t("products.addProduct")}
      </Link>

      <div className="products-layout section">
        <nav className="category-filter" aria-label={t("products.categoryFilterLabel")}>
          <button
            type="button"
            className={`category-filter-item ${categoryFilter === "all" ? "active" : ""}`}
            onClick={() => setCategoryFilter("all")}
          >
            <span>{t("products.allProducts")}</span>
            <span className="category-filter-count">{products.length}</span>
          </button>
          {categories.map((category) => {
            const description = stripHtml(category.description);
            return (
              <button
                key={category.id}
                type="button"
                className={`category-filter-item ${categoryFilter === category.id ? "active" : ""}`}
                onClick={() => setCategoryFilter(category.id)}
              >
                <span className="category-filter-label">
                  <span className="category-filter-name">{category.name}</span>
                  {description && (
                    <span className="category-filter-desc">{description}</span>
                  )}
                </span>
                <span className="category-filter-count">
                  {categoryCounts.get(category.id) ?? 0}
                </span>
              </button>
            );
          })}
          {uncategorizedCount > 0 && (
            <button
              type="button"
              className={`category-filter-item ${categoryFilter === "none" ? "active" : ""}`}
              onClick={() => setCategoryFilter("none")}
            >
              <span>{t("common.noCategory")}</span>
              <span className="category-filter-count">{uncategorizedCount}</span>
            </button>
          )}
        </nav>

        <div>
          {groups.length === 0 && (
            <p className="empty-state">{t("products.emptySelectedCategory")}</p>
          )}
          {groups.map((group) => (
            <div className="section" key={group.id ?? "none"}>
              <div className="section-header">
                <div>
                  <h2>{group.name}</h2>
                  {group.description && (
                    <p className="section-header-desc">{group.description}</p>
                  )}
                </div>
              </div>
              {group.products.length === 0 ? (
                <p className="empty-state">{t("products.emptyCategory")}</p>
              ) : (
                <div className="entity-grid">
                  {group.products.map((product, index) => {
                    const photo = primaryPhoto(product);
                    return (
                      <div className="entity-card" key={product.id}>
                        {photo ? (
                          <img src={photo.url} alt="" className="entity-card-media" />
                        ) : (
                          <div className="entity-card-media-placeholder">
                            <PhotoIcon />
                          </div>
                        )}
                        <Link to={`/products/${product.id}`} className="entity-card-body">
                          <div className="entity-card-title">
                            {product.name}
                            {!product.isActive && (
                              <span className="badge badge-neutral">{t("products.hiddenBadge")}</span>
                            )}
                          </div>
                          <p className="entity-card-snippet">
                            {stripHtml(product.description) || t("common.noDescription")}
                          </p>
                        </Link>
                        <div className="entity-card-footer">
                          {product.basePrice > 0 ? (
                            <span className="entity-card-price">
                              {product.basePrice.toFixed(2)} {product.currency}
                            </span>
                          ) : (
                            <span />
                          )}
                          {group.id !== null && (
                            <div className="card-row-actions">
                              <IconButton
                                disabled={index === 0}
                                onClick={() => handleMove(product.id, group.id as number, "up")}
                                aria-label={t("common.moveUp")}
                              >
                                <ArrowUpIcon />
                              </IconButton>
                              <IconButton
                                disabled={index === group.products.length - 1}
                                onClick={() => handleMove(product.id, group.id as number, "down")}
                                aria-label={t("common.moveDown")}
                              >
                                <ArrowDownIcon />
                              </IconButton>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
