import type { EstimateRequest, LspEstimate } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const TIMEOUT_MS = 15_000;

// Stable error categories let the UI translate errors without parsing English messages.
export type ApiErrorKind = "configuration" | "timeout" | "network" | "format" | "http";
export class LspApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = "LspApiError";
    this.kind = kind;
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isNonnegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
function isNullableNumber(value: unknown): value is number | null {
  return value === null || isNonnegative(value);
}
function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Reject incompatible responses rather than presenting malformed data as an entitlement.
export function isLspEstimate(value: unknown): value is LspEstimate {
  if (!isRecord(value) || !isRecord(value.policy)) return false;
  const policy = value.policy;
  return isNonnegative(value.totalAirfareJpy)
    && isNullableNumber(value.estimatedTotalLsp) && isNullableNumber(value.jpyPerLsp)
    && Array.isArray(value.breakdown) && value.breakdown.length > 0
    && value.breakdown.every((segment: unknown) => isRecord(segment)
      && typeof segment.origin === "string" && /^[A-Z]{3}$/.test(segment.origin)
      && typeof segment.destination === "string" && /^[A-Z]{3}$/.test(segment.destination)
      && isDate(segment.departureDate) && typeof segment.marketingCarrier === "string" && /^[A-Z0-9]{2}$/.test(segment.marketingCarrier)
      && ["eligible", "ineligible", "unknown"].includes(String(segment.eligibility))
      && Number.isSafeInteger(segment.segmentIndex) && isNonnegative(segment.segmentIndex)
      && isNullableNumber(segment.estimatedLsp)
      && ["eligible_domestic_demo", "ineligible", "eligibility_unknown", "route_outside_policy_scope"].includes(String(segment.reason)))
    && typeof policy.id === "string" && policy.id.length > 0 && typeof policy.version === "string"
    && policy.verificationStatus === "unverified" && policy.usage === "demonstration_only"
    && isNonnegative(policy.lspPerEligibleDomesticSegment)
    && Array.isArray(policy.domesticAirports) && policy.domesticAirports.every((airport: unknown) => typeof airport === "string")
    && Array.isArray(value.warnings) && value.warnings.every((warning: unknown) => typeof warning === "string");
}

export async function requestLspEstimate(request: EstimateRequest, signal?: AbortSignal): Promise<LspEstimate> {
  if (!API_BASE_URL) throw new LspApiError("configuration", "The API URL is not configured. Set NEXT_PUBLIC_API_BASE_URL and restart the frontend.");
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE_URL.replace(/\/+$/, "")}/api/v1/lsp/estimates`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request), signal: controller.signal, cache: "no-store",
    });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      let detail = "Please check the itinerary and try again.";
      if (isRecord(payload) && isRecord(payload.error) && typeof payload.error.message === "string") {
        detail = payload.error.message;
        if (Array.isArray(payload.error.issues)) {
          const issues = payload.error.issues.filter(isRecord).map((issue) => {
            const path = Array.isArray(issue.path) ? issue.path.join(".") : "Input";
            return typeof issue.message === "string" ? `${path}: ${issue.message}` : "";
          }).filter(Boolean);
          if (issues.length) detail += ` — ${issues.join("; ")}`;
        }
      }
      throw new LspApiError("http", `Estimate failed (${response.status}). ${detail}`, response.status);
    }
    if (!isLspEstimate(payload)) throw new LspApiError("format", "The API returned an unsupported estimate format. Please try again after checking the backend version.");
    return payload;
  } catch (error) {
    if (timedOut) throw new LspApiError("timeout", "The estimate request timed out. Please try again.");
    if (signal?.aborted) throw error;
    if (error instanceof TypeError) throw new LspApiError("network", "Cannot reach the estimate API. Check that the backend is running and allows this frontend origin, then try again.");
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}
