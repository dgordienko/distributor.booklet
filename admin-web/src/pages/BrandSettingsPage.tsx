import { useEffect, useState } from "react";
import { api, type Brand } from "../api/client";
import { Button } from "../components/Button";
import { UploadIcon } from "../components/icons";
import { useLocale } from "../context/LocaleContext";

export function BrandSettingsPage() {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [saved, setSaved] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    api.getBrand().then((data) => {
      setBrand(data);
      setName(data.name);
      setTagline(data.tagline);
    });
  }, []);

  async function handleSave() {
    const updated = await api.updateBrand({ name, tagline });
    setBrand(updated);
    setSaved(true);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const updated = await api.uploadBrandLogo(file);
      setBrand(updated);
    }
  }

  if (!brand) return <p>{t("common.loading")}</p>;

  return (
    <div className="page">
      <h1>{t("brand.title")}</h1>
      <div className="card">
        <label>
          {t("brand.name")}
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
          />
        </label>
        <label>
          {t("brand.tagline")}
          <input
            value={tagline}
            onChange={(e) => {
              setTagline(e.target.value);
              setSaved(false);
            }}
          />
        </label>
        <div className="button-row">
          <Button variant="primary" onClick={handleSave}>
            {t("common.save")}
          </Button>
          {saved && <span className="badge badge-accent">{t("common.saved")}</span>}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>{t("brand.logoTitle")}</h2>
        </div>
        <div className="card">
          <label htmlFor="brand-logo" className="button button-ghost">
            <UploadIcon /> {t("brand.uploadLogo")}
          </label>
          <input
            id="brand-logo"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            style={{ display: "none" }}
          />
          {brand.logoUrl && (
            <img src={brand.logoUrl} alt={t("brand.logoAlt")} className="image-preview" />
          )}
        </div>
      </div>
    </div>
  );
}
