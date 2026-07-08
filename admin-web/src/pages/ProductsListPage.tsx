import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Category, type Product } from "../api/client";
import { IconButton } from "../components/Button";
import { ArrowDownIcon, ArrowUpIcon, PhotoIcon, PlusIcon } from "../components/icons";
import { stripHtml } from "../lib/stripHtml";
import { useSearch } from "../context/SearchContext";

function primaryPhoto(product: Product) {
  return product.photos.find((photo) => photo.isPrimary) ?? product.photos[0];
}

export function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { search } = useSearch();

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

  if (loading) return <p>Загрузка...</p>;

  const query = search.trim().toLowerCase();
  const filteredProducts = query
    ? products.filter((p) => p.name.toLowerCase().includes(query))
    : products;

  // Товар может входить сразу в несколько категорий (например, в свою
  // обычную категорию и в "Акционное предложение"), поэтому один товар может
  // попасть сразу в несколько групп ниже — по разу на каждую свою категорию.
  const groups: Array<{ id: number | null; name: string; products: Product[] }> =
    [
      ...categories.map((category) => ({
        id: category.id,
        name: category.name,
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
        name: "Без категории",
        products: filteredProducts.filter((p) => p.categories.length === 0),
      },
    ].filter((group) => group.products.length > 0 || (group.id !== null && !query));

  return (
    <div className="page page-wide">
      <h1>Товары</h1>
      <p className="page-intro">
        Порядок внутри категории определяет порядок страниц товаров в разделе
        буклета. Разделы буклета настраиваются на странице{" "}
        <Link to="/categories">Категории</Link>.
      </p>
      <Link to="/products/new" className="button button-primary">
        <PlusIcon /> Добавить товар
      </Link>

      {groups.map((group) => (
        <div className="section" key={group.id ?? "none"}>
          <div className="section-header">
            <h2>{group.name}</h2>
          </div>
          {group.products.length === 0 ? (
            <p className="empty-state">Нет товаров</p>
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
                          <span className="badge badge-neutral">скрыт</span>
                        )}
                      </div>
                      <p className="entity-card-snippet">
                        {stripHtml(product.description) || "Без описания"}
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
                            aria-label="Переместить выше"
                          >
                            <ArrowUpIcon />
                          </IconButton>
                          <IconButton
                            disabled={index === group.products.length - 1}
                            onClick={() => handleMove(product.id, group.id as number, "down")}
                            aria-label="Переместить ниже"
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
  );
}
