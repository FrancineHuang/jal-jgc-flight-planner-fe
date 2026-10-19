"use client";

import { useEffect, useState } from "react";
import { usePlanner } from "@/components/planner/planner-provider";
import { DEMO_ITINERARY } from "@/config/demo";
import { requestLspEstimate } from "@/lib/lsp/api";
import { toEstimateRequest } from "@/lib/lsp/validation";

export function useCurrentPolicy() {
  const { policySnapshot, recordPolicy } = usePlanner();
  const [error, setError] = useState<unknown>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (policySnapshot) return;
    const controller = new AbortController();
    // The existing API exposes policy metadata through estimates, not a policy GET.
    // This read does not populate the user's simulation or dashboard summary.
    requestLspEstimate(toEstimateRequest(DEMO_ITINERARY), controller.signal).then((estimate) => {
      if (!controller.signal.aborted) recordPolicy(estimate);
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(reason);
    });
    return () => controller.abort();
  }, [policySnapshot, recordPolicy, attempt]);
  function retry() {
    setError(null);
    setAttempt((previous) => previous + 1);
  }
  return { snapshot: policySnapshot, error, retry };
}
