"use client";

import { useEffect, useRef, useState } from "react";
import { DEMO_ITINERARY, INITIAL_ITINERARY } from "@/config/demo";
import { requestLspEstimate } from "@/lib/lsp/api";
import { toEstimateRequest, validateItinerary } from "@/lib/lsp/validation";
import type { EstimateState, FieldErrors, SimulatorInput } from "@/lib/lsp/types";
import { Icon } from "@/components/ui/icon";
import { EstimateResults } from "./estimate-results";
import { useI18n } from "@/i18n/locale-provider";

export function FlightSimulator() {
  const { t } = useI18n();
  const [input, setInput] = useState<SimulatorInput>(INITIAL_ITINERARY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<EstimateState>({ status: "idle" });
  const request = useRef<AbortController | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const loading = state.status === "loading";
  useEffect(() => () => request.current?.abort(), []);

  function update<K extends keyof SimulatorInput>(key: K, value: SimulatorInput[K]) {
    setInput((previous) => ({ ...previous, [key]: value }));
    setErrors({});
    setState({ status: "idle" });
  }
  function loadDemo() {
    setInput({ ...DEMO_ITINERARY });
    setErrors({});
    setState({ status: "idle" });
  }
  async function estimate() {
    const nextErrors = validateItinerary(input);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setState({ status: "idle" });
      // Wait for inline errors and aria-invalid to render before moving focus.
      requestAnimationFrame(() => form.current?.querySelector<HTMLInputElement>("[aria-invalid=true]")?.focus());
      return;
    }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState({ status: "loading" });
    try {
      const result = await requestLspEstimate(toEstimateRequest(input), controller.signal);
      if (!controller.signal.aborted) setState({ status: "success", estimate: result });
    } catch (error) {
      if (!controller.signal.aborted) setState({ status: "error", error });
    }
  }
  const errorProps = (field: keyof SimulatorInput) => ({ "aria-invalid": !!errors[field], "aria-describedby": errors[field] ? `${field}-error` : undefined });
  const fieldError = (field: keyof SimulatorInput) => {
    const key = errors[field];
    return key && <small className="field-error" id={`${field}-error`}>{t(key)}</small>;
  };

  return <section id="simulator" aria-labelledby="simulator-title" className="simulator-section">
    <div className="section-heading"><div><p className="eyebrow">{t("simulator.eyebrow")}</p><h2 id="simulator-title">{t("simulator.title")}</h2><p>{t("simulator.description")}</p></div><span className="section-kicker"><Icon name="plane" size={15} /> {t("simulator.kicker")}</span></div>
    <div className="simulator-grid">
      <article className="panel simulator-panel">
        <div className="panel-heading"><div className="panel-title"><span className="title-icon"><Icon name="plane" size={18} /></span><h3>{t("form.itinerary")}</h3></div><button className="text-link" type="button" onClick={loadDemo} disabled={loading}><Icon name="spark" size={14} /> {t("form.demo")}</button></div>
        <form ref={form} noValidate onSubmit={(event) => { event.preventDefault(); if (!loading) void estimate(); }}>
          <fieldset disabled={loading} className="simulator-fields">
            <legend className="sr-only">{t("form.legend")}</legend>
            <div className="trip-toggle" role="group" aria-label={t("form.tripType")}><button type="button" aria-pressed={input.tripType === "round-trip"} className={input.tripType === "round-trip" ? "active" : ""} onClick={() => update("tripType", "round-trip")}>{t("form.roundTrip")}</button><button type="button" aria-pressed={input.tripType === "one-way"} className={input.tripType === "one-way" ? "active" : ""} onClick={() => update("tripType", "one-way")}>{t("form.oneWay")}</button></div>

            <div className="route-fields">
              <label className="field airport-field"><span>{t("form.from")}</span><input name="origin" aria-label={t("form.originLabel")} type="text" maxLength={3} value={input.origin} onChange={(event) => update("origin", event.target.value.toUpperCase())} placeholder="HND" autoComplete="off" required {...errorProps("origin")} /><small>{t("form.originHint")}</small>{fieldError("origin")}</label>
              <button className="swap-button" type="button" aria-label={t("form.swap")} onClick={() => { setInput((previous) => ({ ...previous, origin: previous.destination, destination: previous.origin })); setErrors({}); setState({ status: "idle" }); }}><Icon name="swap" size={17} /></button>
              <label className="field airport-field"><span>{t("form.to")}</span><input name="destination" aria-label={t("form.destinationLabel")} type="text" maxLength={3} value={input.destination} onChange={(event) => update("destination", event.target.value.toUpperCase())} placeholder="OKA" autoComplete="off" required {...errorProps("destination")} /><small>{t("form.destinationHint")}</small>{fieldError("destination")}</label>
            </div>

            <div className="field-grid">
              <label className="field"><span>{t("form.departure")}</span><input type="date" name="outboundDate" value={input.outboundDate} onChange={(event) => update("outboundDate", event.target.value)} required {...errorProps("outboundDate")} />{fieldError("outboundDate")}</label>
              {input.tripType === "round-trip" && <label className="field"><span>{t("form.returnDate")}</span><input type="date" name="returnDate" min={input.outboundDate || undefined} value={input.returnDate} onChange={(event) => update("returnDate", event.target.value)} required {...errorProps("returnDate")} />{fieldError("returnDate")}</label>}
              <label className="field"><span>{t("form.airfare")} <span className="label-hint">{t("common.jpy")}</span></span><div className="input-prefix"><span>¥</span><input type="number" name="airfare" min="0" step="1" inputMode="numeric" placeholder="35,000" value={input.airfare} onChange={(event) => update("airfare", event.target.value)} required {...errorProps("airfare")} /></div><small>{t("form.airfareHint")}</small>{fieldError("airfare")}</label>
              <label className="field"><span>{t("form.carrier")}</span><input type="text" name="marketingCarrier" maxLength={2} value={input.marketingCarrier} onChange={(event) => update("marketingCarrier", event.target.value.toUpperCase())} placeholder="JL" required {...errorProps("marketingCarrier")} /><small>{t("form.carrierHint")}</small>{fieldError("marketingCarrier")}</label>
            </div>

            <div className="eligibility-section"><div className="eligibility-heading"><h4>{t("form.eligibility")}</h4><span>{t("form.manual")}</span></div>
              <p>{t("form.eligibilityHint")}</p>
              <div className="field-grid">
                <label className="field"><span>{t("form.outbound")} <span className="label-hint">{input.origin || "—"} → {input.destination || "—"}</span></span><select name="outboundEligibility" value={input.outboundEligibility} onChange={(event) => update("outboundEligibility", event.target.value as SimulatorInput["outboundEligibility"])} {...errorProps("outboundEligibility")}><EligibilityOptions /></select>{fieldError("outboundEligibility")}</label>
                {input.tripType === "round-trip" && <label className="field"><span>{t("form.return")} <span className="label-hint">{input.destination || "—"} → {input.origin || "—"}</span></span><select name="returnEligibility" value={input.returnEligibility} onChange={(event) => update("returnEligibility", event.target.value as SimulatorInput["returnEligibility"])} {...errorProps("returnEligibility")}><EligibilityOptions /></select>{fieldError("returnEligibility")}</label>}
              </div>
            </div>
            {Object.keys(errors).length > 0 && <p className="field-error" role="alert">{t("form.correctErrors")}</p>}
            <button className="button primary estimate-button" type="submit">{loading ? <><span className="spinner" /> {t("form.estimating")}</> : <>{t("form.submit")} <Icon name="arrow" size={18} /></>}</button>
            <p className="form-footnote"><Icon name="shield" size={13} /> {t("form.disclaimer")}</p>
          </fieldset>
        </form>
      </article>
      <EstimateResults state={state} onRetry={() => void estimate()} />
    </div>
  </section>;
}

function EligibilityOptions() {
  const { t } = useI18n();
  return <><option value="unknown">{t("form.unknown")}</option><option value="eligible">{t("form.eligible")}</option><option value="ineligible">{t("form.ineligible")}</option></>;
}
