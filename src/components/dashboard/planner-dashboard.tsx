"use client";

import { useState } from "react";
import { DEMO_DASHBOARD } from "@/config/demo";
import { FlightSimulator } from "@/components/simulator/flight-simulator";
import { Icon } from "@/components/ui/icon";
import { ProgressOverview } from "./progress-overview";
import { LanguageSettings } from "./language-settings";
import { useI18n } from "@/i18n/locale-provider";

export function PlannerDashboard() {
  const { t } = useI18n();
  const [balance, setBalance] = useState(DEMO_DASHBOARD);
  const [editing, setEditing] = useState(false);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">{t("nav.skip")}</a>
      <aside className="sidebar sidebar-with-locale">
        <a className="brand" href="#overview" aria-label={t("nav.home")}>
          <span className="brand-symbol"><Icon name="plane" size={23} /></span>
          <span><strong>JGC<span className="brand-dot">.</span></strong><small>{t("nav.brand")}</small></span>
        </a>
        <div className="sidebar-caption">{t("nav.workspace")}</div>
        <nav className="navigation" aria-label={t("nav.main")}>
          <a className="nav-item selected" href="#overview"><Icon name="grid" />{t("nav.overview")}<span className="nav-dot" /></a>
          <a className="nav-item" href="#simulator"><Icon name="plane" />{t("nav.simulator")}</a>
          <a className="nav-item" href="#policy"><Icon name="shield" />{t("nav.policy")}</a>
        </nav>
        <LanguageSettings />
        <div className="sidebar-note">
          <span className="small-icon"><Icon name="route" size={22} /></span>
          <h3>{t("nav.noteTitle")}</h3>
          <p>{t("nav.noteBody")}</p>
          <a href="#simulator">{t("nav.planFlight")} <Icon name="arrow" size={16} /></a>
        </div>
        <div className="sidebar-footer"><span className="prototype-dot" /> {t("nav.independent")}<small>{t("nav.unaffiliated")}</small></div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">{t("nav.workspace")} <Icon name="chevron" size={13} /><span>{t("nav.overview")}</span></div>
          <div className="workspace-tag"><span className="prototype-dot" /> {t("nav.demoWorkspace")}</div>
        </header>
        <main id="main" className="main-content">
          <section id="overview" className="overview" aria-labelledby="dashboard-title">
            <div className="page-heading">
              <div><p className="eyebrow">{t("dashboard.eyebrow")}</p><h1 id="dashboard-title">{t("dashboard.title")}</h1><p className="heading-description">{t("dashboard.description")}</p></div>
              <button className="button secondary" onClick={() => setEditing(!editing)} aria-expanded={editing} aria-controls="balance-settings"><Icon name="edit" size={16} /> {t("dashboard.edit")}</button>
            </div>
            {editing && <BalanceSettings current={balance.currentLsp} target={balance.targetLsp} onSave={(currentLsp, targetLsp) => { setBalance({ currentLsp, targetLsp }); setEditing(false); }} onCancel={() => setEditing(false)} />}
            <ProgressOverview current={balance.currentLsp} target={balance.targetLsp} />
          </section>

          <FlightSimulator />

          <section id="policy" className="policy-note" aria-labelledby="policy-title">
            <span className="policy-note-icon"><Icon name="shield" size={23} /></span>
            <div><h2 id="policy-title">{t("policy.title")}</h2><p>{t("policy.description")}</p></div>
            <span className="badge warning">{t("common.demoOnly")}</span>
          </section>
          <footer className="page-footer"><span>JGC {t("nav.brand")} <span className="footer-divider">/</span> {t("dashboard.footer")}</span><span>{t("dashboard.prototype")} <span className="footer-divider">·</span> {t("dashboard.reset")}</span></footer>
        </main>
      </div>
    </div>
  );
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

