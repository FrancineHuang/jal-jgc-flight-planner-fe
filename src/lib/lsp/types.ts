// Mirrors the separate Express API. All flight-point calculations belong there.
export type Eligibility = "eligible" | "ineligible" | "unknown";
export interface FlightSegment {
  origin: string;
  destination: string;
  departureDate: string;
  marketingCarrier: string;
  eligibility: Eligibility;
}
export interface EstimateRequest {
  totalAirfareJpy: number;
  segments: FlightSegment[];
}
export type SegmentReason = "eligible_domestic_demo" | "ineligible" | "eligibility_unknown" | "route_outside_policy_scope";
export interface SegmentEstimate extends FlightSegment {
  segmentIndex: number;
  estimatedLsp: number | null;
  reason: SegmentReason;
}
export interface LspEstimate {
  totalAirfareJpy: number;
  estimatedTotalLsp: number | null;
  jpyPerLsp: number | null;
  breakdown: SegmentEstimate[];
  policy: {
    id: string;
    version: string;
    verificationStatus: "unverified";
    usage: "demonstration_only";
    lspPerEligibleDomesticSegment: number;
    domesticAirports: string[];
  };
  warnings: string[];
}
export interface SimulatorInput {
  tripType: "round-trip" | "one-way";
  origin: string;
  destination: string;
  outboundDate: string;
  returnDate: string;
  marketingCarrier: string;
  airfare: string;
  outboundEligibility: Eligibility;
  returnEligibility: Eligibility;
}
export type ValidationMessageKey =
  | "validation.airport" | "validation.destination" | "validation.carrier"
  | "validation.departureDate" | "validation.returnDate" | "validation.dateOrder"
  | "validation.airfare" | "validation.eligibility";
export type FieldErrors = Partial<Record<keyof SimulatorInput, ValidationMessageKey>>;
export type EstimateState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "success"; estimate: LspEstimate };
