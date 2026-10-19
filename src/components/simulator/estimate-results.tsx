"use client";

import { formatDate, formatJpy, formatNumber } from "@/lib/format";
import type { EstimateState, LspEstimate } from "@/lib/lsp/types";
import Link from "next/link";
import { estimateErrorMessage, policyWarningMessage } from "@/lib/lsp/presentation";
import { useI18n } from "@/i18n/locale-provider";
import { Icon } from "@/components/ui/icon";

export function EstimateResults({ state, onRetry }: { state: EstimateState; onRetry: () => void }) {
  const { t } = useI18n();
  return <article className="panel results-panel" aria-labelledby="estimate-title" aria-busy={state.status === "loading"}>
    <div className="panel-heading"><div className="panel-title"><span className="title-icon"><Icon name="route" size={18} /></span><h3 id="estimate-title">{t("result.title")}</h3></div><span className="badge neutral">{t("common.demoEstimate")}</span></div>
    <div className="result-content" aria-live="polite" aria-atomic="true">
      {state.status === "idle" && <div className="result-placeholder">
        <div className="outlook-illustration" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><span className="orbit-point" /><span className="illustration-plane"><Icon name="plane" size={32} /></span><span className="illustration-cloud">+ {t("common.lsp")}</span></div>
        <span className="eyebrow">{t("result.emptyEyebrow")}</span><h4>{t("result.emptyTitle")}</h4><p>{t("result.emptyBody")}</p><div className="empty-detail"><span><Icon name="check" size={14} /> {t("result.lspFeature")}</span><span><Icon name="check" size={14} /> {t("result.costFeature")}</span></div>
      </div>}
      {state.status === "loading" && <div className="result-placeholder loading-placeholder"><span className="loading-orbit"><Icon name="plane" size={30} /></span><h4>{t("result.loadingTitle")}</h4><p>{t("result.loadingBody")}</p><div className="skeleton-line" /><div className="skeleton-line short" /></div>}
      {state.status === "error" && <div className="result-placeholder error-placeholder"><span className="error-icon"><Icon name="info" size={30} /></span><h4>{t("result.errorTitle")}</h4><p role="alert">{estimateErrorMessage(state.error, t)}</p><button type="button" className="button secondary" onClick={onRetry}><Icon name="reset" size={16} /> {t("common.retry")}</button></div>}
      {state.status === "success" && <EstimateDetails estimate={state.estimate} />}
    </div>
    {state.status !== "success" && <div className="outlook-footer"><Icon name="info" size={16} /><p>{t("result.noBalanceChange")}</p></div>}
  </article>;
}

function EstimateDetails({ estimate }: { estimate: LspEstimate }) {
  const { locale, t } = useI18n();
  const unresolved = estimate.estimatedTotalLsp === null;
  return <div className="estimate-details">
    <div className="estimate-summary">
      <div className="estimate-metric"><p>{t("result.estimatedLsp")}</p><strong>{unresolved ? t("common.pending") : `+${formatNumber(estimate.estimatedTotalLsp!, locale)}`}<span>{!unresolved && ` ${t("common.lsp")}`}</span></strong><small>{t(unresolved ? "result.unresolvedSegments" : "result.itineraryOnly")}</small></div>
      <div className="estimate-metric"><p>{t("result.costPerLsp")}</p><strong className="cost-value">{estimate.jpyPerLsp === null ? "—" : formatJpy(estimate.jpyPerLsp, locale)}</strong><small>{t(estimate.jpyPerLsp === null ? (unresolved ? "result.awaiting" : "result.zeroCost") : "result.roundedCost")}</small></div>
    </div>
    <div className="fare-summary"><span>{t("result.totalAirfare")}</span><strong>{formatJpy(estimate.totalAirfareJpy, locale)}</strong></div>
    {unresolved && <div className="unresolved-note"><Icon name="info" size={16} /><p>{t("result.pendingNote")}</p></div>}
    <div className="breakdown-heading"><h4>{t("result.breakdown")}</h4><span>{t(estimate.breakdown.length === 1 ? "result.segmentCountOne" : "result.segmentCount", { count: formatNumber(estimate.breakdown.length, locale) })}</span></div>
    <ol className="segment-list">{estimate.breakdown.map((segment) => <li key={segment.segmentIndex} className="segment-item">
      <div className="segment-number">{String(segment.segmentIndex + 1).padStart(2, "0")}</div>
      <div className="segment-info"><div className="segment-route">{segment.origin}<Icon name="arrow" size={15} />{segment.destination}</div><p>{formatDate(segment.departureDate, locale)} <span>·</span> {segment.marketingCarrier}</p><small>{t(`reason.${segment.reason}`)}</small></div>
      <div className={`segment-points ${segment.estimatedLsp === null ? "pending" : ""}`}><strong>{segment.estimatedLsp === null ? t("common.pending") : `+${formatNumber(segment.estimatedLsp, locale)}`}</strong><small>{t(segment.estimatedLsp === null ? "result.unresolved" : "result.demoLsp")}</small></div>
    </li>)}</ol>
    <div className="policy-details"><div><Icon name="shield" size={16} /><strong>{t("policy.verification")}</strong><span className="badge warning">{t("common.unverified")}</span></div><p><code>{estimate.policy.id}</code> <span>·</span> v{estimate.policy.version}</p><small>{t("policy.usage")}</small>{estimate.warnings.map((warning, index) => <p className="api-warning" key={index}>{policyWarningMessage(warning, t)}</p>)}<Link className="text-link" href="/policies">{t("summary.aboutEstimates")} <Icon name="chevron" size={13} /></Link></div>
    <p className="result-footnote"><Icon name="info" size={13} /> {t("result.balanceUnchanged")}</p>
  </div>;
}
