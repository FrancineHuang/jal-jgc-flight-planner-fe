"use client";

import { formatNumber } from "@/lib/format";
import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/i18n/locale-provider";

export function ProgressOverview({ current, target }: { current: number; target: number }) {
  const { locale, t } = useI18n();
  const number = (value: number) => formatNumber(value, locale);
  const remaining = Math.max(0, target - current);
  const progress = Math.min(100, current / target * 100);
  return <div className="overview-grid">
    <article className="journey-card">
      <div className="journey-top"><span><span className="live-dot" /> {t("progress.journey")}</span><span className="demo-label">{t("progress.demoBalance")}</span></div>
      <div className="journey-balance"><strong>{number(current)}</strong><span>{t("common.lifeStatusPoints")}</span></div>
      <div className="journey-progress-label"><span>{t("progress.towardTarget")}</span><strong>{number(progress)}%</strong></div>
      <div className="progress-track" role="progressbar" aria-label={t("progress.label")} aria-valuenow={Number(progress.toFixed(1))} aria-valuemin={0} aria-valuemax={100} aria-valuetext={t("progress.accessible", { current: number(current), target: number(target), progress: number(progress) })}><span style={{ width: `${progress}%` }} /></div>
      <div className="journey-bottom"><span>0 {t("common.lsp")}</span><span>{t("progress.targetValue", { target: number(target) })} <Icon name="target" size={14} /></span></div>
      <svg className="journey-art" viewBox="0 0 450 280" fill="none" aria-hidden="true"><circle cx="360" cy="80" r="90" /><circle cx="360" cy="80" r="135" /><circle cx="360" cy="80" r="180" /><path d="M180 290C190 170 360 260 460 40" strokeDasharray="5 7" /></svg>
    </article>
    <div className="metric-stack">
      <article className="metric-card"><div className="metric-icon"><Icon name="target" size={20} /></div><div><p>{t("progress.personalTarget")}</p><strong>{number(target)} <span>{t("common.lsp")}</span></strong><small>{t("progress.setDestination")}</small></div><span className="metric-tag">{t("progress.configurable")}</span></article>
      <article className="metric-card"><div className="metric-icon red"><Icon name={remaining === 0 ? "check" : "route"} size={20} /></div><div><p>{t("progress.remaining")}</p><strong>{number(remaining)} <span>{t("common.lsp")}</span></strong><small>{t(remaining === 0 ? "progress.reached" : "progress.oneJourney")}</small></div></article>
    </div>
  </div>;
}
