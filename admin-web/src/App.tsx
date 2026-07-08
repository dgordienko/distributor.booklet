import { useEffect } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { ProductsListPage } from "./pages/ProductsListPage";
import { ProductEditPage } from "./pages/ProductEditPage";
import { CategoriesListPage } from "./pages/CategoriesListPage";
import { CategoryEditPage } from "./pages/CategoryEditPage";
import { BrandSettingsPage } from "./pages/BrandSettingsPage";
import { SearchIcon } from "./components/icons";
import { useSearch } from "./context/SearchContext";

const SEARCHABLE_PATHS = ["/", "/categories"];

export function App() {
  const location = useLocation();
  const { search, setSearch } = useSearch();
  const showSearch = SEARCHABLE_PATHS.includes(location.pathname);

  useEffect(() => {
    if (!showSearch) setSearch("");
  }, [showSearch, setSearch]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-top">
          <Link to="/" className="app-header-title">
            Presenter Admin
          </Link>
          {showSearch && (
            <div className="app-header-search">
              <SearchIcon />
              <input
                type="search"
                placeholder="Поиск..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Поиск"
              />
            </div>
          )}
        </div>
        <nav className="app-header-nav">
          <span className="app-header-nav-label">Разделы:</span>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Товары
          </NavLink>
          <NavLink to="/categories" className={({ isActive }) => (isActive ? "active" : "")}>
            Категории
          </NavLink>
          <NavLink to="/brand" className={({ isActive }) => (isActive ? "active" : "")}>
            Обложка бренда
          </NavLink>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<ProductsListPage />} />
        <Route path="/products/:id" element={<ProductEditPage />} />
        <Route path="/categories" element={<CategoriesListPage />} />
        <Route path="/categories/:id" element={<CategoryEditPage />} />
        <Route path="/brand" element={<BrandSettingsPage />} />
      </Routes>
    </div>
  );
}
