"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PLANNER_NAVIGATION } from "@/config/navigation";
import { useI18n } from "@/i18n/locale-provider";
import { Icon } from "@/components/ui/icon";
import { Sidebar } from "./sidebar";
import "./workspace.css";

export function WorkspaceLayout({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const active = PLANNER_NAVIGATION.find((item) => item.href === pathname);
  return <div className="app-shell">
    <a className="skip-link" href="#main">{t("nav.skip")}</a>
    <Sidebar />
    <div className="main-shell">
      <header className="topbar">
        <div className="breadcrumb">{t("nav.workspace")} <Icon name="chevron" size={13} /><span>{active && t(active.label)}</span></div>
        <div className="workspace-tag"><span className="prototype-dot" /> {t("nav.demoWorkspace")}</div>
      </header>
      <main id="main" className="main-content">{children}</main>
      <footer className="page-footer workspace-footer"><span>JGC {t("nav.brand")} <span className="footer-divider">/</span> {t("dashboard.footer")}</span><span>{t("dashboard.prototype")} <span className="footer-divider">·</span> {t("dashboard.reset")}</span></footer>
    </div>
  </div>;
}
