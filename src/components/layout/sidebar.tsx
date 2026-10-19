"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PLANNER_NAVIGATION } from "@/config/navigation";
import { useI18n } from "@/i18n/locale-provider";
import { LanguageSettings } from "@/components/dashboard/language-settings";
import { Icon } from "@/components/ui/icon";

export function Sidebar() {
  const { t } = useI18n();
  const pathname = usePathname();
  return <aside className="sidebar sidebar-with-locale">
    <Link className="brand" href="/dashboard" aria-label={t("nav.home")}>
      <span className="brand-symbol"><Icon name="plane" size={23} /></span>
      <span><strong>JGC<span className="brand-dot">.</span></strong><small>{t("nav.brand")}</small></span>
    </Link>
    <div className="sidebar-caption">{t("nav.workspace")}</div>
    <nav className="navigation" aria-label={t("nav.main")}>
      {PLANNER_NAVIGATION.map((item) => {
        const active = pathname === item.href;
        return <Link key={item.href} className={`nav-item${active ? " selected" : ""}`} href={item.href} aria-current={active ? "page" : undefined}>
          <Icon name={item.icon} />{t(item.label)}{active && <span className="nav-dot" />}
        </Link>;
      })}
    </nav>
    <LanguageSettings />
    <div className="sidebar-note">
      <span className="small-icon"><Icon name="route" size={22} /></span>
      <h3>{t("nav.noteTitle")}</h3>
      <p>{t("nav.noteBody")}</p>
      <Link href="/simulator">{t("nav.planFlight")} <Icon name="arrow" size={16} /></Link>
    </div>
    <div className="sidebar-footer"><span className="prototype-dot" /> {t("nav.independent")}<small>{t("nav.unaffiliated")}</small></div>
  </aside>;
}
