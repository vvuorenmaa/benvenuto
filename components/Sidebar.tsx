"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageSquare, BookOpen, History, GraduationCap } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Keskustelu", icon: MessageSquare },
  { href: "/sanasto", label: "Sanasto", icon: BookOpen },
  { href: "/kertaus", label: "Kertaus", icon: History },
  { href: "/kielioppi", label: "Kielioppi", icon: GraduationCap },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadDueCount() {
      try {
        const res = await fetch("/api/vocab?due=true");
        if (!res.ok) return;
        const data: unknown[] = await res.json();
        if (!cancelled) setDueCount(data.length);
      } catch {
        // hiljainen epäonnistuminen — badge jää vain näyttämättä
      }
    }

    loadDueCount();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <>
      {/* Desktop-sivupalkki */}
      <nav
        aria-label="Päänavigaatio"
        className="hidden md:flex md:w-56 md:shrink-0 md:flex-col md:border-r md:border-zinc-200 dark:md:border-zinc-800 md:p-4 md:space-y-2"
      >
        <p className="flex items-center gap-2 font-semibold mb-4 px-2">
          Benvenuto
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" aria-hidden="true" />
        </p>
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const showBadge = item.href === "/kertaus" && dueCount > 0;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-label={
                showBadge ? `${item.label}, ${dueCount} sanaa odottaa kertausta` : undefined
              }
              className={`relative flex items-center justify-between gap-2 rounded-lg px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                active
                  ? "bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-white"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {active && (
                <span
                  className="absolute left-0 inset-y-1.5 w-0.5 rounded-r-full bg-indigo-500"
                  aria-hidden="true"
                />
              )}
              <span className="flex items-center gap-2">
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </span>
              {showBadge && (
                <span className="rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs px-1.5 py-0.5">
                  {dueCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Mobiili-alapalkki */}
      <nav
        aria-label="Päänavigaatio"
        className="fixed bottom-0 inset-x-0 z-30 flex md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const showBadge = item.href === "/kertaus" && dueCount > 0;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-label={
                showBadge ? `${item.label}, ${dueCount} sanaa odottaa kertausta` : item.label
              }
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                active
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <span className="relative" aria-hidden="true">
                <Icon className="h-5 w-5" />
                {showBadge && (
                  <span className="absolute -top-1 -right-2 rounded-full bg-indigo-600 text-white text-[10px] leading-none px-1 py-0.5">
                    {dueCount}
                  </span>
                )}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
