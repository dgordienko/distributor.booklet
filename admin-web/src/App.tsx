import { useEffect } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { ProductsListPage } from "./pages/ProductsListPage";
import { ProductEditPage } from "./pages/ProductEditPage";
import { CategoriesListPage } from "./pages/CategoriesListPage";
import { CategoryEditPage } from "./pages/CategoryEditPage";
import { BrandSettingsPage } from "./pages/BrandSettingsPage";
import { TeamsPage } from "./pages/TeamsPage";
import { SearchIcon } from "./components/icons";
import { useSearch } from "./context/SearchContext";
import { useLocale } from "./context/LocaleContext";
import { LOCALES, LOCALE_LABELS } from "./i18n/translations";

const SEARCHABLE_PATHS = ["/", "/categories"];

export function App() {
  const location = useLocation();
  const { search, setSearch } = useSearch();
  const { locale, setLocale, t } = useLocale();
  const { isLoading, isAuthenticated, error, loginWithRedirect, logout, user } = useAuth0();
  const showSearch = SEARCHABLE_PATHS.includes(location.pathname);

  useEffect(() => {
    if (!showSearch) setSearch("");
  }, [showSearch, setSearch]);

  if (isLoading) return <p className="page">{t("common.loading")}</p>;

  if (!isAuthenticated) {
    return (
      <div className="page auth-gate">
        <h1>{t("auth.loginTitle")}</h1>
        <p className="page-intro">{t("auth.loginPrompt")}</p>
        {error && <p className="field-hint">{t("auth.error")}: {error.message}</p>}
        <div className="button-row">
          <button
            type="button"
            className="button button-primary"
            onClick={() => loginWithRedirect()}
          >
            {t("auth.login")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-top">
          <Link to="/" className="app-header-title">
            Booklet Admin
          </Link>
          {showSearch && (
            <div className="app-header-search">
              <SearchIcon />
              <input
                type="search"
                placeholder={t("common.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label={t("common.search")}
              />
            </div>
          )}
          <div className="locale-switch" role="group" aria-label={t("common.language")}>
            {LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                className={locale === code ? "active" : ""}
                onClick={() => setLocale(code)}
              >
                {LOCALE_LABELS[code]}
              </button>
            ))}
          </div>
          <div className="app-header-user">
            {user?.picture && (
              <img src={user.picture} alt="" className="app-header-user-avatar" />
            )}
            {(user?.name || user?.email) && (
              <div className="app-header-user-info">
                <span className="app-header-user-name">{user?.name ?? user?.email}</span>
                {user?.email && user?.name && user.email !== user.name && (
                  <span className="app-header-user-email">{user.email}</span>
                )}
              </div>
            )}
            <button
              type="button"
              className="button button-ghost"
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              {t("auth.logout")}
            </button>
          </div>
        </div>
        <nav className="app-header-nav">
          <span className="app-header-nav-label">{t("nav.label")}</span>
          <NavLink to="/brand" className={({ isActive }) => (isActive ? "active" : "")}>
            {t("nav.brand")}
          </NavLink>
          <NavLink to="/teams" className={({ isActive }) => (isActive ? "active" : "")}>
            {t("nav.teams")}
          </NavLink>
          <NavLink to="/categories" className={({ isActive }) => (isActive ? "active" : "")}>
            {t("nav.categories")}
          </NavLink>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            {t("nav.products")}
          </NavLink>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<ProductsListPage />} />
        <Route path="/products/:id" element={<ProductEditPage />} />
        <Route path="/categories" element={<CategoriesListPage />} />
        <Route path="/categories/:id" element={<CategoryEditPage />} />
        <Route path="/brand" element={<BrandSettingsPage />} />
        <Route path="/teams" element={<TeamsPage />} />
      </Routes>
    </div>
  );
}
