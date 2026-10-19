"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/locale-provider";
import { formatNumber } from "@/lib/format";
import { estimateErrorMessage, policyWarningMessage } from "@/lib/lsp/presentation";
import { Icon } from "@/components/ui/icon";
import { useCurrentPolicy } from "./use-current-policy";

export function PoliciesOverview() {
  const { locale, t } = useI18n();
  const { snapshot, error, retry } = useCurrentPolicy();
  return <section className="policies-page" aria-labelledby="policies-title">
    <div className="page-heading"><div><p className="eyebrow">{t("policies.eyebrow")}</p><h1 id="policies-title">{t("policies.title")}</h1><p className="heading-description">{t("policies.description")}</p></div><Link className="button secondary" href="/simulator">{t("nav.planFlight")} <Icon name="arrow" size={16} /></Link></div>
    <div className="policy-note policies-notice"><span className="policy-note-icon"><Icon name="shield" size={23} /></span><div><h2>{t("policy.title")}</h2><p>{t("policy.description")}</p></div><span className="badge warning">{t("common.demoOnly")}</span></div>
    <article className="panel policy-current" aria-labelledby="current-policy-title" aria-busy={!snapshot && !error}>
      <div className="panel-heading"><div className="panel-title"><span className="title-icon"><Icon name="shield" size={18} /></span><h2 id="current-policy-title">{t("policies.current")}</h2></div><span className="badge warning">{t("common.demoOnly")}</span></div>
      <div className="policy-page-body" aria-live="polite">
        {!snapshot && !error && <p className="policy-load-state" role="status"><span className="spinner" />{t("policies.loading")}</p>}
        {!snapshot && !!error && <div className="policy-load-error"><p role="alert">{estimateErrorMessage(error, t)}</p><button type="button" className="button secondary" onClick={retry}><Icon name="reset" size={16} />{t("common.retry")}</button></div>}
        {snapshot && <>
          <dl className="policy-metadata"><div><dt>{t("policies.identifier")}</dt><dd><code>{snapshot.policy.id}</code></dd></div><div><dt>{t("policies.version")}</dt><dd>{snapshot.policy.version}</dd></div><div><dt>{t("policy.verification")}</dt><dd>{t("common.unverified")}</dd></div><div><dt>{t("policies.usageLabel")}</dt><dd>{t("common.demoEstimate")}</dd></div></dl>
          <p className="policy-source">{t("policies.source")}</p>
          <div className="policy-method"><h3>{t("policies.methodology")}</h3><p>{t("policies.segmentMethod", { points: formatNumber(snapshot.policy.lspPerEligibleDomesticSegment, locale) })}</p><p>{t("policies.totalMethod")}</p><p>{t("policies.costMethod")}</p></div>
          <div className="policy-scope"><h3>{t("policies.scope")}</h3><ul className="airport-tags">{snapshot.policy.domesticAirports.map((airport, index) => <li key={`${airport}-${index}`}>{airport}</li>)}</ul><p>{t("policies.scopeHint")}</p></div>
          {snapshot.warnings.map((warning, index) => <p className="policy-api-warning" key={index}>{policyWarningMessage(warning, t)}</p>)}
        </>}
      </div>
    </article>
    <article className="panel policy-limitations"><div className="panel-heading"><div className="panel-title"><span className="title-icon"><Icon name="info" size={18} /></span><h2>{t("policies.limitations")}</h2></div></div><ul>{(["policies.manualLimit", "policies.unknownLimit", "policies.zeroLimit", "policies.carrierLimit", "policies.balanceLimit"] as const).map((key) => <li key={key}>{t(key)}</li>)}</ul></article>
  </section>;
}
