"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/locale-provider";
import { usePlanner } from "@/components/planner/planner-provider";
import { formatJpy, formatNumber } from "@/lib/format";
import { Icon } from "@/components/ui/icon";

export function PlanningSummary() {
  const { locale, t } = useI18n();
  const { simulation } = usePlanner();
  const estimate = simulation.lastEstimate;
  return <section className="panel planning-summary" aria-labelledby="planning-title">
    <div className="panel-heading"><div className="panel-title"><span className="title-icon"><Icon name="route" size={18} /></span><h2 id="planning-title">{t("summary.title")}</h2></div><span className="badge neutral">{t(simulation.state.status === "loading" ? "form.estimating" : "common.demoEstimate")}</span></div>
    <div className="planning-summary-body">
      {estimate ? <>
        <p className="eyebrow">{t("summary.latest")}</p>
        <h3 className="summary-route">{[estimate.breakdown[0].origin, ...estimate.breakdown.map((segment) => segment.destination)].join(" → ")}</h3>
        <p className="summary-caption">{t(estimate.breakdown.length === 1 ? "result.segmentCountOne" : "result.segmentCount", { count: formatNumber(estimate.breakdown.length, locale) })}</p>
        <dl className="summary-facts">
          <div><dt>{t("result.estimatedLsp")}</dt><dd>{estimate.estimatedTotalLsp === null ? t("common.pending") : `+${formatNumber(estimate.estimatedTotalLsp, locale)} ${t("common.lsp")}`}</dd></div>
          <div><dt>{t("result.totalAirfare")}</dt><dd>{formatJpy(estimate.totalAirfareJpy, locale)}</dd></div>
          <div><dt>{t("result.costPerLsp")}</dt><dd>{estimate.jpyPerLsp === null ? "—" : formatJpy(estimate.jpyPerLsp, locale)}</dd></div>
        </dl>
        <p className="summary-caption">{t("result.balanceUnchanged")}</p>
      </> : <div className="summary-empty"><span className="metric-icon red"><Icon name="plane" size={21} /></span><div><h3>{t("summary.emptyTitle")}</h3><p>{t("summary.emptyBody")}</p></div></div>}
      <div className="summary-actions"><Link className="button primary" href="/simulator">{t(estimate ? "summary.continue" : "nav.planFlight")} <Icon name="arrow" size={16} /></Link><Link className="text-link" href="/policies">{t("summary.aboutEstimates")} <Icon name="chevron" size={14} /></Link></div>
    </div>
  </section>;
}
