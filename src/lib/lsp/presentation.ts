import { LspApiError } from "./api";
import { dictionaries } from "@/i18n/dictionaries";
import type { Translator } from "@/i18n/dictionaries";

export function estimateErrorMessage(error: unknown, t: Translator): string {
  if (!(error instanceof LspApiError)) return t("errors.unexpected");
  return t(error.kind === "http" && error.status === 400 ? "errors.validation" : `errors.${error.kind}`, { status: error.status ?? "—" });
}

export function policyWarningMessage(warning: string, t: Translator): string {
  return warning === dictionaries.en["policy.warning"] ? t("policy.warning") : warning;
}
