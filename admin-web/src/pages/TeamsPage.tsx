import { useEffect, useState } from "react";
import { api, type Team } from "../api/client";
import { Button } from "../components/Button";
import { useLocale } from "../context/LocaleContext";

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    api
      .listTeams()
      .then((data) => setTeams(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  async function handleSync() {
    setSyncing(true);
    setError(false);
    try {
      const data = await api.syncTeams();
      setTeams(data);
    } catch {
      setError(true);
    } finally {
      setSyncing(false);
    }
  }

  if (loading) return <p>{t("common.loading")}</p>;

  return (
    <div className="page">
      <h1>{t("teams.title")}</h1>
      <p className="page-intro">{t("teams.intro")}</p>
      <div className="button-row">
        <Button variant="primary" onClick={handleSync} disabled={syncing}>
          {syncing ? t("teams.syncing") : t("teams.syncButton")}
        </Button>
      </div>
      {error && <p className="field-hint">{t("teams.syncError")}</p>}

      <div className="card-list section">
        {teams.length === 0 && <p className="empty-state">{t("teams.empty")}</p>}
        {teams.map((team) => (
          <div className="card-row" key={team.id}>
            <div className="card-row-main">
              <span>{team.frcName}</span>
            </div>
            <span className="badge badge-neutral">{team.frcId}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
