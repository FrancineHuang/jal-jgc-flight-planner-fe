"use client";

import { useEffect, useRef, useState } from "react";
import { DEMO_ITINERARY, INITIAL_ITINERARY } from "@/config/demo";
import { requestLspEstimate } from "@/lib/lsp/api";
import { toEstimateRequest, validateItinerary } from "@/lib/lsp/validation";
import type { EstimateState, FieldErrors, LspEstimate, SimulatorInput } from "@/lib/lsp/types";

// Owned by the shared planner layout, so drafts and results survive route changes.
export function useFlightSimulation(onEstimate: (estimate: LspEstimate) => void) {
  const [input, setInput] = useState<SimulatorInput>(INITIAL_ITINERARY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<EstimateState>({ status: "idle" });
  const [lastEstimate, setLastEstimate] = useState<LspEstimate | null>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  function clearResult() {
    setErrors({});
    setState({ status: "idle" });
  }
  function update<K extends keyof SimulatorInput>(key: K, value: SimulatorInput[K]) {
    setInput((previous) => ({ ...previous, [key]: value }));
    clearResult();
  }
  function loadDemo() {
    setInput({ ...DEMO_ITINERARY });
    clearResult();
  }
  function swapAirports() {
    setInput((previous) => ({ ...previous, origin: previous.destination, destination: previous.origin }));
    clearResult();
  }
  async function estimate(): Promise<boolean> {
    if (state.status === "loading") return true;
    const nextErrors = validateItinerary(input);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setState({ status: "idle" });
      return false;
    }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState({ status: "loading" });
    try {
      const result = await requestLspEstimate(toEstimateRequest(input), controller.signal);
      if (!controller.signal.aborted) {
        setState({ status: "success", estimate: result });
        setLastEstimate(result);
        onEstimate(result);
      }
    } catch (error) {
      if (!controller.signal.aborted) setState({ status: "error", error });
    }
    return true;
  }
  return { input, errors, state, lastEstimate, update, loadDemo, swapAirports, estimate };
}
