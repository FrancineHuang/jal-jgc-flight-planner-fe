import type { SimulatorInput } from "@/lib/lsp/types";

// Temporary, manually editable values. No account data or official qualification threshold.
export const DEMO_DASHBOARD = { currentLsp: 860, targetLsp: 1500 };
export const DEMO_ITINERARY: SimulatorInput = {
  tripType: "round-trip",
  origin: "HND",
  destination: "OKA",
  outboundDate: "2026-11-01",
  returnDate: "2026-11-03",
  marketingCarrier: "JL",
  airfare: "35000",
  outboundEligibility: "eligible",
  returnEligibility: "eligible",
};

// Airports never imply eligibility. A user must choose or explicitly load the demo.
export const INITIAL_ITINERARY: SimulatorInput = {
  ...DEMO_ITINERARY,
  outboundDate: "",
  returnDate: "",
  airfare: "",
  outboundEligibility: "unknown",
  returnEligibility: "unknown",
};
