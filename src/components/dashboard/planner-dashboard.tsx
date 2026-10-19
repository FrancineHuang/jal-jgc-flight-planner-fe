"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/locale-provider";
import { usePlanner } from "@/components/planner/planner-provider";
import { Icon } from "@/components/ui/icon";
import { ProgressOverview } from "./progress-overview";
import { PlanningSummary } from "./planning-summary";

export function PlannerDashboard() {
  const { t } = useI18n();
  const { balance, setBalance } = usePlanner();
  const [editing, setEditing] = useState(false);
  return <>
    <section id="overview" className="overview" aria-labelledby="dashboard-title">
      <div className="page-heading">
        <div><p className="eyebrow">{t("dashboard.eyebrow")}</p><h1 id="dashboard-title">{t("dashboard.title")}</h1><p className="heading-description">{t("dashboard.description")}</p></div>
        <button className="button secondary" onClick={() => setEditing(!editing)} aria-expanded={editing} aria-controls="balance-settings"><Icon name="edit" size={16} /> {t("dashboard.edit")}</button>
      </div>
      {editing && <BalanceSettings current={balance.currentLsp} target={balance.targetLsp} onSave={(currentLsp, targetLsp) => { setBalance({ currentLsp, targetLsp }); setEditing(false); }} onCancel={() => setEditing(false)} />}
      <ProgressOverview current={balance.currentLsp} target={balance.targetLsp} />
    </section>
    <PlanningSummary />
  </>;
}

function BalanceSettings({ current, target, onSave, onCancel }: { current: number; target: number; onSave: (current: number, target: number) => void; onCancel: () => void }) {
  const { t } = useI18n();
  const [currentValue, setCurrentValue] = useState(String(current));
  const [targetValue, setTargetValue] = useState(String(target));
  const [error, setError] = useState(false);
  return <form id="balance-settings" className="settings-panel" noValidate onSubmit={(event) => {
    event.preventDefault();
    const nextCurrent = Number(currentValue);
    const nextTarget = Number(targetValue);
    if (!/^\d+$/.test(currentValue) || !Number.isSafeInteger(nextCurrent) || !/^\d+$/.test(targetValue) || !Number.isSafeInteger(nextTarget) || nextTarget <= 0) {
      setError(true);
      return;
    }
    onSave(nextCurrent, nextTarget);
  }}>
    <div className="settings-heading"><h2>{t("settings.title")}</h2><p>{t("settings.description")}</p></div>
    <label className="field"><span>{t("settings.current")}</span><input autoFocus type="number" min="0" step="1" required value={currentValue} onChange={(event) => setCurrentValue(event.target.value)} aria-invalid={error} aria-describedby={error ? "settings-error" : undefined} /></label>
    <label className="field"><span>{t("settings.target")}</span><input type="number" min="1" step="1" required value={targetValue} onChange={(event) => setTargetValue(event.target.value)} aria-invalid={error} aria-describedby={error ? "settings-error" : undefined} /></label>
    <div className="settings-actions"><button className="button primary" type="submit">{t("settings.save")}</button><button className="button text-button" type="button" onClick={onCancel}>{t("common.cancel")}</button></div>
    {error && <p className="field-error full-width" id="settings-error" role="alert">{t("validation.balance")}</p>}
  </form>;
}

