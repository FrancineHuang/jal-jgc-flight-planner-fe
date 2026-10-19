import type { EstimateRequest, FieldErrors, SimulatorInput } from "./types";

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000")) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateItinerary(input: SimulatorInput): FieldErrors {
  const errors: FieldErrors = {};
  const origin = input.origin.trim().toUpperCase();
  const destination = input.destination.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(origin)) errors.origin = "validation.airport";
  if (!/^[A-Z]{3}$/.test(destination)) errors.destination = "validation.airport";
  else if (origin === destination) errors.destination = "validation.destination";
  if (!/^[A-Z0-9]{2}$/.test(input.marketingCarrier.trim().toUpperCase())) errors.marketingCarrier = "validation.carrier";
  if (!isCalendarDate(input.outboundDate)) errors.outboundDate = "validation.departureDate";
  if (input.tripType === "round-trip") {
    if (!isCalendarDate(input.returnDate)) errors.returnDate = "validation.returnDate";
    else if (!errors.outboundDate && input.returnDate < input.outboundDate) errors.returnDate = "validation.dateOrder";
  }
  if (!/^\d+$/.test(input.airfare) || !Number.isSafeInteger(Number(input.airfare))) errors.airfare = "validation.airfare";
  for (const field of ["outboundEligibility", "returnEligibility"] as const) {
    if (field === "returnEligibility" && input.tripType === "one-way") continue;
    if (!["eligible", "ineligible", "unknown"].includes(input[field])) errors[field] = "validation.eligibility";
  }
  return errors;
}

export function toEstimateRequest(input: SimulatorInput): EstimateRequest {
  const outbound = {
    origin: input.origin.trim().toUpperCase(),
    destination: input.destination.trim().toUpperCase(),
    departureDate: input.outboundDate,
    marketingCarrier: input.marketingCarrier.trim().toUpperCase(),
    eligibility: input.outboundEligibility,
  };
  return {
    totalAirfareJpy: Number(input.airfare),
    segments: input.tripType === "one-way" ? [outbound] : [outbound, {
      ...outbound,
      origin: outbound.destination,
      destination: outbound.origin,
      departureDate: input.returnDate,
      eligibility: input.returnEligibility,
    }],
  };
}
