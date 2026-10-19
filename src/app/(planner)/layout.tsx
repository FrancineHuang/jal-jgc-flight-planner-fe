import type { ReactNode } from "react";
import { PlannerProvider } from "@/components/planner/planner-provider";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";

export default function PlannerLayout({ children }: { children: ReactNode }) {
  return <PlannerProvider><WorkspaceLayout>{children}</WorkspaceLayout></PlannerProvider>;
}
