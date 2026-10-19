"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { DEMO_DASHBOARD } from "@/config/demo";
import type { LspEstimate } from "@/lib/lsp/types";
import { useFlightSimulation } from "./use-flight-simulation";

export type PolicySnapshot = Pick<LspEstimate, "policy" | "warnings">;
type Balance = typeof DEMO_DASHBOARD;

const PlannerContext = createContext<{
  balance: Balance;
  setBalance: Dispatch<SetStateAction<Balance>>;
  simulation: ReturnType<typeof useFlightSimulation>;
  policySnapshot: PolicySnapshot | null;
  recordPolicy: (snapshot: PolicySnapshot) => void;
} | null>(null);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(DEMO_DASHBOARD);
  const [policySnapshot, setPolicySnapshot] = useState<PolicySnapshot | null>(null);
  const recordPolicy = useCallback((snapshot: PolicySnapshot) => {
    setPolicySnapshot({ policy: snapshot.policy, warnings: snapshot.warnings });
  }, []);
  const simulation = useFlightSimulation(recordPolicy);
  return <PlannerContext.Provider value={{ balance, setBalance, simulation, policySnapshot, recordPolicy }}>{children}</PlannerContext.Provider>;
}

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (!context) throw new Error("usePlanner must be used within PlannerProvider");
  return context;
}
